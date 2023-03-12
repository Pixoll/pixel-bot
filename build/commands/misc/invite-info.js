"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'invite',
        prompt: 'What invite do you want to get information from?',
        type: 'invite',
    }];
class InviteInfoCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'invite-info',
            aliases: ['inviteinfo', 'invinfo'],
            group: 'misc',
            description: 'Displays information about an invite.',
            detailedDescription: '`invite` may be a link, an invite codes, or a vanity code.',
            format: 'invite-info [invite]',
            examples: [
                'invite-info minecraft',
                'invite-info https://discord.gg/Pc9pAHf3GU',
            ],
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    name: 'invite-url',
                    description: 'The invite to get info from.',
                    required: true,
                }],
        });
    }
    async run(context, { invite, inviteUrl }) {
        if (inviteUrl) {
            const fetchedInvite = await this.client.fetchInvite(inviteUrl).catch(() => null);
            if (!fetchedInvite) {
                await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'That invite is invalid.',
                }));
                return;
            }
            invite = fetchedInvite;
        }
        const { guild, channel, url, inviter, presenceCount, memberCount, maxUses, expiresAt, temporary } = invite;
        const info = guild
            ? (0, common_tags_1.stripIndent) `
            **Channel:** ${channel?.toString()} ${channel?.name}
            **Online members:** ${presenceCount}/${memberCount}
            `
            : `**Members:** ${memberCount}`;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
            name: (!channel?.isDMBased() ? guild?.name : channel?.name) ?? '',
            iconURL: (!channel?.isDMBased()
                ? guild?.iconURL({ forceStatic: false })
                : channel && 'iconURL' in channel && channel?.iconURL()) || '',
            url,
        })
            .setDescription((0, common_tags_1.stripIndent) `
                **Inviter:** ${inviter ? `${inviter.toString()} ${inviter.tag}` : 'Inviter is unavailable.'}
                ${info}
                **Max uses:** ${maxUses || 'No limit'}
                **Expires:** ${expiresAt ? (0, utils_1.timestamp)(expiresAt, 'R', true) : 'Never'}
                **Temp. membership:** ${temporary ? 'Yes' : 'No'}
            `)
            .setFooter({
            text: guild
                ? `Server ID: ${guild.id}`
                : `Group DM ID: ${channel?.id}`,
        });
        await (0, utils_1.replyAll)(context, embed);
    }
}
exports.default = InviteInfoCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52aXRlLWluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy9pbnZpdGUtaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FBd0U7QUFDeEUscURBQTZGO0FBQzdGLHVDQUE4RDtBQUU5RCxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsa0RBQWtEO1FBQzFELElBQUksRUFBRSxRQUFRO0tBQ2pCLENBQVUsQ0FBQztBQU9aLE1BQXFCLGlCQUFrQixTQUFRLHlCQUF5QjtJQUNwRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLGFBQWE7WUFDbkIsT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQztZQUNsQyxLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSx1Q0FBdUM7WUFDcEQsbUJBQW1CLEVBQUUsNERBQTREO1lBQ2pGLE1BQU0sRUFBRSxzQkFBc0I7WUFDOUIsUUFBUSxFQUFFO2dCQUNOLHVCQUF1QjtnQkFDdkIsMkNBQTJDO2FBQzlDO1lBQ0QsSUFBSTtTQUNQLEVBQUU7WUFDQyxPQUFPLEVBQUUsQ0FBQztvQkFDTixJQUFJLEVBQUUseUNBQTRCLENBQUMsTUFBTTtvQkFDekMsSUFBSSxFQUFFLFlBQVk7b0JBQ2xCLFdBQVcsRUFBRSw4QkFBOEI7b0JBQzNDLFFBQVEsRUFBRSxJQUFJO2lCQUNqQixDQUFDO1NBQ0wsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQWM7UUFDdkUsSUFBSSxTQUFTLEVBQUU7WUFDWCxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUNoQixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO29CQUMvQixLQUFLLEVBQUUsS0FBSztvQkFDWixLQUFLLEVBQUUsT0FBTztvQkFDZCxXQUFXLEVBQUUseUJBQXlCO2lCQUN6QyxDQUFDLENBQUMsQ0FBQztnQkFDSixPQUFPO2FBQ1Y7WUFDRCxNQUFNLEdBQUcsYUFBYSxDQUFDO1NBQzFCO1FBRUQsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBRTNHLE1BQU0sSUFBSSxHQUFHLEtBQUs7WUFDZCxDQUFDLENBQUMsSUFBQSx5QkFBVyxFQUFBOzJCQUNFLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxPQUFPLEVBQUUsSUFBSTtrQ0FDN0IsYUFBYSxJQUFJLFdBQVc7YUFDakQ7WUFDRCxDQUFDLENBQUMsZ0JBQWdCLFdBQVcsRUFBRSxDQUFDO1FBRXBDLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsU0FBUyxDQUFDO2FBQ25CLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNqRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUU7Z0JBQzNCLENBQUMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO2dCQUN4QyxDQUFDLENBQUMsT0FBTyxJQUFJLFNBQVMsSUFBSSxPQUFPLElBQUksT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUMxRCxJQUFJLEVBQUU7WUFDUCxHQUFHO1NBQ04sQ0FBQzthQUNELGNBQWMsQ0FBQyxJQUFBLHlCQUFXLEVBQUE7K0JBQ1IsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLHlCQUF5QjtrQkFDekYsSUFBSTtnQ0FDVSxPQUFPLElBQUksVUFBVTsrQkFDdEIsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFBLGlCQUFTLEVBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTzt3Q0FDNUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7YUFDbkQsQ0FBQzthQUNELFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxLQUFLO2dCQUNQLENBQUMsQ0FBQyxjQUFjLEtBQUssQ0FBQyxFQUFFLEVBQUU7Z0JBQzFCLENBQUMsQ0FBQyxnQkFBZ0IsT0FBTyxFQUFFLEVBQUUsRUFBRTtTQUN0QyxDQUFDLENBQUM7UUFFUCxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbkMsQ0FBQztDQUNKO0FBeEVELG9DQXdFQyJ9