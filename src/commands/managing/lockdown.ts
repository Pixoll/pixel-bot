import { stripIndent, oneLine } from 'common-tags';
import { ApplicationCommandOptionType } from 'discord.js';
import {
    Argument,
    Command,
    CommandContext,
    CommandoClient,
    CommandoMessage,
    CommandoTextChannel,
    JSONIfySchema,
    ParseRawArguments,
    SetupSchema,
    Util,
} from 'pixoll-commando';
import {
    basicEmbed,
    generateEmbed,
    pluralize,
    confirmButtons,
    replyAll,
    parseArgInput,
    removeRepeated,
    getSubCommand,
    validateArgInput,
} from '../../utils';

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: ['start', 'end', 'view', 'add', 'remove'],
    parse(value: string): string {
        return value.toLowerCase();
    },
}, {
    key: 'channels',
    prompt: oneLine`
        Why are you starting/ending the lockdown? Or
        what channels do you want to add or remove? (max. 30 at once)
    `,
    type: 'string',
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const subCommand = getSubCommand<SubCommand>(message);
        if (Util.equals(subCommand, ['end', 'start', 'view'])) return true;
        const results = await Promise.all((value ?? '').split(/ +/).map(query =>
            validateArgInput(query, message, argument, 'text-channel')
        ));
        return results.find(result => result !== true) ?? true;
    },
    required: false,
    error: 'None of the channels you specified were valid. Please try again.',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs> & {
    reason?: string;
};
type SubCommand = ParsedArgs['subCommand'];

