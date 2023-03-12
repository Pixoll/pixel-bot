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
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: `${targetChannel.toString()} is already unlocked.`,
            }));
            return;
        }
        await permissions.edit(everyone, { SendMessages: null }, {
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
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: `Unlocked ${targetChannel.toString()}.`,
        }));
    }
}
exports.default = UnlockCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5sb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21hbmFnaW5nL3VubG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FBd0Q7QUFDeEQscURBQTZGO0FBQzdGLHVDQUFtRDtBQUVuRCxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFNBQVM7UUFDZCxNQUFNLEVBQUUscUNBQXFDO1FBQzdDLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxlQUFlLENBQUM7UUFDdkMsUUFBUSxFQUFFLEtBQUs7S0FDbEIsRUFBRTtRQUNDLEdBQUcsRUFBRSxRQUFRO1FBQ2IsTUFBTSxFQUFFLG9FQUFvRTtRQUM1RSxJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxHQUFHO1FBQ1IsT0FBTyxFQUFFLHFCQUFxQjtLQUNqQyxDQUFVLENBQUM7QUFLWixNQUFxQixhQUFjLFNBQVEseUJBQXNCO0lBQzdELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxVQUFVO1lBQ2pCLFdBQVcsRUFBRSwyRUFBMkU7WUFDeEYsbUJBQW1CLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7YUFHL0I7WUFDRCxNQUFNLEVBQUUseUJBQXlCO1lBQ2pDLFFBQVEsRUFBRSxDQUFDLGlDQUFpQyxDQUFDO1lBQzdDLGlCQUFpQixFQUFFLENBQUMsZ0JBQWdCLENBQUM7WUFDckMsZUFBZSxFQUFFLENBQUMsZ0JBQWdCLENBQUM7WUFDbkMsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBYztRQUMzRSxNQUFNLGFBQWEsR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUNqRCxJQUFJLGFBQWEsQ0FBQyxJQUFJLEtBQUssd0JBQVcsQ0FBQyxpQkFBaUIsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDbEYsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsV0FBVyxFQUFFLDhEQUE4RDthQUM5RSxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUNELE1BQU0sS0FBSyx5QkFBeUIsQ0FBQztRQUVyQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUNuQyxNQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsb0JBQW9CLENBQUM7UUFDdkQsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFFakMsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQyxJQUFJLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQzFDLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQy9CLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxPQUFPO2dCQUNkLFdBQVcsRUFBRSxHQUFHLGFBQWEsQ0FBQyxRQUFRLEVBQUUsdUJBQXVCO2FBQ2xFLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNyRCxNQUFNLEVBQUUseUJBQXlCLElBQUksQ0FBQyxJQUFJLFlBQVk7WUFDdEQsSUFBSSxFQUFFLDBCQUFhLENBQUMsSUFBSTtTQUMzQixDQUFDLENBQUM7UUFDSCxNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUM7WUFDckIsTUFBTSxFQUFFLENBQUMsSUFBQSxrQkFBVSxFQUFDO29CQUNoQixLQUFLLEVBQUUsTUFBTTtvQkFDYixTQUFTLEVBQUUsZ0NBQWdDO29CQUMzQyxVQUFVLEVBQUUsTUFBTTtpQkFDckIsQ0FBQyxDQUFDO1NBQ04sQ0FBQyxDQUFDO1FBRUgsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztZQUMvQixLQUFLLEVBQUUsT0FBTztZQUNkLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLFlBQVksYUFBYSxDQUFDLFFBQVEsRUFBRSxHQUFHO1NBQ3ZELENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztDQUNKO0FBaEVELGdDQWdFQyJ9