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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tYW5hZ2luZy9wb2xsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUFxRjtBQUNyRixxREFTeUI7QUFDekIsdUNBV3FCO0FBRXJCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsWUFBWTtRQUNqQixLQUFLLEVBQUUsYUFBYTtRQUNwQixNQUFNLEVBQUUsc0NBQXNDO1FBQzlDLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQztRQUN4QixLQUFLLENBQUMsS0FBYTtZQUNmLE9BQU8sS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9CLENBQUM7S0FDSixFQUFFO1FBQ0MsR0FBRyxFQUFFLFNBQVM7UUFDZCxNQUFNLEVBQUUscURBQXFEO1FBQzdELElBQUksRUFBRSxjQUFjO0tBQ3ZCLEVBQUU7UUFDQyxHQUFHLEVBQUUsZUFBZTtRQUNwQixLQUFLLEVBQUUscUJBQXFCO1FBQzVCLE1BQU0sRUFBRSx1RkFBdUY7UUFDL0YsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUM7UUFDcEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBa0I7WUFDbEYsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSztpQkFDekQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsc0JBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO2lCQUN4RCxNQUFNLEVBQUUsQ0FBQztZQUNkLElBQUksVUFBVSxLQUFLLFFBQVEsRUFBRTtnQkFDekIsTUFBTSxXQUFXLEdBQUcsTUFBTSxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ3RFLElBQUksV0FBVyxLQUFLLElBQUk7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3RDLE9BQU8sTUFBTSxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDaEU7WUFDRCxNQUFNLFlBQVksR0FBRyxpQ0FBZSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkUsTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQXdCLENBQUM7WUFDbEgsTUFBTSxjQUFjLEdBQUcsTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25GLE9BQU8sQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUM1QixDQUFDO0tBQ0osQ0FBVSxDQUFDO0FBV1osTUFBcUIsV0FBWSxTQUFRLHlCQUFzQjtJQUMzRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsdUJBQXVCO1lBQ3BDLG1CQUFtQixFQUFFLElBQUEseUJBQVcsRUFBQTs7OzthQUkvQjtZQUNELE1BQU0sRUFBRSxJQUFBLHlCQUFXLEVBQUE7OzthQUdsQjtZQUNELFFBQVEsRUFBRTtnQkFDTix1QkFBdUI7Z0JBQ3ZCLGlCQUFpQjtnQkFDakIsbUNBQW1DO2FBQ3RDO1lBQ0QsY0FBYyxFQUFFLElBQUk7WUFDcEIsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1NBQ1AsRUFBRTtZQUNDLE9BQU8sRUFBRSxDQUFDO29CQUNOLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVO29CQUM3QyxJQUFJLEVBQUUsUUFBUTtvQkFDZCxXQUFXLEVBQUUsZ0JBQWdCO29CQUM3QixPQUFPLEVBQUUsQ0FBQzs0QkFDTixJQUFJLEVBQUUseUNBQTRCLENBQUMsT0FBTzs0QkFDMUMsWUFBWSxFQUFFLENBQUMsd0JBQVcsQ0FBQyxTQUFTLENBQUM7NEJBQ3JDLElBQUksRUFBRSxTQUFTOzRCQUNmLFdBQVcsRUFBRSx1Q0FBdUM7NEJBQ3BELFFBQVEsRUFBRSxJQUFJO3lCQUNqQixFQUFFOzRCQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxNQUFNOzRCQUN6QyxJQUFJLEVBQUUsVUFBVTs0QkFDaEIsV0FBVyxFQUFFLDJCQUEyQjs0QkFDeEMsUUFBUSxFQUFFLElBQUk7eUJBQ2pCLEVBQUU7NEJBQ0MsSUFBSSxFQUFFLHlDQUE0QixDQUFDLE1BQU07NEJBQ3pDLElBQUksRUFBRSxTQUFTOzRCQUNmLFdBQVcsRUFBRSxvQ0FBb0M7NEJBQ2pELFFBQVEsRUFBRSxJQUFJO3lCQUNqQixFQUFFOzRCQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxNQUFNOzRCQUN6QyxJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUscURBQXFEOzRCQUNsRSxRQUFRLEVBQUUsSUFBSTt5QkFDakIsQ0FBQztpQkFDTCxFQUFFO29CQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVO29CQUM3QyxJQUFJLEVBQUUsS0FBSztvQkFDWCxXQUFXLEVBQUUsYUFBYTtvQkFDMUIsT0FBTyxFQUFFLENBQUM7NEJBQ04sSUFBSSxFQUFFLHlDQUE0QixDQUFDLE1BQU07NEJBQ3pDLElBQUksRUFBRSxhQUFhOzRCQUNuQixXQUFXLEVBQUUsa0NBQWtDOzRCQUMvQyxRQUFRLEVBQUUsSUFBSTt5QkFDakIsQ0FBQztpQkFDTCxDQUFDO1NBQ0wsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQ1osT0FBNkIsRUFDN0IsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFjO1FBRXRHLE1BQU0sV0FBVyxHQUFhLEVBQUUsQ0FBQztRQUNqQyxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRTtZQUN6QixJQUFJLFVBQVUsS0FBSyxRQUFRLEVBQUU7Z0JBQ3pCLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBQSxvQkFBWSxFQUFDLE9BQU8sRUFBRSxJQUFlLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNqRixJQUFJLHNCQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztvQkFBRSxPQUFPO2dCQUMzQyxhQUFhLEdBQUcsY0FBYyxDQUFDO2dCQUUvQixXQUFXLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2pELElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ3hCLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7d0JBQy9CLEtBQUssRUFBRSxLQUFLO3dCQUNaLEtBQUssRUFBRSxPQUFPO3dCQUNkLFdBQVcsRUFBRSxxQ0FBcUM7cUJBQ3JELENBQUMsQ0FBQyxDQUFDO29CQUNKLE9BQU87aUJBQ1Y7YUFDSjtpQkFBTSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBQSxtQkFBVyxFQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNoRCxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO29CQUMvQixLQUFLLEVBQUUsS0FBSztvQkFDWixLQUFLLEVBQUUsT0FBTztvQkFDZCxXQUFXLEVBQUUsOEJBQThCO2lCQUM5QyxDQUFDLENBQUMsQ0FBQztnQkFDSixPQUFPO2FBQ1Y7U0FDSjtRQUVELFFBQVEsVUFBVSxFQUFFO1lBQ2hCLEtBQUssUUFBUTtnQkFDVCxPQUFPLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLGFBQThCLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3pHLEtBQUssS0FBSztnQkFDTixPQUFPLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLGFBQXVCLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDcEY7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDTyxLQUFLLENBQUMsTUFBTSxDQUNsQixPQUE2QixFQUM3QixPQUE0QixFQUM1QixRQUF1QixFQUN2QixXQUErQixFQUMvQixNQUFnQjtRQUVoQixNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFM0MsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRO1lBQUUsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN6RCxJQUFJLFFBQVEsWUFBWSxJQUFJO1lBQUUsUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUU1RCxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUNyQixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUEsc0JBQWMsRUFBQyxPQUFPLEVBQUU7Z0JBQzFDLFNBQVMsRUFBRSx1Q0FBdUM7YUFDckQsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsS0FBTSxFQUFFLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTztnQkFBRSxPQUFPO1lBQ3JCLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1lBRTlCLE9BQU8sTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3RCLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSxzQkFBYyxFQUFDLE9BQU8sRUFBRTtvQkFDNUMsU0FBUyxFQUFFLDZGQUE2RjtpQkFDM0csRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsS0FBTSxFQUFFLENBQUMsQ0FBQztnQkFDekIsSUFBSSxDQUFDLFNBQVM7b0JBQUUsT0FBTztnQkFDdkIsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ2xEO1NBQ0o7UUFFRCxNQUFNLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBQSx5QkFBVyxFQUFBO2NBQ3JDLFdBQVc7Z0NBQ08sSUFBQSxpQkFBUyxFQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssSUFBQSxpQkFBUyxFQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDO1NBQ3hGLENBQUMsQ0FBQztRQUNILEtBQUssTUFBTSxLQUFLLElBQUksTUFBTTtZQUFFLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVwRCxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztZQUMzQixLQUFLLEVBQUUsT0FBTztZQUNkLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRTtZQUNuQixPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDaEIsTUFBTTtZQUNOLFFBQVEsRUFBRSxRQUFRO1NBQ3JCLENBQUMsQ0FBQztRQUVILE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7WUFDL0IsS0FBSyxFQUFFLE9BQU87WUFDZCxLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxxQ0FBcUMsSUFBQSxpQkFBUyxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUc7U0FDbkYsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBRUQ7O09BRUc7SUFDTyxLQUFLLENBQUMsR0FBRyxDQUNmLE9BQTZCLEVBQUUsT0FBNEIsRUFBRSxHQUFXLEVBQUUsT0FBZ0I7UUFFMUYsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMxQixNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRTNCLE1BQU0sQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsR0FBRyxPQUFPLEVBQUUsS0FBSyxDQUFDLDZCQUE2QixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2xHLElBQUksT0FBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLE9BQU8sRUFBRTtZQUNwQyxNQUFNLGFBQWEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ2hCLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7b0JBQy9CLEtBQUssRUFBRSxLQUFLO29CQUNaLEtBQUssRUFBRSxPQUFPO29CQUNkLFdBQVcsRUFBRSxrREFBa0Q7aUJBQ2xFLENBQUMsQ0FBQyxDQUFDO2dCQUNKLE9BQU87YUFDVjtZQUNELE9BQU8sR0FBRyxhQUFvQyxDQUFDO1NBQ2xEO1FBRUQsTUFBTSxhQUFhLEdBQUcsTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZGLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDaEIsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsV0FBVyxFQUFFLDJDQUEyQzthQUMzRCxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQ2hDLE1BQU0sUUFBUSxHQUFHLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQztZQUM1QixPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUU7WUFDbkIsT0FBTyxFQUFFLGFBQWEsQ0FBQyxFQUFFO1NBQzVCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDWCxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxXQUFXLEVBQUUsaURBQWlEO2FBQ2pFLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQ3ZELFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUM3RCxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRVgsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ25CLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO1lBQzlCLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQ2xDO1FBRUQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVsSCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUM7WUFDL0IsQ0FBQyxDQUFDLDZCQUE2QixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxzQkFBc0IsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFNUcsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDO1lBQzNCLENBQUMsQ0FBQyx5REFBeUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRTdHLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxPQUFPLENBQUMsTUFBTTtZQUN4RSxDQUFDLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUUxRCxNQUFNLFNBQVMsR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDL0IsUUFBUSxDQUFDLGtCQUFVLENBQUM7YUFDcEIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLHFCQUFxQjtZQUMzQixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLFNBQVM7WUFDM0QsR0FBRyxFQUFFLGFBQWEsQ0FBQyxHQUFHO1NBQ3pCLENBQUM7YUFDRCxjQUFjLENBQUMsTUFBTSxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUM7YUFDekMsWUFBWSxFQUFFLENBQUM7UUFFcEIsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNWLFNBQVMsQ0FBQyxTQUFTLENBQUM7Z0JBQ2hCLElBQUksRUFBRSw2QkFBNkI7Z0JBQ25DLEtBQUssRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUMzRixDQUFDLENBQUM7U0FDTjtRQUVELE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFMUIsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztZQUMvQixLQUFLLEVBQUUsT0FBTztZQUNkLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLGVBQWUsYUFBYSxDQUFDLEdBQUcsbUJBQW1CO1NBQ25FLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztDQUNKO0FBelBELDhCQXlQQztBQUVELFNBQVMsV0FBVyxDQUFDLEtBQXlCLEVBQUUsS0FBZSxFQUFFLE1BQXNCO0lBQ25GLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ3RDLE1BQU0sS0FBSyxHQUFHLEtBQUssRUFBRSxLQUFLLENBQUMsa0JBQVUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN6RSxLQUFLLE1BQU0sS0FBSyxJQUFJLEtBQUssRUFBRTtRQUN2QixJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBQUUsU0FBUztRQUVwQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztZQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEMsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztZQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDL0M7QUFDTCxDQUFDIn0=