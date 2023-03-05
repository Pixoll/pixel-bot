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
            details: (0, common_tags_1.stripIndent) `
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