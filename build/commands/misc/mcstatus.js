"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
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
        const status = await (0, utils_1.statusJava)(ip, port);
        if (!status || !status.online) {
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
        const { motd, version, icon, players, ping } = status;
        // Server favicon
        const buffer = icon ? Buffer.from(icon.split(',')[1], 'base64') : null;
        const iconPng = buffer ? new discord_js_1.AttachmentBuilder(buffer, { name: 'icon.png' }) : null;
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
        if (players.list && players.list.length > 0) {
            serverInfo.addFields({
                name: 'Player list',
                value: players.list.map(p => `\`${p.name_clean}\``).join(', '),
            });
        }
        serverInfo.addFields({
            name: 'Information',
            value: (0, common_tags_1.stripIndent) `
            **Online players:** ${players.online}/${players.max}
            **Version:** ${version?.name_clean ?? 'Not specified'}
            **Ping:** ${ping}ms
            `,
        });
        return {
            embeds: [serverInfo],
            files: pixoll_commando_1.Util.filterNullishItems([iconPng]),
        };
    }
    /**
     * Gets the status of a Bedrock server
     * @param ip The IP of the server to look for
     * @param port the port of the server to look for
     */
    async getBedrockStatus(ip, port) {
        const status = await (0, utils_1.statusBedrock)(ip, port);
        if (!status || !status.online) {
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
        const { motd, players, version, ping } = status;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWNzdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy9tY3N0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FPb0I7QUFDcEIscURBU3lCO0FBQ3pCLHVDQUFzRztBQUV0RyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFlBQVk7UUFDakIsS0FBSyxFQUFFLGFBQWE7UUFDcEIsTUFBTSxFQUFFLHNDQUFzQztRQUM5QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxjQUFjLENBQUM7UUFDaEUsT0FBTyxFQUFFLE9BQU87UUFDaEIsS0FBSyxDQUFDLEtBQWE7WUFDZixPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixDQUFDO0tBQ0osRUFBRTtRQUNDLEdBQUcsRUFBRSxJQUFJO1FBQ1QsTUFBTSxFQUFFLHlEQUF5RDtRQUNqRSxJQUFJLEVBQUUsUUFBUTtRQUNkLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxDQUFDLENBQVUsRUFBRSxPQUF3QjtZQUN4QyxNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxDQUFDLENBQUM7WUFDdEQsT0FBTyxVQUFVLEtBQUssT0FBTyxDQUFDO1FBQ2xDLENBQUM7UUFDRCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxDQUFDLENBQUM7WUFDdEQsSUFBSSxVQUFVLEtBQUssT0FBTztnQkFBRSxPQUFPLElBQUksQ0FBQztZQUN4QyxNQUFNLE9BQU8sR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxD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