import { oneLine, stripIndent } from 'common-tags';
import { EmbedBuilder, ApplicationCommandOptionType, ChannelType, Message } from 'discord.js';
import { UpdateAggregationStage, UpdateQuery } from 'mongoose';
import {
    Argument,
    ArgumentTypeString,
    ArgumentTypeStringMap,
    BaseSchema,
    Command,
    CommandContext,
    CommandoClient,
    CommandoMessage,
    CommandoRole,
    CommandoTextChannel,
    JSONIfySchema,
    ParseRawArguments,
    QuerySchema,
    SetupSchema,
    Util,
} from 'pixoll-commando';
import {
    basicEmbed,
    basicCollector,
    isModerator,
    replyAll,
    isValidRole,
    getSubCommand,
    BasicEmbedOptions,
    removeRepeated,
    parseArgInput,
    validateArgInput,
} from '../../utils';

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: [
        'view',
        'full',
        'reload',
        'audit-logs',
        'muted-role',
        'member-role',
        'bot-role',
        'lockdown-channels',
    ],
    default: 'full',
    parse(value: string): string {
        return value.toLowerCase();
    },
}, {
    key: 'value',
    prompt: 'Please specify the value to set for that sub-command.',
    type: ['text-channel', 'role', 'string'],
    required: false,
    isEmpty(_: unknown, message: CommandoMessage): boolean {
        const subCommand = getSubCommand<SubCommand>(message, args[0].default);
        return Util.equals(subCommand, ['full', 'reload', 'view']);
    },
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const subCommand = getSubCommand<SubCommand>(message, args[0].default);
        if (Util.equals(subCommand, ['full', 'reload', 'view'])) return true;
        if (subCommand === 'audit-logs') {
            return await validateArgInput(value, message, argument, 'text-channel');
        }
        if (Util.equals(subCommand, ['bot-role', 'member-role', 'muted-role'])) {
            return await validateArgInput(value, message, argument, 'role');
        }
        const results = await Promise.all((value ?? '').split(/ +/).map(query =>
            validateArgInput(query, message, argument, 'text-channel')
        ));
        return results.find(result => result !== true) ?? true;
    },
    async parse(
        value: string, message: CommandoMessage, argument: Argument
    ): Promise<CommandoRole | CommandoTextChannel | string | null> {
        const subCommand = getSubCommand<SubCommand>(message, args[0].default);
        if (Util.equals(subCommand, ['full', 'reload', 'view'])) return null;
        if (subCommand === 'lockdown-channels') return value;
        const argType = subCommand === 'audit-logs' ? 'text-channel' : 'role';
        return await parseArgInput(value, message, argument, argType);
    },
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs> & Partial<FullSetupData> & {
    channel?: CommandoTextChannel;
    role?: CommandoRole;
    channels?: string;
};
type SubCommand = ParsedArgs['subCommand'];

interface FullSetupData {
    auditLogsChannel: CommandoTextChannel;
    mutedRole: CommandoRole;
    memberRole: CommandoRole;
    botRole: CommandoRole;
    lockdownChannels: string;
}

type SetupSchemaQuery = QuerySchema<SetupSchema>;
type DefaultDocumentKey = Exclude<keyof SetupSchema, keyof BaseSchema | 'guild'>;
type SetupUpdateQuery = QuerySchema<SetupSchema> | UpdateAggregationStage | UpdateQuery<QuerySchema<SetupSchema>>;

