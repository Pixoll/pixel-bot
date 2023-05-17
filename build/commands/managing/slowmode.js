"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'rateLimit',
        prompt: 'What will be the channel\'s new rate limit?',
        type: ['duration', 'string'],
        async validate(value, message, argument) {
            const durationType = message.client.registry.types.get('duration');
            const isValid = await durationType?.validate(value, message, argument) ?? true;
            if (isValid !== true)
                return isValid;
            return value === 'off';
        },
    }, {
        key: 'channel',
        prompt: 'In what channel do you want to change the rate limit?',
        type: ['text-channel', 'thread-channel', 'voice-channel'],
        required: false,
    }];
class SlowmodeCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'slowmode',
            aliases: ['ratelimit'],
            group: 'managing',
            description: 'Enable, change or disable slowmode/rate limit on a channel.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`channel\` can be either a channel's name, mention or ID.
                \`time\` uses the bot's time formatting, for more information use the \`help\` command.
                Setting \`time\` as \`0\` or \`off\` will disable the slowmode on the specified channel.
            `,
            format: 'slowmode [channel] [time]',
            examples: [
                'slowmode #main-chat 3s',
                'slowmode commands off',
            ],
            clientPermissions: ['ManageChannels'],
            userPermissions: ['ManageChannels'],
            guildOnly: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Integer,
                    name: 'rate-limit',
                    description: 'The channel\'s new rate limit, in seconds.',
                    required: true,
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Channel,
                    channelTypes: [
                        discord_js_1.ChannelType.AnnouncementThread,
                        discord_js_1.ChannelType.GuildText,
                        discord_js_1.ChannelType.PrivateThread,
                        discord_js_1.ChannelType.PublicThread,
                    ],
                    name: 'channel',
                    description: 'The channel to change its rate limit.',
                }],
        });
    }
    async run(context, { channel, rateLimit }) {
        rateLimit = parseRateLimit(context, rateLimit);
        const targetChannel = channel ?? context.channel;
        if (targetChannel.type === discord_js_1.ChannelType.GuildAnnouncement) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'The current/targeted channel is not a text, thread or voice channel.',
            }));
            return;
        }
        if (targetChannel.rateLimitPerUser === rateLimit) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'The slowmode is already set to that value.',
            }));
            return;
        }
        await targetChannel.setRateLimitPerUser(rateLimit, `Rate-limited channel via "${this.name}" command.`);
        if (rateLimit === 0) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Green',
                emoji: 'check',
                description: `Disabled slowmode in ${targetChannel.toString()}`,
            }));
            return;
        }
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `Changed slowmode in ${targetChannel.toString()}`,
            fieldValue: `**New rate limit:** ${(0, better_ms_1.prettyMs)(rateLimit * 1000, { verbose: true })}`,
        }));
    }
}
exports.default = SlowmodeCommand;
function parseRateLimit(context, rateLimit) {
    if (rateLimit === 'off')
        return 0;
    if (context.isMessage())
        return Math.trunc(rateLimit / 1000);
    return Math.trunc(rateLimit);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xvd21vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWFuYWdpbmcvc2xvd21vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBcUM7QUFDckMsNkNBQTBDO0FBQzFDLDJDQUF1RTtBQUN2RSxxREFReUI7QUFDekIsdUNBQWdEO0FBRWhELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsV0FBVztRQUNoQixNQUFNLEVBQUUsNkNBQTZDO1FBQ3JELElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUM7UUFDNUIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBa0I7WUFDbEYsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRSxNQUFNLE9BQU8sR0FBRyxNQUFNLFlBQVksRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUM7WUFDL0UsSUFBSSxPQUFPLEtBQUssSUFBSTtnQkFBRSxPQUFPLE9BQU8sQ0FBQztZQUNyQyxPQUFPLEtBQUssS0FBSyxLQUFLLENBQUM7UUFDM0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsU0FBUztRQUNkLE1BQU0sRUFBRSx1REFBdUQ7UUFDL0QsSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLGdCQUFnQixFQUFFLGVBQWUsQ0FBQztRQUN6RCxRQUFRLEVBQUUsS0FBSztLQUNsQixDQUFvRCxDQUFDO0FBT3RELE1BQXFCLGVBQWdCLFNBQVEseUJBQXNCO0lBQy9ELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsVUFBVTtZQUNoQixPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUM7WUFDdEIs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