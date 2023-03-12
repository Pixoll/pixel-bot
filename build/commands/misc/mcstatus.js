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
            detailedDescription: '`ip` has to be a valid server IP, and `port` a valid server port.',
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