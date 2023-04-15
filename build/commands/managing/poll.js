"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'Do you want to create or end a poll?',
        type: 'string',
        oneOf: ['create', 'end'],
        parse(value) {
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
        async validate(value, message, argument) {
            const subCommand = (0, utils_1.getSubCommand)(message);
            const [dateType, durationType] = message.client.registry.types
                .filter(arg => pixoll_commando_1.Util.equals(arg.id, ['date', 'duration']))
                .toJSON();
            if (subCommand === 'create') {
                const isValidDate = await dateType.validate(value, message, argument);
                if (isValidDate === true)
                    return true;
                return await durationType.validate(value, message, argument);
            }
            const channelQuery = pixoll_commando_1.CommandoMessage.parseArgs(message.content)[1];
            const channel = await message.command?.argsCollector?.args[1].parse(channelQuery, message);
            const fetchedMessage = await channel.messages.fetch(value ?? '').catch(() => null);
            return !!fetchedMessage;
        },
    }];
class PollCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'poll',
            group: 'managing',
            description: 'Create or end a poll.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`channel\` can be either a channel's name, mention or ID.
                \`duration\` uses the bot's time formatting, for more information use the \`help\` command.
                \`msg ID\` has to be a message's ID that's in the **same channel** that you specified.
            `,
            format: (0, common_tags_1.stripIndent) `
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
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'create',
                    description: 'Create a poll.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.Channel,
                            channelTypes: [discord_js_1.ChannelType.GuildText],
                            name: 'channel',
                            description: 'The channel where to create the poll.',
                            required: true,
                        }, {
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'duration',
                            description: 'The duration of the poll.',
                            required: true,
                        }, {
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'message',
                            description: 'The message to send with the poll.',
                            required: true,
                        }, {
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'emojis',
                            description: 'The emojis for the options of the poll (min. of 2).',
                            required: true,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'end',
                    description: 'End a poll.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'message-url',
                            description: 'The link/url of the poll to end.',
                            required: true,
                        }],
                }],
        });
    }
    async run(context, { subCommand, channel, durationOrMsg, duration, message: pollMessage, emojis, messageUrl }) {
        const emojisArray = [];
        if (context.isInteraction()) {
            if (subCommand === 'create') {
                const parsedDuration = await (0, utils_1.parseArgDate)(context, this, 2, duration);
                if (pixoll_commando_1.Util.isNullish(parsedDuration))
                    return;
                durationOrMsg = parsedDuration;
                parseEmojis(emojis, emojisArray, context.client);
                if (emojisArray.length < 2) {
                    await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                        color: 'Red',
                        emoji: 'cross',
                        description: 'You need to send at least 2 emojis.',
                    }));
                    return;
                }
            }
            else if (!messageUrl || !(0, utils_1.validateURL)(messageUrl)) {
                await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'That message url is invalid.',
                }));
                return;
            }
        }
        switch (subCommand) {
            case 'create':
                return await this.create(context, channel, durationOrMsg, pollMessage, emojisArray);
            case 'end':
                return await this.end(context, channel, durationOrMsg, messageUrl);
        }
    }
    /**
     * The `create` sub-command
     */
    async create(context, channel, duration, pollMessage, emojis) {
        const { guild, guildId, client } = context;
        if (typeof duration === 'number')
            duration += Date.now();
        if (duration instanceof Date)
            duration = duration.getTime();
        if (context.isMessage()) {
            const pollMsg = await (0, utils_1.basicCollector)(context, {
                fieldName: 'What will the message of the poll be?',
            }, { time: 2 * 60000 });
            if (!pollMsg)
                return;
            pollMessage = pollMsg.content;
            while (emojis.length < 2) {
                const emojisMsg = await (0, utils_1.basicCollector)(context, {
                    fieldName: 'Now, what emojis should the bot react with in the poll message? Please send **at least 2.**',
                }, { time: 2 * 60000 });
                if (!emojisMsg)
                    return;
                parseEmojis(emojisMsg.content, emojis, client);
            }
        }
        const sent = await channel.send((0, common_tags_1.stripIndent) `
            ${pollMessage}\n
            This poll ends at ${(0, utils_1.timestamp)(duration, 'f', true)} (${(0, utils_1.timestamp)(duration, 'R', true)}.)
        `);
        for (const emoji of emojis)
            await sent.react(emoji);
        await guild.database.polls.add({
            guild: guildId,
            channel: channel.id,
            message: sent.id,
            emojis,
            duration: duration,
        });
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: `The poll was successfully created ${(0, utils_1.hyperlink)('here', sent.url)}.`,
        }));
    }
    /**
     * The `end` sub-command
     */
    async end(context, channel, msg, pollURL) {
        const { guild } = context;
        const { channels } = guild;
        const [, channelId, messageId] = pollURL?.match(/(\d{17,20})[/-](\d{17,20})$/)?.map(m => m) || [];
        if (context.isInteraction() && pollURL) {
            const parsedChannel = await channels.fetch(channelId).catch(() => null);
            if (!parsedChannel) {
                await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'I couldn\'t get the server channel from the url.',
                }));
                return;
            }
            channel = parsedChannel;
        }
        const parsedMessage = await channel.messages.fetch(msg ?? messageId).catch(() => null);
        if (!parsedMessage) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'I couldn\'t find the poll you were looking for.',
            }));
            return;
        }
        const reactions = parsedMessage.reactions.cache.filter(r => pollData.emojis.includes(r.emoji.id ?? r.emoji.name ?? '')).toJSON();
        const results = [];
        for (const reaction of reactions) {
            const votes = reaction.count - 1;
            const emoji = reaction.emoji.toString();
            results.push({ votes, emoji });
        }
        const winners = results
            .sort((a, b) => b.votes - a.votes)
            .filter((d, _, results) => results[0].votes === d.votes);
        const winner = winners.length === 1
            ? `The winner was the choice ${winners[0].emoji} with a total of \`${winners[0].votes}\` votes!` : null;
        const draw = winners.length > 1
            ? `It seems like there was a draw between these choices: ${winners.map(d => d.emoji).join(', ')}` : null;
        const noVotes = results.filter(d => d.votes === 0).length === results.length
            ? 'It seems like no one voted on this poll...' : null;
        const pollEmbed = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: `[This poll](${parsedMessage.url}) has been ended.`,
        }));
    }
}
exports.default = PollCommand;
function parseEmojis(query, array, client) {
    const allEmojis = client.emojis.cache;
    const match = query?.match(utils_1.emojiRegex)?.map(e => e).filter(e => e) ?? [];
    for (const emoji of match) {
        if (array.includes(emoji))
            continue;
        if (!parseInt(emoji))
            array.push(emoji);
        if (allEmojis.get(emoji))
            array.push(emoji);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tYW5hZ2luZy9wb2xsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUFrRztBQUNsRyxxREFTeUI7QUFDekIsdUNBV3FCO0FBRXJCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsWUFBWTtRQUNqQixLQUFLLEVBQUUsYUFBYTtRQUNwQixNQUFNLEVBQUUsc0NBQXNDO1FBQzlDLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQztRQUN4QixLQUFLLENBQUMsS0FBYTtZQUNmLE9BQU8sS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9CLENBQUM7S0FDSixFQUFFO1FBQ0MsR0FBRyxFQUFFLFNBQVM7UUFDZCxNQUFNLEVBQUUscURBQXFEO1FBQzdELElBQUksRUFBRSxjQUFjO0tBQ3ZCLEVBQUU7UUFDQyxHQUFHLEVBQUUsZUFBZTtRQUNwQixLQUFLLEVBQUUscUJBQXFCO1FBQzVCLE1BQU0sRUFBRSx1RkFBdUY7UUFDL0YsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUM7UUFDcEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBa0I7WUFDbEYsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSztpQkFDekQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsc0JBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO2lCQUN4RCxNQUFN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