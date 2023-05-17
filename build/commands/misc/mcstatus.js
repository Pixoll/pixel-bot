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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.reply)(context, response);
    }
    /**
     * The `java` sub-command
     */
    async runJava(context, ip, port) {
        if (!ip)
            return;
        const response = await this.getJavaStatus(ip, port);
        await (0, utils_1.reply)(context, response);
    }
    /**
     * The `bedrock` sub-command
     */
    async runBedrock(context, ip, port) {
        if (!ip)
            return;
        const response = await this.getBedrockStatus(ip, port);
        await (0, utils_1.reply)(context, response);
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `Server IP: ${ip}`,
            iconURL: 'attachment://icon.png',
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
            .setColor(utils_1.pixelColor)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWNzdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy9tY3N0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FPb0I7QUFDcEIsaUVBQTRFO0FBQzVFLHFEQVN5QjtBQUN6Qix1Q0FBMkU7QUFFM0UsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsY0FBYyxDQUFDO1FBQ2hFLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsSUFBSTtRQUNULE1BQU0sRUFBRSx5REFBeUQ7UUFDakUsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sQ0FBQyxDQUFVLEVBQUUsT0FBd0I7WUFDeEMsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELE9BQU8sVUFBVSxLQUFLLE9BQU8sQ0FBQztRQUNsQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBa0I7WUFDbEYsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELElBQUksVUFBVSxLQUFLLE9BQU87Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDeEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FB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