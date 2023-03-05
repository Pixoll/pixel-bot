"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const minecraft_server_util_1 = require("minecraft-server-util");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'What sub-command do you want to use?',
        type: 'string',
        oneOf: ['check', 'java', 'bedrock', 'save-java', 'save-bedrock'],
        default: 'check',
        parse(value) {
            return value.toLowerCase();
        },
    }, {
        key: 'ip',
        prompt: 'What is the IP of the server you want to save/look for?',
        type: 'string',
        required: false,
        isEmpty(_, message) {
            const subCommand = (0, utils_1.getSubCommand)(message);
            return subCommand === 'check';
        },
        async validate(value, message, argument) {
            const subCommand = (0, utils_1.getSubCommand)(message);
            if (subCommand !== 'check')
                return true;
            const isValid = await argument.type?.validate(value, message, argument) ?? true;
            return isValid;
        },
    }, {
        key: 'port',
        prompt: 'What is the port of the server you want to save/look for?',
        type: 'integer',
        min: 1,
        max: 65535,
        required: false,
    }];
const defaultServerOptions = [{
        type: discord_js_1.ApplicationCommandOptionType.String,
        name: 'ip',
        description: 'The IP of the server to look for.',
        required: true,
    }, {
        type: discord_js_1.ApplicationCommandOptionType.Integer,
        name: 'port',
        description: 'The port of the server to look for.',
        minValue: 1,
        maxValue: 65535,
    }];
class McStatusCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'mc-status',
            aliases: ['mcstatus'],
            group: 'misc',
            description: 'Displays information of a Java/Bedrock Minecraft server.',
            details: '`ip` has to be a valid server IP, and `port` a valid server port.',
            format: (0, common_tags_1.stripIndent) `
                mc-status <check> - Status of the saved server.
                mc-status java [ip] <port> - Status of a Java server.
                mc-status bedrock [ip] <port> - Status of a Bedrock server.
                mc-status save-java [ip] <port> - Saves a Java server.
                mc-status save-bedrock [ip] <port> - Saves a Bedrock server.
            `,
            examples: [
                'mc-status java play.hypixel.net',
                'mc-status bedrock play.hyperlandsmc.net',
                'mc-status save-java play.hypixel.net',
            ],
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'check',
                    description: 'Status of the saved server.',
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'java',
                    description: 'Status of a Java server.',
                    options: defaultServerOptions,
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'bedrock',
                    description: 'Status of a Bedrock server.',
                    options: defaultServerOptions,
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'save-java',
                    description: 'Saves a Java server.',
                    options: defaultServerOptions,
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'save-bedrock',
                    description: 'Saves a Bedrock server.',
                    options: defaultServerOptions,
                }],
        });
    }
    async run(context, { subCommand, ip, port }) {
        switch (subCommand) {
            case 'check':
                return await this.runCheck(context);
            case 'java':
                return await this.runJava(context, ip, port ?? 25565);
            case 'bedrock':
                return await this.runBedrock(context, ip, port ?? 19132);
            case 'save-java':
                return await this.runSaveJava(context, ip, port ?? 25565);
            case 'save-bedrock':
                return await this.runSaveBedrock(context, ip, port ?? 19132);
        }
    }
    /**
     * The `check` sub-command
     */
    async runCheck(context) {
        if (!context.inGuild()) {
            await this.onBlock(context, 'guildOnly');
            return;
        }
        const savedServer = await context.guild.database.mcIps.fetch();
        if (!savedServer) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'Please run the `save:java` or `save:bedrock` sub-commands before using this.',
            }));
            return;
        }
        const { type, ip, port } = savedServer;
        const response = type === 'java'
            ? await this.getJavaStatus(ip, port)
            : await this.getBedrockStatus(ip, port);
        await (0, utils_1.replyAll)(context, response);
    }
    /**
     * The `java` sub-command
     */
    async runJava(context, ip, port) {
        if (!ip)
            return;
        const response = await this.getJavaStatus(ip, port);
        await (0, utils_1.replyAll)(context, response);
    }
    /**
     * The `bedrock` sub-command
     */
    async runBedrock(context, ip, port) {
        if (!ip)
            return;
        const response = await this.getBedrockStatus(ip, port);
        await (0, utils_1.replyAll)(context, response);
    }
    /**
     * The `save-java` sub-command¿
     */
    async runSaveJava(context, ip, port) {
        if (!ip)
            return;
        if (!context.inGuild()) {
            await this.onBlock(context, 'guildOnly');
            return;
        }
        const { author, guild, guildId, member } = context;
        if (!this.client.isOwner(author) && !member?.permissions.has('Administrator')) {
            await this.onBlock(context, 'userPermissions', { missing: ['Administrator'] });
            return;
        }
        await guild.database.mcIps.add({
            guild: guildId,
            type: 'java',
            ip: ip,
            port: port,
        });
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: 'Saved Minecraft server data',
            fieldValue: (0, common_tags_1.stripIndent) `
                **IP:** \`${ip}\`
                **Port:** \`${port}\`
            `,
        }));
    }
    /**
     * The `save-bedrock` sub-command
     */
    async runSaveBedrock(context, ip, port) {
        if (!ip)
            return;
        if (!context.inGuild()) {
            await this.onBlock(context, 'guildOnly');
            return;
        }
        const { author, guild, guildId, member } = context;
        if (!this.client.isOwner(author) && !member?.permissions.has('Administrator')) {
            await this.onBlock(context, 'userPermissions', { missing: ['Administrator'] });
            return;
        }
        await guild.database.mcIps.add({
            guild: guildId,
            type: 'bedrock',
            ip: ip,
            port: port,
        });
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: 'Saved Minecraft server data',
            fieldValue: (0, common_tags_1.stripIndent) `
                **IP:** \`${ip}\`
                **Port:** \`${port}\`
            `,
        }));
    }
    /**
     * Gets the status of a Java server
     * @param ip The IP of the server to look for
     * @param port the port of the server to look for
     */
    async getJavaStatus(ip, port) {
        let status;
        try {
            status = await (0, minecraft_server_util_1.status)(ip, port);
        }
        catch {
            return (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'The server you were looking for is either offline or it doesn\'t exist',
                fieldValue: (0, common_tags_1.stripIndent) `
                    **IP:** \`${ip}\`
                    **Port:** \`${port}\`
                `,
            });
        }
        const { motd, version, favicon, players, roundTripLatency } = status;
        // Server favicon
        const buffer = favicon ? Buffer.from(favicon.split(',')[1], 'base64') : null;
        const icon = buffer ? new discord_js_1.AttachmentBuilder(buffer, { name: 'icon.png' }) : null;
        const serverInfo = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
            name: `Server IP: ${ip}`, iconURL: 'attachment://icon.png',
        })
            .addFields({
            name: 'MOTD',
            value: (0, discord_js_1.escapeMarkdown)(motd.clean.trimStart()),
        })
            .setThumbnail('attachment://icon.png')
            .setTimestamp();
        if (players.sample && players.sample.length > 0) {
            serverInfo.addFields({
                name: 'Player list',
                value: players.sample.map(p => `\`${p.name}\``).join(', '),
            });
        }
        serverInfo.addFields({
            name: 'Information',
            value: (0, common_tags_1.stripIndent) `
            **Online players:** ${players.online}/${players.max}
            **Version:** ${version.name}
            **Ping:** ${roundTripLatency}ms
            `,
        });
        return {
            embeds: [serverInfo],
            files: pixoll_commando_1.Util.filterNullishItems([icon]),
        };
    }
    /**
     * Gets the status of a Bedrock server
     * @param ip The IP of the server to look for
     * @param port the port of the server to look for
     */
    async getBedrockStatus(ip, port) {
        const reqStart = Date.now();
        let status;
        try {
            status = await (0, minecraft_server_util_1.statusBedrock)(ip, port);
        }
        catch {
            return (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'The server you were looking for is either offline or it doesn\'t exist',
                fieldValue: (0, common_tags_1.stripIndent) `
                    **IP:** \`${ip}\`
                    **Port:** \`${port}\`
                `,
            });
        }
        const ping = Date.now() - reqStart;
        const { motd, players, version } = status;
        const serverInfo = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({ name: `Server IP: ${ip}` })
            .addFields({
            name: 'MOTD',
            value: (0, discord_js_1.escapeMarkdown)(motd.clean.trimStart()),
        }, {
            name: 'Information',
            value: (0, common_tags_1.stripIndent) `
                **Online players:** ${players.online}/${players.max}
                **Version:** ${version.name}
                **Ping:** ${ping}ms
                `,
        })
            .setTimestamp();
        return serverInfo;
    }
}
exports.default = McStatusCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWNzdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy9tY3N0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FPb0I7QUFDcEIsaUVBQTRFO0FBQzVFLHFEQVF5QjtBQUN6Qix1Q0FBa0U7QUFFbEUsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsY0FBYyxDQUFDO1FBQ2hFLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsSUFBSTtRQUNULE1BQU0sRUFBRSx5REFBeUQ7UUFDakUsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sQ0FBQyxDQUFVLEVBQUUsT0FBd0I7WUFDeEMsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELE9BQU8sVUFBVSxLQUFLLE9BQU8sQ0FBQztRQUNsQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBa0I7WUFDbEYsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELElBQUksVUFBVSxLQUFLLE9BQU87Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDeEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FB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