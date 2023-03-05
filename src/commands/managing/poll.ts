import { stripIndent } from 'common-tags';
import { EmbedBuilder, ApplicationCommandOptionType, ChannelType } from 'discord.js';
import {
    Argument,
    Command,
    CommandContext,
    CommandoClient,
    CommandoMessage,
    CommandoTextChannel,
    ParseRawArguments,
    Util,
} from 'pixoll-commando';
import {
    basicCollector,
    validateURL,
    replyAll,
    basicEmbed,
    timestamp,
    getSubCommand,
    parseArgDate,
    emojiRegex,
    hyperlink,
} from '../../utils';

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'Do you want to create or end a poll?',
    type: 'string',
    oneOf: ['create', 'end'],
    parse(value: string): string {
        return value.toLowerCase();
    },
}, {
    key: 'channel',
    prompt: 'On what channel do you want to create/end the poll?',
    type: 'text-channel',
}, {
    key: 'durationOrMsg',
    label: 'duration or message',
    prompt: 'How long should the poll last? Or what\'s the message ID of the poll you want to end?',
    type: ['date', 'duration', 'string'],
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const subCommand = getSubCommand<SubCommand>(message);
        const [dateType, durationType] = message.client.registry.types
            .filter(arg => Util.equals(arg.id, ['date', 'duration']))
            .toJSON();
        if (subCommand === 'create') {
            const isValidDate = await dateType.validate(value, message, argument);
            if (isValidDate === true) return true;
            return await durationType.validate(value, message, argument);
        }
        const channelQuery = CommandoMessage.parseArgs(message.content)[1];
        const channel = await message.command?.argsCollector?.args[1].parse(channelQuery, message) as CommandoTextChannel;
        const fetchedMessage = await channel.messages.fetch(value ?? '').catch(() => null);
        return !!fetchedMessage;
    },
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs> & {
    duration?: string;
    message?: string;
    emojis?: string;
    messageUrl?: string;
};
type SubCommand = ParsedArgs['subCommand'];

