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
            details: (0, common_tags_1.stripIndent) `
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
                    await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                        color: 'Red',
                        emoji: 'cross',
                        description: 'You need to send at least 2 emojis.',
                    }));
                    return;
                }
            }
            else if (!messageUrl || !(0, utils_1.validateURL)(messageUrl)) {
                await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
                await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
        const winners = results.sort((a, b) => b.votes - a.votes).filter((d, _, results) => results[0].votes === d.votes);
        const winner = winners.length === 1
            ? `The winner was the choice ${winners[0].emoji} with a total of \`${winners[0].votes}\` votes!` : null;
        const draw = winners.length > 1
            ? `It seems like there was a draw between these choices: ${winners.map(d => d.emoji).join(', ')}` : null;
        const noVotes = results.filter(d => d.votes === 0).length === results.length
            ? 'It seems like no one voted on this poll...' : null;
        const pollEmbed = new discord_js_1.EmbedBuilder()
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
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tYW5hZ2luZy9wb2xsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUFxRjtBQUNyRixxREFTeUI7QUFDekIsdUNBVXFCO0FBRXJCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsWUFBWTtRQUNqQixLQUFLLEVBQUUsYUFBYTtRQUNwQixNQUFNLEVBQUUsc0NBQXNDO1FBQzlDLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQztRQUN4QixLQUFLLENBQUMsS0FBYTtZQUNmLE9BQU8sS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9CLENBQUM7S0FDSixFQUFFO1FBQ0MsR0FBRyxFQUFFLFNBQVM7UUFDZCxNQUFNLEVBQUUscURBQXFEO1FBQzdELElBQUksRUFBRSxjQUFjO0tBQ3ZCLEVBQUU7UUFDQyxHQUFHLEVBQUUsZUFBZTtRQUNwQixLQUFLLEVBQUUscUJBQXFCO1FBQzVCLE1BQU0sRUFBRSx1RkFBdUY7UUFDL0YsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUM7UUFDcEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBa0I7WUFDbEYsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSztpQkFDekQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsc0JBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO2lCQUN4RCxNQUFNLEVBQUUsQ0FBQztZQUNkLElBQUksVUFBVSxLQUFLLFFBQVEsRUFBRTtnQkFDekIsTUFBTSxXQUFXLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ3RFLElBQUksV0FBVyxLQUFLLElBQUk7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3RDLE9BQU8sTUFBTSxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDaEU7WUFDRCxNQUFNLFlBQVksR0FBRyxpQ0FBZSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkUsTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQXdCLENBQUM7WUFDbEgsTUFBTSxjQUFjLEdBQUcsTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25GLE9BQU8sQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUM1QixDQUFDO0tBQ0osQ0FBVSxDQUFDO0FBV1osTUFBcUIsV0FBWSxTQUFRLHlCQUFzQjtJQUMzRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsdUJBQXVCO1lBQ3BDLE9BQU8sRUFBRSxJQUFBLHlCQUFXLEVBQUE7Ozs7YUFJbkI7WUFDRCxNQUFNLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7YUFHbEI7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sdUJBQXVCO2dCQUN2QixpQkFBaUI7Z0JBQ2pCLG1DQUFtQzthQUN0QztZQUNELGNBQWMsRUFBRSxJQUFJO1lBQ3BCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtTQUNQLEVBQUU7WUFDQyxPQUFPLEVBQUUsQ0FBQztvQkFDTixJQUFJLEVBQUUseUNBQTRCLENBQUMsVUFBVTtvQkFDN0MsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsV0FBVyxFQUFFLGdCQUFnQjtvQkFDN0IsT0FBTyxFQUFFLENBQUM7NEJBQ04sSUFBSSxFQUFFLHlDQUE0QixDQUFDLE9BQU87NEJBQzFDLFlBQVksRUFBRSxDQUFDLHdCQUFXLENBQUMsU0FBUyxDQUFDOzRCQUNyQyxJQUFJLEVBQUUsU0FBUzs0QkFDZixXQUFXLEVBQUUsdUNBQXVDOzRCQUNwRCxRQUFRLEVBQUUsSUFBSTt5QkFDakIsRUFBRTs0QkFDQyxJQUFJLEVBQUUseUNBQTRCLENBQUMsTUFBTTs0QkFDekMsSUFBSSxFQUFFLFVBQVU7NEJBQ2hCLFdBQVcsRUFBRSwyQkFBMkI7NEJBQ3hDLFFBQVEsRUFBRSxJQUFJO3lCQUNqQixFQUFFOzRCQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxNQUFNOzRCQUN6QyxJQUFJLEVBQUUsU0FBUzs0QkFDZixXQUFXLEVBQUUsb0NBQW9DOzRCQUNqRCxRQUFRLEVBQUUsSUFBSTt5QkFDakIsRUFBRTs0QkFDQyxJQUFJLEVBQUUseUNBQTRCLENBQUMsTUFBTTs0QkFDekMsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLHFEQUFxRDs0QkFDbEUsUUFBUSxFQUFFLElBQUk7eUJBQ2pCLENBQUM7aUJBQ0wsRUFBRTtvQkFDQyxJQUFJLEVBQUUseUNBQTRCLENBQUMsVUFBVTtvQkFDN0MsSUFBSSxFQUFFLEtBQUs7b0JBQ1gsV0FBVyxFQUFFLGFBQWE7b0JBQzFCLE9BQU8sRUFBRSxDQUFDOzRCQUNOLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxNQUFNOzRCQUN6QyxJQUFJLEVBQUUsYUFBYTs0QkFDbkIsV0FBVyxFQUFFLGtDQUFrQzs0QkFDL0MsUUFBUSxFQUFFLElBQUk7eUJBQ2pCLENBQUM7aUJBQ0wsQ0FBQztTQUNMLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUNaLE9BQTZCLEVBQzdCLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBYztRQUV0RyxNQUFNLFdBQVcsR0FBYSxFQUFFLENBQUM7UUFDakMsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUU7WUFDekIsSUFBSSxVQUFVLEtBQUssUUFBUSxFQUFFO2dCQUN6QixNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUEsb0JBQVksRUFBQyxPQUFPLEVBQUUsSUFBZSxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDakYsSUFBSSxzQkFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7b0JBQUUsT0FBTztnQkFDM0MsYUFBYSxHQUFHLGNBQWMsQ0FBQztnQkFFL0IsV0FBVyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUN4QixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO3dCQUMvQixLQUFLLEVBQUUsS0FBSzt3QkFDWixLQUFLLEVBQUUsT0FBTzt3QkFDZCxXQUFXLEVBQUUscUNBQXFDO3FCQUNyRCxDQUFDLENBQUMsQ0FBQztvQkFDSixPQUFPO2lCQUNWO2FBQ0o7aUJBQU0sSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUEsbUJBQVcsRUFBQyxVQUFVLENBQUMsRUFBRTtnQkFDaEQsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztvQkFDL0IsS0FBSyxFQUFFLEtBQUs7b0JBQ1osS0FBSyxFQUFFLE9BQU87b0JBQ2QsV0FBVyxFQUFFLDhCQUE4QjtpQkFDOUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osT0FBTzthQUNWO1NBQ0o7UUFFRCxRQUFRLFVBQVUsRUFBRTtZQUNoQixLQUFLLFFBQVE7Z0JBQ1QsT0FBTyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxhQUE4QixFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN6RyxLQUFLLEtBQUs7Z0JBQ04sT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxhQUF1QixFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQ3BGO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ08sS0FBSyxDQUFDLE1BQU0sQ0FDbEIsT0FBNkIsRUFDN0IsT0FBNEIsRUFDNUIsUUFBdUIsRUFDdkIsV0FBK0IsRUFDL0IsTUFBZ0I7UUFFaEIsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRTNDLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUTtZQUFFLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDekQsSUFBSSxRQUFRLFlBQVksSUFBSTtZQUFFLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFNUQsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUU7WUFDckIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLHNCQUFjLEVBQUMsT0FBTyxFQUFFO2dCQUMxQyxTQUFTLEVBQUUsdUNBQXVDO2FBQ3JELEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEtBQU0sRUFBRSxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLE9BQU87Z0JBQUUsT0FBTztZQUNyQixXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztZQUU5QixPQUFPLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN0QixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsc0JBQWMsRUFBQyxPQUFPLEVBQUU7b0JBQzVDLFNBQVMsRUFBRSw2RkFBNkY7aUJBQzNHLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEtBQU0sRUFBRSxDQUFDLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxTQUFTO29CQUFFLE9BQU87Z0JBQ3ZCLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNsRDtTQUNKO1FBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUEseUJBQVcsRUFBQTtjQUNyQyxXQUFXO2dDQUNPLElBQUEsaUJBQVMsRUFBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLElBQUEsaUJBQVMsRUFBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQztTQUN4RixDQUFDLENBQUM7UUFDSCxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU07WUFBRSxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFcEQsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7WUFDM0IsS0FBSyxFQUFFLE9BQU87WUFDZCxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUU7WUFDbkIsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ2hCLE1BQU07WUFDTixRQUFRLEVBQUUsUUFBUTtTQUNyQixDQUFDLENBQUM7UUFFSCxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO1lBQy9CLEtBQUssRUFBRSxPQUFPO1lBQ2QsS0FBSyxFQUFFLE9BQU87WUFDZCxXQUFXLEVBQUUscUNBQXFDLElBQUEsaUJBQVMsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHO1NBQ25GLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQUVEOztPQUVHO0lBQ08sS0FBSyxDQUFDLEdBQUcsQ0FDZixPQUE2QixFQUFFLE9BQTRCLEVBQUUsR0FBVyxFQUFFLE9BQWdCO1FBRTFGLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDMUIsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUUzQixNQUFNLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEdBQUcsT0FBTyxFQUFFLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsRyxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxPQUFPLEVBQUU7WUFDcEMsTUFBTSxhQUFhLEdBQUcsTUFBTSxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUNoQixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO29CQUMvQixLQUFLLEVBQUUsS0FBSztvQkFDWixLQUFLLEVBQUUsT0FBTztvQkFDZCxXQUFXLEVBQUUsa0RBQWtEO2lCQUNsRSxDQUFDLENBQUMsQ0FBQztnQkFDSixPQUFPO2FBQ1Y7WUFDRCxPQUFPLEdBQUcsYUFBb0MsQ0FBQztTQUNsRDtRQUVELE1BQU0sYUFBYSxHQUFHLE1BQU0sT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RixJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ2hCLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQy9CLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxPQUFPO2dCQUNkLFdBQVcsRUFBRSwyQ0FBMkM7YUFDM0QsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUNoQyxNQUFNLFFBQVEsR0FBRyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDNUIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFO1lBQ25CLE9BQU8sRUFBRSxhQUFhLENBQUMsRUFBRTtTQUM1QixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsV0FBVyxFQUFFLGlEQUFpRDthQUNqRSxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUN2RCxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FDN0QsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVYLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNuQixLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtZQUM5QixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNqQyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNsQztRQUVELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFbEgsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQy9CLENBQUMsQ0FBQyw2QkFBNkIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssc0JBQXNCLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRTVHLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUMzQixDQUFDLENBQUMseURBQXlELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUU3RyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssT0FBTyxDQUFDLE1BQU07WUFDeEUsQ0FBQyxDQUFDLDRDQUE0QyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFMUQsTUFBTSxTQUFTLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQy9CLFFBQVEsQ0FBQyxTQUFTLENBQUM7YUFDbkIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLHFCQUFxQjtZQUMzQixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLFNBQVM7WUFDM0QsR0FBRyxFQUFFLGFBQWEsQ0FBQyxHQUFHO1NBQ3pCLENBQUM7YUFDRCxjQUFjLENBQUMsTUFBTSxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUM7YUFDekMsWUFBWSxFQUFFLENBQUM7UUFFcEIsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNWLFNBQVMsQ0FBQyxTQUFTLENBQUM7Z0JBQ2hCLElBQUksRUFBRSw2QkFBNkI7Z0JBQ25DLEtBQUssRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUMzRixDQUFDLENBQUM7U0FDTjtRQUVELE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFMUIsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztZQUMvQixLQUFLLEVBQUUsT0FBTztZQUNkLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLGVBQWUsYUFBYSxDQUFDLEdBQUcsbUJBQW1CO1NBQ25FLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztDQUNKO0FBelBELDhCQXlQQztBQUVELFNBQVMsV0FBVyxDQUFDLEtBQXlCLEVBQUUsS0FBZSxFQUFFLE1BQXNCO0lBQ25GLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ3RDLE1BQU0sS0FBSyxHQUFHLEtBQUssRUFBRSxLQUFLLENBQUMsa0JBQVUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN6RSxLQUFLLE1BQU0sS0FBSyxJQUFJLEtBQUssRUFBRTtRQUN2QixJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBQUUsU0FBUztRQUVwQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztZQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEMsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztZQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDL0M7QUFDTCxDQUFDIn0=