export default class SetupCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'setup',
            group: 'utility',
            description: 'Setup the bot to its core. Data collected will be deleted if the bot leaves the server.',
            detailedDescription: stripIndent`
                \`text-channel\` can be either a text channel's name, mention or ID.
                \`role\` can be either a role's name, mention or ID.
                \`text-channels\` to be all the text channels' names, mentions or ids, separated by spaces (max. 30 at once).
            `,
            format: stripIndent`
                setup <full> - Setup the bot completely to its core.
                setup view - View the current setup data of the server.
                setup reload - Reloads the data of the server.
                setup audit-logs [text-channel] - Setup the audit logs channel.
                setup muted-role [role] - Setup the role for muted members.
                setup member-role [role] - Setup the role given to a member upon joining.
                setup bot-role [role] - Setup the role given to a bot upon joining.
                setup lockdown-channels [text-channels] - Setup all the lockdown channels used in the \`lockdown\` command.
            `,
            userPermissions: ['Administrator'],
            guildOnly: true,
            guarded: true,
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Subcommand,
                name: 'view',
                description: 'View the current setup data of the server.',
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'full',
                description: 'Setup the bot completely to its core.',
                options: [{
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildText],
                    name: 'audit-logs-channel',
                    description: 'The channel where to send the audit logs.',
                    required: true,
                }, {
                    type: ApplicationCommandOptionType.Role,
                    name: 'muted-role',
                    description: 'The role that will be given to muted members.',
                    required: true,
                }, {
                    type: ApplicationCommandOptionType.Role,
                    name: 'member-role',
                    description: 'The role that will be given to a member upon joining.',
                    required: true,
                }, {
                    type: ApplicationCommandOptionType.Role,
                    name: 'bot-role',
                    description: 'The role that will be given to a bot upon joining.',
                    required: true,
                }, {
                    type: ApplicationCommandOptionType.String,
                    name: 'lockdown-channels',
                    description: 'The channels for the lockdown command, separated by spaces (max. 30 at once).',
                    required: true,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'reload',
                description: 'Reloads the data of the server.',
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'audit-logs',
                description: 'Setup the audit logs channel.',
                options: [{
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildText],
                    name: 'channel',
                    description: 'The channel where to send the audit logs.',
                    required: true,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'muted-role',
                description: 'Setup the role for muted members.',
                options: [{
                    type: ApplicationCommandOptionType.Role,
                    name: 'role',
                    description: 'The role that will be given to muted members.',
                    required: true,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'member-role',
                description: 'Setup the role given to a member upon joining.',
                options: [{
                    type: ApplicationCommandOptionType.Role,
                    name: 'role',
                    description: 'The role that will be given to a member upon joining.',
                    required: true,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'bot-role',
                description: 'Setup the role given to a bot upon joining.',
                options: [{
                    type: ApplicationCommandOptionType.Role,
                    name: 'role',
                    description: 'The role that will be given to a bot upon joining.',
                    required: true,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'lockdown-channels',
                description: 'Setup all the lockdown channels used in the "lockdown" command.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'channels',
                    description: 'The channels for the lockdown command, separated by spaces (max. 30 at once).',
                    required: true,
                }],
            }],
        });
    }

    public async run(context: CommandContext<true>, {
        subCommand, value, auditLogsChannel, mutedRole, memberRole, botRole, lockdownChannels, channel, role, channels,
    }: ParsedArgs): Promise<void> {
        const { guild } = context;
        const db = guild.database.setup;

        const data = await db.fetch();
        const setupData = {
            auditLogsChannel,
            mutedRole,
            memberRole,
            botRole,
            lockdownChannels,
        };

        switch (subCommand) {
            case 'full':
                return await this.runFull(context, data, context.isInteraction() ? setupData as FullSetupData : null);
            case 'view':
                return await this.runView(context, data);
            case 'reload':
                return await this.runReload(context, data);
            case 'audit-logs':
                return await this.runAuditLogs(context, data, (value ?? channel) as CommandoTextChannel);
            case 'muted-role':
                return await this.runMutedRole(context, data, (value ?? role) as CommandoRole);
            case 'member-role':
                return await this.runMemberRole(context, data, (value ?? role) as CommandoRole);
            case 'bot-role':
                return await this.runBotRole(context, data, (value ?? role) as CommandoRole);
            case 'lockdown-channels':
                return await this.lockdownChannels(context, data, (value ?? channels) as string);
        }
    }

    /**
     * The `full` sub-command
     */
    protected async runFull(
        context: CommandContext<true>, data: JSONIfySchema<SetupSchema> | null, fullData: FullSetupData | null
    ): Promise<void> {
        const { guild, guildId } = context;
        const db = guild.database.setup;

        let logsChannel = fullData?.auditLogsChannel ?? null;
        let mutedRole = fullData?.mutedRole ?? null;
        let memberRole = fullData?.memberRole ?? null;
        let botRole = fullData?.botRole ?? null;
        const lockChannels: CommandoTextChannel[] = [];

        if (context.isMessage()) {
            logsChannel = await getInputFromCollector(context, this, 'text-channel', null, {
                fieldName: 'In what __text channel__ should I send the audit-logs?',
            });
            memberRole = await getInputFromCollector(context, this, 'role', isModerator, {
                description: isModerator(memberRole)
                    ? 'This is considered as a moderation role, please try again with another one.'
                    : `Audit logs will be sent in ${logsChannel}.`,
                fieldName: 'What __role__ should I give to a __member__ when they join the server?',
            });
            botRole = await getInputFromCollector(context, this, 'role', null, {
                description: `The default member role will be ${memberRole}.`,
                fieldName: 'What __role__ should I give to a __bot__ when they join the server?',
            });
            mutedRole = await getInputFromCollector(context, this, 'role', null, {
                description: `The default bot role will be ${botRole}.`,
                fieldName: 'What __role__ should I give to a __member__ when they get muted?',
            });

            let toDelete: Message | undefined;
            while (lockChannels.length === 0) {
                const msg = await basicCollector(context, {
                    description: `The role given to muted people will be ${mutedRole}.`,
                    fieldName: 'What __text channels__ should I lock when you use the `lockdown` command?',
                }, { time: 2 * 60_000 }, true);
                if (!msg) return;
                toDelete = msg;
                lockChannels.push(...await parseLockdownChannels(msg.content, context, this));
                lockChannels.splice(30, lockChannels.length - 30);
            }
            await toDelete?.delete();
        } else if (fullData) {
            const message = await context.fetchReply() as CommandoMessage<true>;

            if (!isValidRole(message, mutedRole)) {
                await replyAll(context, basicEmbed({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The chosen muted role is invalid. Please check the role hierarchy.',
                }));
                return;
            }
            if (!isValidRole(message, memberRole)) {
                await replyAll(context, basicEmbed({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The chosen default member role is invalid. Please check the role hierarchy.',
                }));
                return;
            }
            if (!isValidRole(message, botRole)) {
                await replyAll(context, basicEmbed({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The chosen default bot role is invalid. Please check the role hierarchy.',
                }));
                return;
            }

            lockChannels.push(...await parseLockdownChannels(fullData.lockdownChannels, message, this));
            lockChannels.splice(30, lockChannels.length - 30);
            if (lockChannels.length === 0) {
                await replyAll(context, basicEmbed({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'None of the lockdown channels you specified were valid. Please try again.',
                }));
                return;
            }
        }

        const msg = await basicCollector(context, {
            description: stripIndent`
            **This is all the data I got:**
            Audit logs channel: ${logsChannel}
            Default members role: ${memberRole}
            Default bots role: ${botRole}
            Muted members role: ${mutedRole}
            Lockdown channels: ${lockChannels.map(c => c.toString()).join(', ')}
            `,
            fieldName: 'Is this data correct? If so, type `confirm` to proceed.',
        }, null, true);
        if (!msg) return;
        if (msg.content.toLowerCase() !== 'confirm') {
            await replyAll(context, {
                content: 'Cancelled command.',
                embeds: [],
            });
            return;
        }

        const doc: SetupSchemaQuery = {
            guild: guildId,
            logsChannel: logsChannel?.id,
            memberRole: memberRole?.id,
            botRole: botRole?.id,
            mutedRole: mutedRole?.id,
            lockChannels: lockChannels.map(c => c.id),
        };
        if (data) await db.update(data, doc);
        else await db.add(doc);

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: 'The data for this server has been saved. Use the `view` sub-command if you wish to check it out.',
        }));
    }

    /**
     * The `view` sub-command
     */
    protected async runView(context: CommandContext<true>, data: JSONIfySchema<SetupSchema> | null): Promise<void> {
        const hasNoData = !data
            || Util.filterNullishItems(Object.values(Util.omit(data, ['_id', 'guild']))).length === 0;
        if (hasNoData) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup full` command first.',
            }));
            return;
        }

        const { guild } = context;

        const logsChannel = data.logsChannel ? `<#${data.logsChannel}>` : 'None';
        const memberRole = data.memberRole ? `<@&${data.memberRole}> (${data.memberRole})` : 'None';
        const botRole = data.botRole ? `<@&${data.botRole}> (${data.botRole})` : 'None';
        const mutedRole = data.mutedRole ? `<@&${data.mutedRole}> (${data.mutedRole})` : 'None';
        const lockdownChannels = data.lockChannels?.map(id => `<#${id}>`).join(' ') || 'None';

        const embed = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `${guild.name}'s setup data`,
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .addFields({
                name: 'Audit logs channel',
                value: logsChannel,
            }, {
                name: 'Default members role',
                value: memberRole,
            }, {
                name: 'Default bots role',
                value: botRole,
            }, {
                name: 'Muted members role',
                value: mutedRole,
            }, {
                name: 'Lockdown channels',
                value: lockdownChannels,
            })
            .setFooter({
                text: 'Missing or wrong data? Try using the "reload" sub-command.',
            });

        await replyAll(context, embed);
    }

    /**
     * The `reload` sub-command
     */
    protected async runReload(context: CommandContext<true>, data: JSONIfySchema<SetupSchema> | null): Promise<void> {
        if (!data) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup full` command first.',
            }));
            return;
        }

        await replyAll(context, basicEmbed({
            color: 'Gold',
            emoji: 'loading',
            description: 'Reloading setup data...',
        }));

        const { guild } = context;
        const db = guild.database.setup;
        const updateQuery: SetupUpdateQuery = {
            $set: {},
            $unset: {},
        };

        if (updateQuery.$unset && data.logsChannel) {
            const logsChannel = await guild.channels.fetch(data.logsChannel).catch(() => null);
            if (!logsChannel) updateQuery.$unset.logsChannel = '';
        }

        if (updateQuery.$unset && data.memberRole) {
            const memberRole = await guild.roles.fetch(data.memberRole).catch(() => null);
            if (!memberRole) updateQuery.$unset.memberRole = '';
        }

        if (updateQuery.$unset && data.botRole) {
            const botRole = await guild.roles.fetch(data.botRole).catch(() => null);
            if (!botRole) updateQuery.$unset.botRole = '';
        }

        if (updateQuery.$unset && data.mutedRole) {
            const mutedRole = await guild.roles.fetch(data.mutedRole).catch(() => null);
            if (!mutedRole) updateQuery.$unset.mutedRole = '';
        }

        if (updateQuery.$set && data.lockChannels && data.lockChannels.length !== 0) {
            const lockChannels = Util.filterNullishItems(await Promise.all(data.lockChannels.map(id =>
                guild.channels.fetch(id).catch(() => null).then(channel => channel?.id)
            )));
            if (data.lockChannels.length !== lockChannels.length) {
                updateQuery.$set.lockChannels = lockChannels;
            }
        }

        if (Object.keys(updateQuery.$set ?? {}).length === 0) delete updateQuery.$set;
        if (Object.keys(updateQuery.$unset ?? {}).length === 0) delete updateQuery.$unset;
        if (Object.keys(updateQuery).length !== 0) {
            await db.update(data, updateQuery);
        }

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: 'Reloaded data.',
        }));
    }

    /**
     * The `audit-logs` sub-command
     */
    protected async runAuditLogs(
        context: CommandContext<true>, data: JSONIfySchema<SetupSchema> | null, channel: CommandoTextChannel
    ): Promise<void> {
        const { guildId, guild } = context;
        const db = guild.database.setup;

        if (data) await db.update(data, { logsChannel: channel.id });
        else await db.add(defaultDocument(guildId, 'logsChannel', channel.id));

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: oneLine`
            The new audit logs channel will be ${channel.toString()}.
            Use the \`view\` sub-command if you wish to check it out.
            `,
        }));
    }

    /**
     * The `muted-role` sub-command
     */
    protected async runMutedRole(
        context: CommandContext<true>, data: JSONIfySchema<SetupSchema> | null, role: CommandoRole
    ): Promise<void> {
        const { guild, guildId } = context;
        const db = guild.database.setup;

        if (data) await db.update(data, { mutedRole: role.id });
        else await db.add(defaultDocument(guildId, 'mutedRole', role.id));

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: oneLine`
            The new role for muted members will be ${role.toString()}.
            Use the \`view\` sub-command if you wish to check it out.
            `,
        }));
    }

    /**
     * The `member-role` sub-command
     */
    protected async runMemberRole(
        context: CommandContext<true>, data: JSONIfySchema<SetupSchema> | null, role: CommandoRole
    ): Promise<void> {
        const { guild, guildId } = context;
        const db = guild.database.setup;

        if (data) await db.update(data, { memberRole: role.id });
        else await db.add(defaultDocument(guildId, 'memberRole', role.id));

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: oneLine`
            The new default role for all members will be ${role.toString()}.
            Use the \`view\` sub-command if you wish to check it out.
            `,
        }));
    }

    /**
     * The `bot-role` sub-command
     */
    protected async runBotRole(
        context: CommandContext<true>, data: JSONIfySchema<SetupSchema> | null, role: CommandoRole
    ): Promise<void> {
        const { guild, guildId } = context;
        const db = guild.database.setup;

        if (data) await db.update(data, { botRole: role.id });
        else await db.add(defaultDocument(guildId, 'botRole', role.id));

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: oneLine`
            The new default role for all bots will be ${role.toString()}.
            Use the \`view\` sub-command if you wish to check it out.
            `,
        }));
    }

    /**
     * The `lockdown-channels` sub-command
     */
    protected async lockdownChannels(
        context: CommandContext<true>, data: JSONIfySchema<SetupSchema> | null, channelsString: string
    ): Promise<void> {
        const { guild, guildId } = context;
        const db = guild.database.setup;

        const message = context.isMessage() ? context : await context.fetchReply() as CommandoMessage;
        const channels = await parseLockdownChannels(channelsString, message, this);
        const lockChannels = removeRepeated(channels.map(c => c.id)).slice(0, 30);

        if (data) await db.update(data, { lockChannels });
        else await db.add(defaultDocument(guildId, 'lockChannels', lockChannels));

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: oneLine`
            I have saved all the lockdown channels you specified.
            Use the \`view\` sub-command if you wish to check it out.
            `,
            fieldName: 'Channels list:',
            fieldValue: lockChannels.map(id => `<#${id}>`).join(' '),
        }));
    }
}

