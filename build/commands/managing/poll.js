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