export default class PollCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'poll',
            group: 'managing',
            description: 'Create or end a poll.',
            details: stripIndent`
                \`channel\` can be either a channel's name, mention or ID.
                \`duration\` uses the bot's time formatting, for more information use the \`help\` command.
                \`msg ID\` has to be a message's ID that's in the **same channel** that you specified.
            `,
            format: stripIndent`
                poll create [channel] [duration] - Create a poll in that channel.
                poll end <channel> <msg ID> - End the oldest poll in that channel.
            `,
            examples: [
                'poll create polls 12h',
                'poll end #polls',
                'poll end polls 890317796221792336',
            ],
            modPermissions: true,
            guildOnly: true,
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Subcommand,
                name: 'create',
                description: 'Create a poll.',
                options: [{
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildText],
                    name: 'channel',
                    description: 'The channel where to create the poll.',
                    required: true,
                }, {
                    type: ApplicationCommandOptionType.String,
                    name: 'duration',
                    description: 'The duration of the poll.',
                    required: true,
                }, {
                    type: ApplicationCommandOptionType.String,
                    name: 'message',
                    description: 'The message to send with the poll.',
                    required: true,
                }, {
                    type: ApplicationCommandOptionType.String,
                    name: 'emojis',
                    description: 'The emojis for the options of the poll (min. of 2).',
                    required: true,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'end',
                description: 'End a poll.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'message-url',
                    description: 'The link/url of the poll to end.',
                    required: true,
                }],
            }],
        });
    }

    public async run(
        context: CommandContext<true>,
        { subCommand, channel, durationOrMsg, duration, message: pollMessage, emojis, messageUrl }: ParsedArgs
    ): Promise<void> {
        const emojisArray: string[] = [];
        if (context.isInteraction()) {
            if (subCommand === 'create') {
                const parsedDuration = await parseArgDate(context, this as Command, 2, duration);
                if (Util.isNullish(parsedDuration)) return;
                durationOrMsg = parsedDuration;

                parseEmojis(emojis, emojisArray, context.client);
                if (emojisArray.length < 2) {
                    await replyAll(context, basicEmbed({
                        color: 'Red',
                        emoji: 'cross',
                        description: 'You need to send at least 2 emojis.',
                    }));
                    return;
                }
            } else if (!messageUrl || !validateURL(messageUrl)) {
                await replyAll(context, basicEmbed({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'That message url is invalid.',
                }));
                return;
            }
        }

        switch (subCommand) {
            case 'create':
                return await this.create(context, channel, durationOrMsg as Date | number, pollMessage, emojisArray);
            case 'end':
                return await this.end(context, channel, durationOrMsg as string, messageUrl);
        }
    }

    /**
     * The `create` sub-command
     */
    protected async create(
        context: CommandContext<true>,
        channel: CommandoTextChannel,
        duration: Date | number,
        pollMessage: string | undefined,
        emojis: string[]
    ): Promise<void> {
        const { guild, guildId, client } = context;

        if (typeof duration === 'number') duration += Date.now();
        if (duration instanceof Date) duration = duration.getTime();

        if (context.isMessage()) {
            const pollMsg = await basicCollector(context, {
                fieldName: 'What will the message of the poll be?',
            }, { time: 2 * 60_000 });
            if (!pollMsg) return;
            pollMessage = pollMsg.content;

            while (emojis.length < 2) {
                const emojisMsg = await basicCollector(context, {
                    fieldName: 'Now, what emojis should the bot react with in the poll message? Please send **at least 2.**',
                }, { time: 2 * 60_000 });
                if (!emojisMsg) return;
                parseEmojis(emojisMsg.content, emojis, client);
            }
        }

        const sent = await channel.send(stripIndent`
            ${pollMessage}\n
            This poll ends at ${timestamp(duration, 'f', true)} (${timestamp(duration, 'R', true)}.)
        `);
        for (const emoji of emojis) await sent.react(emoji);

        await guild.database.polls.add({
            guild: guildId,
            channel: channel.id,
            message: sent.id,
            emojis,
            duration: duration,
        });

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: `The poll was successfully created ${hyperlink('here', sent.url)}.`,
        }));
    }

    /**
     * The `end` sub-command
     */
    protected async end(
        context: CommandContext<true>, channel: CommandoTextChannel, msg: string, pollURL?: string
    ): Promise<void> {
        const { guild } = context;
        const { channels } = guild;

        const [, channelId, messageId] = pollURL?.match(/(\d{17,20})[/-](\d{17,20})$/)?.map(m => m) || [];
        if (context.isInteraction() && pollURL) {
            const parsedChannel = await channels.fetch(channelId).catch(() => null);
            if (!parsedChannel) {
                await replyAll(context, basicEmbed({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'I couldn\'t get the server channel from the url.',
                }));
                return;
            }
            channel = parsedChannel as CommandoTextChannel;
        }

        const parsedMessage = await channel.messages.fetch(msg ?? messageId).catch(() => null);
        if (!parsedMessage) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'I couldn\'t get the message from the url.',
            }));
            return;
        }

        const db = guild.database.polls;
        const pollData = await db.fetch({
            channel: channel.id,
            message: parsedMessage.id,
        });
        if (!pollData) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'I couldn\'t find the poll you were looking for.',
            }));
            return;
        }

        const reactions = parsedMessage.reactions.cache.filter(r =>
            pollData.emojis.includes(r.emoji.id ?? r.emoji.name ?? '')
        ).toJSON();

        const results = [];
        for (const reaction of reactions) {
            const votes = reaction.count - 1;
            const emoji = reaction.emoji.toString();
            results.push({ votes, emoji });
        }

        const winners = results.sort((a, b) => b.votes - a.votes).filter((d, _, results) => results[0].votes === d.votes);

        const winner = winners.length === 1
            ? `The winner was the choice ${winners[0].emoji} with a total of \`${winners[0].votes}\` votes!` : null;

        const draw = winners.length > 1
            ? `It seems like there was a draw between these choices: ${winners.map(d => d.emoji).join(', ')}` : null;

        const noVotes = results.filter(d => d.votes === 0).length === results.length
            ? 'It seems like no one voted on this poll...' : null;

        const pollEmbed = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: 'The poll has ended!',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
                url: parsedMessage.url,
            })
            .setDescription(winner || noVotes || draw)
            .setTimestamp();

        if (!noVotes) {
            pollEmbed.addFields({
                name: 'These are the full results:',
                value: results.map(d => `**>** Choice ${d.emoji} with \`${d.votes}\` votes.`).join('\n'),
            });
        }

        await channel.send({ embeds: [pollEmbed] });
        await db.delete(pollData);

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: `[This poll](${parsedMessage.url}) has been ended.`,
        }));
    }
}

function parseEmojis(query: string | undefined, array: string[], client: CommandoClient): void {
    const allEmojis = client.emojis.cache;
    const match = query?.match(emojiRegex)?.map(e => e).filter(e => e) ?? [];
    for (const emoji of match) {
        if (array.includes(emoji)) continue;

        if (!parseInt(emoji)) array.push(emoji);
        if (allEmojis.get(emoji)) array.push(emoji);
    }
}
