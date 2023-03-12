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
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'The current/targeted channel is not a text, thread or voice channel.',
            }));
            return;
        }
        if (targetChannel.rateLimitPerUser === rateLimit) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'The slowmode is already set to that value.',
            }));
            return;
        }
        await targetChannel.setRateLimitPerUser(rateLimit, `Rate-limited channel via "${this.name}" command.`);
        if (rateLimit === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Green',
                emoji: 'check',
                description: `Disabled slowmode in ${targetChannel.toString()}`,
            }));
            return;
        }
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xvd21vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWFuYWdpbmcvc2xvd21vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBcUM7QUFDckMsNkNBQTBDO0FBQzFDLDJDQUF1RTtBQUN2RSxxREFBd0g7QUFDeEgsdUNBQW1EO0FBRW5ELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsV0FBVztRQUNoQixNQUFNLEVBQUUsNkNBQTZDO1FBQ3JELElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUM7UUFDNUIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBa0I7WUFDbEYsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRSxNQUFNLE9BQU8sR0FBRyxNQUFNLFlBQVksRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUM7WUFDL0UsSUFBSSxPQUFPLEtBQUssSUFBSTtnQkFBRSxPQUFPLE9BQU8sQ0FBQztZQUNyQyxPQUFPLEtBQUssS0FBSyxLQUFLLENBQUM7UUFDM0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsU0FBUztRQUNkLE1BQU0sRUFBRSx1REFBdUQ7UUFDL0QsSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLGdCQUFnQixFQUFFLGVBQWUsQ0FBQztRQUN6RCxRQUFRLEVBQUUsS0FBSztLQUNsQixDQUFVLENBQUM7QUFPWixNQUFxQixlQUFnQixTQUFRLHlCQUFzQjtJQUMvRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFVBQVU7WUFDaEIsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDO1lBQ3RCLEtB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