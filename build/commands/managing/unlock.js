"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'channel',
        prompt: 'What channel do you want to unlock?',
        type: ['text-channel', 'voice-channel'],
        required: false,
    }, {
        key: 'reason',
        prompt: 'What message do you want to send when the channel get\'s unlocked?',
        type: 'string',
        max: 512,
        default: 'Thanks for waiting.',
    }];
class UnlockCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'unlock',
            group: 'managing',
            description: 'Unlock a channel, granting the `Send Messages` permission from @everyone.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`channel\` can be either a channel's name, mention or ID.
                If \`reason\` is not specified, it will default as "Thanks for waiting".
            `,
            format: 'lock [channel] <reason>',
            examples: ['unlock #chat Thanks for waiting'],
            clientPermissions: ['ManageChannels'],
            userPermissions: ['ManageChannels'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { channel, reason }) {
        const targetChannel = channel ?? context.channel;
        if (targetChannel.type === discord_js_1.ChannelType.GuildAnnouncement || targetChannel.isThread()) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'The current/targeted channel is not a text or voice channel.',
            }));
            return;
        }
        reason ??= 'We\'ll be back shortly.';
        const { guildId, guild } = context;
        const permissions = targetChannel.permissionOverwrites;
        const { everyone } = guild.roles;
        const perms = permissions.resolve(guildId);
        if (perms && !perms.deny.has('SendMessages')) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: `${targetChannel.toString()} is already unlocked.`,
            }));
            return;
        }
        await permissions.edit(everyone.id, { SendMessages: null }, {
            reason: `Unlocked channel via "${this.name}" command.`,
            type: discord_js_1.OverwriteType.Role,
        });
        await targetChannel.send({
            embeds: [(0, utils_1.basicEmbed)({
                    emoji: '\\🔓',
                    fieldName: 'This channel has been unlocked',
                    fieldValue: reason,
                })],
        });
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: `Unlocked ${targetChannel.toString()}.`,
        }));
    }
}
exports.default = UnlockCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5sb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21hbmFnaW5nL3VubG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FBd0Q7QUFDeEQscURBQTZGO0FBQzdGLHVDQUFnRDtBQUVoRCxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFNBQVM7UUFDZCxNQUFNLEVBQUUscUNBQXFDO1FBQzdDLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxlQUFlLENBQUM7UUFDdkMsUUFBUSxFQUFFLEtBQUs7S0FDbEIsRUFBRTtRQUNDLEdBQUcsRUFBRSxRQUFRO1FBQ2IsTUFBTSxFQUFFLG9FQUFvRTtRQUM1RSxJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxHQUFHO1FBQ1IsT0FBTyxFQUFFLHFCQUFxQjtLQUNqQyxDQUFVLENBQUM7QUFLWixNQUFxQixhQUFjLFNBQVEseUJBQXNCO0lBQzdELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxVQUFVO1lBQ2pCLFdBQVcsRUFBRSwyRUFBMkU7WUFDeEYsbUJBQW1CLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7YUFHL0I7WUFDRCxNQUFNLEVBQUUseUJBQXlCO1lBQ2pDLFFBQVEsRUFBRSxDQUFDLGlDQUFpQyxDQUFDO1lBQzdDLGlCQUFpQixFQUFFLENBQUMsZ0JBQWdCLENBQUM7WUFDckMsZUFBZSxFQUFFLENBQUMsZ0JBQWdCLENBQUM7WUFDbkMsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBYztRQUMzRSxNQUFNLGFBQWEsR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUNqRCxJQUFJLGFBQWEsQ0FBQyxJQUFJLEtBQUssd0JBQVcsQ0FBQyxpQkFBaUIsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDbEYsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUM1QixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxXQUFXLEVBQUUsOERBQThEO2FBQzlFLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBQ0QsTUFBTSxLQUFLLHlCQUF5QixDQUFDO1FBRXJDLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ25DLE1BQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQztRQUN2RCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUVqQyxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLElBQUksS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDMUMsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUM1QixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxXQUFXLEVBQUUsR0FBRyxhQUFhLENBQUMsUUFBUSxFQUFFLHVCQUF1QjthQUNsRSxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3hELE1BQU0sRUFBRSx5QkFBeUIsSUFBSSxDQUFDLElBQUksWUFBWTtZQUN0RCxJQUFJLEVBQUUsMEJBQWEsQ0FBQyxJQUFJO1NBQzNCLENBQUMsQ0FBQztRQUNILE1BQU0sYUFBYSxDQUFDLElBQUksQ0FBQztZQUNyQixNQUFNLEVBQUUsQ0FBQyxJQUFBLGtCQUFVLEVBQUM7b0JBQ2hCLEtBQUssRUFBRSxNQUFNO29CQUNiLFNBQVMsRUFBRSxnQ0FBZ0M7b0JBQzNDLFVBQVUsRUFBRSxNQUFNO2lCQUNyQixDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7UUFFSCxNQUFNLElBQUEsYUFBSyxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7WUFDNUIsS0FBSyxFQUFFLE9BQU87WUFDZCxLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxZQUFZLGFBQWEsQ0FBQyxRQUFRLEVBQUUsR0FBRztTQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7Q0FDSjtBQWhFRCxnQ0FnRUMifQ==