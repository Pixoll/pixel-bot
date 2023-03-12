import { stripIndent } from 'common-tags';
import {
    EmbedBuilder,
    AttachmentBuilder,
    MessageCreateOptions,
    ApplicationCommandOptionType,
    ApplicationCommandSubCommandData,
    escapeMarkdown,
} from 'discord.js';
import { status as statusJava, statusBedrock } from 'minecraft-server-util';
import {
    Argument,
    Command,
    CommandContext,
    CommandoClient,
    CommandoMessage,
    ParseRawArguments,
    Util,
} from 'pixoll-commando';
import { basicEmbed, getSubCommand, replyAll } from '../../utils';

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: ['check', 'java', 'bedrock', 'save-java', 'save-bedrock'],
    default: 'check',
    parse(value: string): string {
        return value.toLowerCase();
    },
}, {
    key: 'ip',
    prompt: 'What is the IP of the server you want to save/look for?',
    type: 'string',
    required: false,
    isEmpty(_: unknown, message: CommandoMessage): boolean {
        const subCommand = getSubCommand<SubCommand>(message);
        return subCommand === 'check';
    },
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const subCommand = getSubCommand<SubCommand>(message);
        if (subCommand !== 'check') return true;
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
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;
type SubCommand = ParsedArgs['subCommand'];

type SlashSubCommandOptions = NonNullable<ApplicationCommandSubCommandData['options']>;

const defaultServerOptions: SlashSubCommandOptions = [{
    type: ApplicationCommandOptionType.String,
    name: 'ip',
    description: 'The IP of the server to look for.',
    required: true,
}, {
    type: ApplicationCommandOptionType.Integer,
    name: 'port',
    description: 'The port of the server to look for.',
    minValue: 1,
    maxValue: 65535,
}];

export default class McStatusCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'mc-status',
            aliases: ['mcstatus'],
            group: 'misc',
            description: 'Displays information of a Java/Bedrock Minecraft server.',
            detailedDescription: '`ip` has to be a valid server IP, and `port` a valid server port.',
            format: stripIndent`
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
                type: ApplicationCommandOptionType.Subcommand,
                name: 'check',
                description: 'Status of the saved server.',
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'java',
                description: 'Status of a Java server.',
                options: defaultServerOptions,
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'bedrock',
                description: 'Status of a Bedrock server.',
                options: defaultServerOptions,
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'save-java',
                description: 'Saves a Java server.',
                options: defaultServerOptions,
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'save-bedrock',
                description: 'Saves a Bedrock server.',
                options: defaultServerOptions,
            }],
        });
    }

    public async run(context: CommandContext, { subCommand, ip, port }: ParsedArgs): Promise<void> {
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
    protected async runCheck(context: CommandContext): Promise<void> {
        if (!context.inGuild()) {
            await this.onBlock(context, 'guildOnly');
            return;
        }

        const savedServer = await context.guild.database.mcIps.fetch();

        if (!savedServer) {
            await replyAll(context, basicEmbed({
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

        await replyAll(context, response);
    }

    /**
     * The `java` sub-command
     */
    protected async runJava(context: CommandContext, ip: string | null, port: number): Promise<void> {
        if (!ip) return;
        const response = await this.getJavaStatus(ip, port);
        await replyAll(context, response);
    }

    /**
     * The `bedrock` sub-command
     */
    protected async runBedrock(context: CommandContext, ip: string | null, port: number): Promise<void> {
        if (!ip) return;
        const response = await this.getBedrockStatus(ip, port);
        await replyAll(context, response);
    }

    /**
     * The `save-java` sub-command¿
     */
    protected async runSaveJava(context: CommandContext, ip: string | null, port: number): Promise<void> {
        if (!ip) return;
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

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: 'Saved Minecraft server data',
            fieldValue: stripIndent`
                **IP:** \`${ip}\`
                **Port:** \`${port}\`
            `,
        }));
    }

    /**
     * The `save-bedrock` sub-command
     */
    protected async runSaveBedrock(context: CommandContext, ip: string | null, port: number): Promise<void> {
        if (!ip) return;
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

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: 'Saved Minecraft server data',
            fieldValue: stripIndent`
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
    protected async getJavaStatus(ip: string, port: number): Promise<EmbedBuilder | MessageCreateOptions> {
        let status;
        try {
            status = await statusJava(ip, port);
        } catch {
            return basicEmbed({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'The server you were looking for is either offline or it doesn\'t exist',
                fieldValue: stripIndent`
                    **IP:** \`${ip}\`
                    **Port:** \`${port}\`
                `,
            });
        }

        const { motd, version, favicon, players, roundTripLatency } = status;

        // Server favicon
        const buffer = favicon ? Buffer.from(favicon.split(',')[1], 'base64') : null;
        const icon = buffer ? new AttachmentBuilder(buffer, { name: 'icon.png' }) : null;

        const serverInfo = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `Server IP: ${ip}`, iconURL: 'attachment://icon.png',
            })
            .addFields({
                name: 'MOTD',
                value: escapeMarkdown(motd.clean.trimStart()),
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
            value: stripIndent`
            **Online players:** ${players.online}/${players.max}
            **Version:** ${version.name}
            **Ping:** ${roundTripLatency}ms
            `,
        });

        return {
            embeds: [serverInfo],
            files: Util.filterNullishItems([icon]),
        };
    }

    /**
     * Gets the status of a Bedrock server
     * @param ip The IP of the server to look for
     * @param port the port of the server to look for
     */
    protected async getBedrockStatus(ip: string, port: number): Promise<EmbedBuilder | MessageCreateOptions> {
        const reqStart = Date.now();
        let status;
        try {
            status = await statusBedrock(ip, port);
        } catch {
            return basicEmbed({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'The server you were looking for is either offline or it doesn\'t exist',
                fieldValue: stripIndent`
                    **IP:** \`${ip}\`
                    **Port:** \`${port}\`
                `,
            });
        }

        const ping = Date.now() - reqStart;
        const { motd, players, version } = status;

        const serverInfo = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({ name: `Server IP: ${ip}` })
            .addFields({
                name: 'MOTD',
                value: escapeMarkdown(motd.clean.trimStart()),
            }, {
                name: 'Information',
                value: stripIndent`
                **Online players:** ${players.online}/${players.max}
                **Version:** ${version.name}
                **Ping:** ${ping}ms
                `,
            })
            .setTimestamp();

        return serverInfo;
    }
}