function defaultDocument<K extends DefaultDocumentKey>(
    guildId: string, key: K, value: NonNullable<SetupSchemaQuery[K]>
): SetupSchemaQuery {
    const doc: SetupSchemaQuery = {
        guild: guildId,
    };
    doc[key] = value;
    return doc;
}

async function parseCollectorInput<T extends ArgumentTypeString = ArgumentTypeString>(
    value: string, message: CommandoMessage, command: SetupCommand, type?: T
): Promise<ArgumentTypeStringMap[T] | null> {
    const argument = command.argsCollector?.args[1] as Argument;
    return await parseArgInput(value, message, argument, type);
}

async function parseLockdownChannels(
    value: string, message: CommandoMessage, command: SetupCommand
): Promise<CommandoTextChannel[]> {
    const results = await Promise.all(value.split(/ +/).map(query =>
        parseArgInput(query, message, command.argsCollector?.args[1] as Argument, 'text-channel')
    ));
    return Util.filterNullishItems(results);
}

async function getInputFromCollector<T extends ArgumentTypeString = ArgumentTypeString>(
    message: CommandoMessage,
    command: SetupCommand,
    type: T,
    validator: ((value: ArgumentTypeStringMap[T]) => boolean) | null,
    embedOptions: BasicEmbedOptions,
    time?: number
): Promise<ArgumentTypeStringMap[T] | null> {
    let value: ArgumentTypeStringMap[T] | null | undefined;
    let promptMessage: Message | undefined;
    while (!value || validator?.(value)) {
        const reply = await basicCollector(message, embedOptions, { time }, true);
        if (!reply) return null;
        promptMessage = reply;
        value = await parseCollectorInput(reply.content, message, command, type);
    }

    await promptMessage?.delete();
    return value;
}