export default class LockdownCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'lockdown',
            group: 'managing',
            description: 'Lock every text channel that was specified when using the `setup` command',
            details: stripIndent`
                If \`reason\` is not specified, it will default as "We'll be back shortly" or "Thanks for waiting".
                \`text-channels\` to be all the text channels' names, mentions or ids, separated by spaces (max. 30 at once).
            `,
            format: stripIndent`
                lockdown start <reason> - Start the lockdown.
                lockdown end <reason> - End the lockdown.
                lockdown view - Display the lockdown channels.
                lockdown add [text-channels] - Add lockdown channels (max. 30 at once).
                lockdown remove [text-channels] - Remove lockdown channels (max. 30 at once).
            `,
            examples: [
                'lockdown add #chat commands 850477653252243466',
                'lockdown remove #commands 800224125444292608',
            ],
            clientPermissions: ['ManageChannels'],
            userPermissions: ['Administrator'],
            guildOnly: true,
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Subcommand,
                name: 'start',
                description: 'Start the lockdown',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'reason',
                    description: 'Why are you starting the lockdown.',
                    maxLength: 512,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'end',
                description: 'End the lockdown',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'reason',
                    description: 'Why are you ending the lockdown.',
                    maxLength: 512,
                }],
            }, {
                type: ApplicationCommandOptionType.SubcommandGroup,
                name: 'channels',
                description: 'View, add or remove lockdown channels.',
                options: [{
                    type: ApplicationCommandOptionType.Subcommand,
                    name: 'add',
                    description: 'Add lockdown channels (max. 30 at once).',
                    options: [{
                        type: ApplicationCommandOptionType.String,
                        name: 'channels',
                        description: 'The channels to add, separated by spaces.',
                        required: true,
                    }],
                }, {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: 'remove',
                    description: 'Remove lockdown channels (max. 30 at once).',
                    options: [{
                        type: ApplicationCommandOptionType.String,
                        name: 'channels',
                        description: 'The channels to remove, separated by spaces.',
                        required: true,
                    }],
                }, {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: 'view',
                    description: 'Display the lockdown channels.',
                }],
            }],
        });
    }

    public async run(
        context: CommandContext<true>, { subCommand, channels: channelsOrReason, reason }: ParsedArgs
    ): Promise<void> {
        const message = context.isMessage() ? context : await context.fetchReply() as CommandoMessage;
        const lockChannels = Util.equals(subCommand, ['start', 'end'])
            ? await parseLockdownChannels(channelsOrReason, message, this)
            : [];

        const { guild } = context;
        const db = guild.database.setup;
        const allChannels = guild.channels;

        const data = await db.fetch();
        const savedChannels = Util.filterNullishItems(await Promise.all(data?.lockChannels?.map(id =>
            allChannels.fetch(id).catch(() => null) as Promise<CommandoTextChannel | null>
        ) ?? []));

        switch (subCommand) {
            case 'start':
                return await this.runStart(context, savedChannels, channelsOrReason ?? reason ?? 'We\'ll be back shortly.');
            case 'end':
                return await this.runEnd(context, savedChannels, channelsOrReason ?? reason ?? 'Thanks for waiting.');
            case 'view':
                return await this.runChannelsView(context, savedChannels);
            case 'add':
                return await this.runChannelsAdd(
                    context, data, savedChannels.map(c => c.id), lockChannels.map(c => c.id)
                );
            case 'remove':
                return await this.runChannelsRemove(
                    context, data, savedChannels.map(c => c.id), lockChannels.map(c => c.id)
                );
        }
    }

    /**
     * The `start` sub-command
     */
    protected async runStart(
        context: CommandContext<true>, savedChannels: CommandoTextChannel[], reason: string
    ): Promise<void> {
        if (savedChannels.length === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.',
            }));
            return;
        }

        const confirmed = await confirmButtons(context, {
            action: 'start lockdown',
            reason,
        });
        if (!confirmed) return;

        const { guild, guildId } = context;
        const { everyone } = guild.roles;

        const replyToEdit = await replyAll(context, basicEmbed({
            color: 'Gold',
            emoji: 'loading',
            description: 'Locking all lockdown channels, please wait...',
        }));

        let changesAmount = 0;
        for (const channel of savedChannels) {
            const permsManager = channel.permissionOverwrites;
            const perms = permsManager.cache.get(guildId);
            if (perms?.deny.has('SendMessages')) continue;

            await permsManager.edit(everyone, { SendMessages: false }, { reason, type: 0 });
            await channel.send({
                embeds: [basicEmbed({
                    emoji: '\\🔒',
                    fieldName: 'This channel has been locked',
                    fieldValue: reason,
                })],
            });
            changesAmount++;
        }

        if (changesAmount === 0) {
            await replyAll(context, {
                embeds: [basicEmbed({
                    color: 'Gold',
                    description: 'No changes were made.',
                })],
                replyToEdit,
            });
            return;
        }

        await replyAll(context, {
            embeds: [basicEmbed({
                color: 'Green',
                emoji: 'check',
                description: `Locked ${changesAmount}/${savedChannels.length} lockdown channels.`,
            })],
            replyToEdit,
        });
    }

    /**
     * The `end` sub-command
     */
    protected async runEnd(
        context: CommandContext<true>, savedChannels: CommandoTextChannel[], reason: string
    ): Promise<void> {
        if (savedChannels.length === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.',
            }));
            return;
        }

        const confirmed = await confirmButtons(context, {
            action: 'end lockdown',
            reason,
        });
        if (!confirmed) return;

        const { guild, guildId } = context;
        const { everyone } = guild.roles;
        const replyToEdit = await replyAll(context, basicEmbed({
            color: 'Gold',
            emoji: 'loading',
            description: 'Unlocking all lockdown channels, please wait...',
        }));

        let changesAmount = 0;
        for (const channel of savedChannels) {
            const permsManager = channel.permissionOverwrites;
            const perms = permsManager.cache.get(guildId);
            if (!perms?.deny.has('SendMessages')) continue;

            await permsManager.edit(everyone, { SendMessages: null }, { reason, type: 0 });
            await channel.send({
                embeds: [basicEmbed({
                    emoji: '\\🔓',
                    fieldName: 'This channel has been unlocked',
                    fieldValue: reason,
                })],
            });
            changesAmount++;
        }

        if (changesAmount === 0) {
            await replyAll(context, {
                embeds: [basicEmbed({
                    color: 'Gold',
                    description: 'No changes were made.',
                })],
                replyToEdit,
            });
            return;
        }

        await replyAll(context, {
            embeds: [basicEmbed({
                color: 'Green',
                emoji: 'check',
                description: `Unlocked ${changesAmount}/${savedChannels.length} lockdown channels.`,
            })],
            replyToEdit,
        });
    }

    /**
     * The `channels` sub-command
     */
    protected async runChannelsView(context: CommandContext<true>, channels: CommandoTextChannel[]): Promise<void> {
        if (channels.length === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.',
            }));
            return;
        }

        await generateEmbed(context, channels, {
            number: 20,
            authorName: `There's ${pluralize('lockdown channel', channels.length)}`,
            authorIconURL: context.guild.iconURL({ forceStatic: false }),
            useDescription: true,
        });
    }

    /**
     * The `add` sub-command
     */
    protected async runChannelsAdd(
        context: CommandContext<true>,
        data: JSONIfySchema<SetupSchema> | null,
        savedChannels: string[],
        channels: string[]
    ): Promise<void> {
        const channelsList = removeRepeated([...savedChannels, ...channels]);
        if (channelsList.length === 0) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'The channels you specified have already been added.',
            }));
            return;
        }

        const { guild, guildId } = context;
        const db = guild.database.setup;
        if (!data) {
            await db.add({
                guild: guildId,
                lockChannels: channelsList,
            });
        } else {
            await db.update(data, { lockChannels: channelsList });
        }

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: 'The following lockdown channels have been added:',
            fieldValue: channelsList.join(', '),
        }));
    }

    /**
     * The `remove` sub-command
     */
    protected async runChannelsRemove(
        context: CommandContext<true>,
        data: JSONIfySchema<SetupSchema> | null,
        savedChannels: string[],
        channels: string[]
    ): Promise<void> {
        if (!data || savedChannels.length === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.',
            }));
            return;
        }

        const channelsList = channels.filter(id => savedChannels.includes(id));
        if (channelsList.length === 0) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'The channels you specified have not been added.',
            }));
            return;
        }

        await context.guild.database.setup.update(data, {
            $pull: { lockChannels: { $in: channelsList } },
        });

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: 'The following lockdown channels have been removed:',
            fieldValue: channelsList.join(', '),
        }));
    }
}

async function parseLockdownChannels(
    value: Nullable<string>, message: CommandoMessage, command: LockdownCommand
): Promise<CommandoTextChannel[]> {
    if (!value) return [];
    const results = await Promise.all(value.split(/ +/).map(query =>
        parseArgInput(query, message, command.argsCollector?.args[1] as Argument, 'text-channel')
    ));
    return Util.filterNullishItems(results);
}
