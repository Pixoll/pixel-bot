"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
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
            details: '`invite` may be a link, an invite codes, or a vanity code.',
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
                await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'That invite is invalid.',
                }));
                return;
            }
            invite = fetchedInvite;
        }
        const { guild, channel, url, inviter, presenceCount, memberCount, maxUses, expiresAt, temporary } = invite;
        const info = guild ? (0, common_tags_1.stripIndent) `
            **Channel:** ${channel?.toString()} ${channel?.name}
            **Online members:** ${presenceCount}/${memberCount}
        ` : (0, common_tags_1.stripIndent) `
            **Members:** ${memberCount}
        `;
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
                **Expires:** ${expiresAt ? (0, functions_1.timestamp)(expiresAt) : 'Never'}
                **Temp. membership:** ${temporary ? 'Yes' : 'No'}
            `)
            .setFooter({
            text: guild
                ? `Server ID: ${guild.id}`
                : `Group DM ID: ${channel?.id}`,
        });
        await (0, functions_1.replyAll)(context, embed);
    }
}
exports.default = InviteInfoCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52aXRlLWluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy9pbnZpdGUtaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FBd0U7QUFDeEUscURBQTZGO0FBQzdGLHFEQUF3RTtBQUV4RSxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsa0RBQWtEO1FBQzFELElBQUksRUFBRSxRQUFRO0tBQ2pCLENBQVUsQ0FBQztBQU9aLE1BQXFCLGlCQUFrQixTQUFRLHlCQUF5QjtJQUNwRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLGFBQWE7WUFDbkIsT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQztZQUNsQyxLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSx1Q0FBdUM7WUFDcEQsT0FBTyxFQUFFLDREQUE0RDtZQUNyRSxNQUFNLEVBQUUsc0JBQXNCO1lBQzlCLFFBQVEsRUFBRTtnQkFDTix1QkFBdUI7Z0JBQ3ZCLDJDQUEyQzthQUM5QztZQUNELElBQUk7U0FDUCxFQUFFO1lBQ0MsT0FBTyxFQUFFLENBQUM7b0JBQ04sSUFBSSxFQUFFLHlDQUE0QixDQUFDLE1BQU07b0JBQ3pDLElBQUksRUFBRSxZQUFZO29CQUNsQixXQUFXLEVBQUUsOEJBQThCO29CQUMzQyxRQUFRLEVBQUUsSUFBSTtpQkFDakIsQ0FBQztTQUNMLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFjO1FBQ3ZFLElBQUksU0FBUyxFQUFFO1lBQ1gsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakYsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDaEIsTUFBTSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsc0JBQVUsRUFBQztvQkFDL0IsS0FBSyxFQUFFLEtBQUs7b0JBQ1osS0FBSyxFQUFFLE9BQU87b0JBQ2QsV0FBVyxFQUFFLHlCQUF5QjtpQkFDekMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osT0FBTzthQUNWO1lBQ0QsTUFBTSxHQUFHLGFBQWEsQ0FBQztTQUMxQjtRQUVELE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUUzRyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUEseUJBQVcsRUFBQTsyQkFDYixPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksT0FBTyxFQUFFLElBQUk7a0NBQzdCLGFBQWEsSUFBSSxXQUFXO1NBQ3JELENBQUMsQ0FBQyxDQUFDLElBQUEseUJBQVcsRUFBQTsyQkFDSSxXQUFXO1NBQzdCLENBQUM7UUFFRixNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDM0IsUUFBUSxDQUFDLFNBQVMsQ0FBQzthQUNuQixTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDakUsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFO2dCQUMzQixDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztnQkFDeEMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxTQUFTLElBQUksT0FBTyxJQUFJLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FDMUQsSUFBSSxFQUFFO1lBQ1AsR0FBRztTQUNOLENBQUM7YUFDRCxjQUFjLENBQUMsSUFBQSx5QkFBVyxFQUFBOytCQUNSLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyx5QkFBeUI7a0JBQ3pGLElBQUk7Z0NBQ1UsT0FBTyxJQUFJLFVBQVU7K0JBQ3RCLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBQSxxQkFBUyxFQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO3dDQUNqQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSTthQUNuRCxDQUFDO2FBQ0QsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLEtBQUs7Z0JBQ1AsQ0FBQyxDQUFDLGNBQWMsS0FBSyxDQUFDLEVBQUUsRUFBRTtnQkFDMUIsQ0FBQyxDQUFDLGdCQUFnQixPQUFPLEVBQUUsRUFBRSxFQUFFO1NBQ3RDLENBQUMsQ0FBQztRQUVQLE1BQU0sSUFBQSxvQkFBUSxFQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0NBQ0o7QUF4RUQsb0NBd0VDIn0=