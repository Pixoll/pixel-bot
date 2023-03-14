"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
/** Handles all of the invite logs. */
function default_1(client) {
    client.on('inviteCreate', async (invite) => {
        const { guild, inviter, maxUses, expiresAt, temporary, channel } = invite;
        if (!(guild instanceof pixoll_commando_1.CommandoGuild))
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'invites');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/invites#create".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: 'Created invite',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription((0, common_tags_1.stripIndent) `
                **Link:** ${invite.toString()}
                **Channel:** ${channel?.toString()}
                **Inviter:** ${inviter ? `${inviter.toString()} ${inviter.tag}` : 'Inviter is unavailable.'}
                **Max. uses:** ${maxUses || 'No limit'}
                **Expires at:** ${(0, utils_1.timestamp)(expiresAt ?? 0, 'R') || 'Never'}
                **Temp. membership:** ${temporary ? 'Yes' : 'No'}
            `)
            .setFooter({ text: `Inviter ID: ${inviter?.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('inviteDelete', async (invite) => {
        const { guild, channel } = invite;
        if (!(guild instanceof pixoll_commando_1.CommandoGuild))
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'invites');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/invites#delete".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
            name: 'Deleted invite',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription((0, common_tags_1.stripIndent) `
                **Link:** ${invite.toString()}
                **Channel:** ${channel?.toString()}
            `)
            .setFooter({ text: `Channel ID: ${channel?.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('messageCreate', async (message) => {
        if (!message.inGuild() || (0, utils_1.parseMessageToCommando)(message)?.isCommand)
            return;
        const { guild, author, content, channel, url, partial } = message;
        if (author.bot || partial)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'invites');
        if (!isEnabled)
            return;
        const invites = await guild.invites.fetch().catch(() => null);
        const matches = [...content.matchAll(/discord\.\w+\/(?:invite\/)?([^ ]+)/g)].map(m => m[1]);
        for (const code of matches) {
            const invite = await client.fetchInvite(code).catch(() => null);
            if (!invite || invites?.get(invite.code))
                continue;
            const { channel: invChannel, maxUses, expiresAt, temporary, presenceCount, memberCount, guild: invGuild, inviter, } = invite;
            const info = invGuild ? (0, common_tags_1.stripIndent) `
                **Server:** ${invGuild.name}
                **Channel:** ${invChannel?.toString()} ${invChannel?.name}
                **Online members:** ${presenceCount}/${memberCount}
            ` : (0, common_tags_1.stripIndent) `
                **Group DM:** ${invChannel?.name}
                **Members:** ${memberCount}
            `;
            const embed = new discord_js_1.EmbedBuilder()
                .setColor('Blue')
                .setAuthor({
                name: `${author.tag} posted an invite`,
                iconURL: author.displayAvatarURL({ forceStatic: false }),
            })
                .setDescription((0, common_tags_1.stripIndent) `
                    ${author.toString()} posted an invite in ${channel.toString()} ${(0, utils_1.hyperlink)('Jump to message', url)}
                    **Invite:** ${invite.toString()}
                `)
                .addFields({
                name: 'Invite information',
                value: (0, common_tags_1.stripIndent) `
                    **Inviter:** ${inviter ? `${inviter.toString()} ${inviter.tag}` : 'Inviter is unavailable.'}
                    ${info}
                    **Max uses:** ${maxUses || 'No limit'}
                    **Expires at:** ${(0, utils_1.timestamp)(expiresAt ?? 0, 'R') || 'Never'}
                    **Temporary membership:** ${temporary ? 'Yes' : 'No'}
                    `,
            })
                .setFooter({
                text: invGuild
                    ? `Server ID: ${invGuild.id}`
                    : `Group DM ID: ${invChannel?.id}`,
            })
                .setTimestamp();
            guild.queuedLogs.push(embed);
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52aXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2R1bGVzL2xvZ3MvaW52aXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FBMEM7QUFDMUMscURBQWdFO0FBQ2hFLHVDQUFpRztBQUVqRyxzQ0FBc0M7QUFDdEMsbUJBQXlCLE1BQTRCO0lBQ2pELE1BQU0sQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBQyxNQUFNLEVBQUMsRUFBRTtRQUNyQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDMUUsSUFBSSxDQUFDLENBQUMsS0FBSyxZQUFZLCtCQUFhLENBQUM7WUFBRSxPQUFPO1FBRTlDLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSw0QkFBb0IsRUFBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUV2QixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDO1FBRTdELE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsTUFBTSxDQUFDO2FBQ2hCLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxnQkFBZ0I7WUFDdEIsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxTQUFTO1NBQzlELENBQUM7YUFDRCxjQUFjLENBQUMsSUFBQSx5QkFBVyxFQUFBOzRCQUNYLE1BQU0sQ0FBQyxRQUFRLEVBQUU7K0JBQ2QsT0FBTyxFQUFFLFFBQVEsRUFBRTsrQkFDbkIsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLHlCQUF5QjtpQ0FDMUUsT0FBTyxJQUFJLFVBQVU7a0NBQ3BCLElBQUEsaUJBQVMsRUFBQyxTQUFTLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLE9BQU87d0NBQ25DLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJO2FBQ25ELENBQUM7YUFDRCxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzthQUNqRCxZQUFZLEVBQUUsQ0FBQztRQUVwQixLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBQyxNQUFNLEVBQUMsRUFBRTtRQUNyQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUNsQyxJQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksK0JBQWEsQ0FBQztZQUFFLE9BQU87UUFFOUMsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLDRCQUFvQixFQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHNDQUFzQyxDQUFDLENBQUM7UUFFN0QsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxRQUFRLENBQUM7YUFDbEIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLGdCQUFnQjtZQUN0QixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLFNBQVM7U0FDOUQsQ0FBQzthQUNELGNBQWMsQ0FBQyxJQUFBLHlCQUFXLEVBQUE7NEJBQ1gsTUFBTSxDQUFDLFFBQVEsRUFBRTsrQkFDZCxPQUFPLEVBQUUsUUFBUSxFQUFFO2FBQ3JDLENBQUM7YUFDRCxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzthQUNqRCxZQUFZLEVBQUUsQ0FBQztRQUVwQixLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtRQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLElBQUEsOEJBQXNCLEVBQUMsT0FBTyxDQUFDLEVBQUUsU0FBUztZQUFFLE9BQU87UUFFN0UsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ2xFLElBQUksTUFBTSxDQUFDLEdBQUcsSUFBSSxPQUFPO1lBQUUsT0FBTztRQUVsQyxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsNEJBQW9CLEVBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFdkIsTUFBTSxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5RCxNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUYsS0FBSyxNQUFNLElBQUksSUFBSSxPQUFPLEVBQUU7WUFDeEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoRSxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFBRSxTQUFTO1lBRW5ELE1BQU0sRUFDRixPQUFPLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxPQUFPLEdBQzNHLEdBQUcsTUFBTSxDQUFDO1lBRVgsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFBLHlCQUFXLEVBQUE7OEJBQ2pCLFFBQVEsQ0FBQyxJQUFJOytCQUNaLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxVQUFVLEVBQUUsSUFBSTtzQ0FDbkMsYUFBYSxJQUFJLFdBQVc7YUFDckQsQ0FBQyxDQUFDLENBQUMsSUFBQSx5QkFBVyxFQUFBO2dDQUNLLFVBQVUsRUFBRSxJQUFJOytCQUNqQixXQUFXO2FBQzdCLENBQUM7WUFFRixNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7aUJBQzNCLFFBQVEsQ0FBQyxNQUFNLENBQUM7aUJBQ2hCLFNBQVMsQ0FBQztnQkFDUCxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxtQkFBbUI7Z0JBQ3RDLE9BQU8sRUFBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7YUFDM0QsQ0FBQztpQkFDRCxjQUFjLENBQUMsSUFBQSx5QkFBVyxFQUFBO3NCQUNyQixNQUFNLENBQUMsUUFBUSxFQUFFLHdCQUF3QixPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksSUFBQSxpQkFBUyxFQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQztrQ0FDcEYsTUFBTSxDQUFDLFFBQVEsRUFBRTtpQkFDbEMsQ0FBQztpQkFDRCxTQUFTLENBQUM7Z0JBQ1AsSUFBSSxFQUFFLG9CQUFvQjtnQkFDMUIsS0FBSyxFQUFFLElBQUEseUJBQVcsRUFBQTttQ0FDSCxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMseUJBQXlCO3NCQUN6RixJQUFJO29DQUNVLE9BQU8sSUFBSSxVQUFVO3NDQUNuQixJQUFBLGlCQUFTLEVBQUMsU0FBUyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxPQUFPO2dEQUMvQixTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSTtxQkFDbkQ7YUFDSixDQUFDO2lCQUNELFNBQVMsQ0FBQztnQkFDUCxJQUFJLEVBQUUsUUFBUTtvQkFDVixDQUFDLENBQUMsY0FBYyxRQUFRLENBQUMsRUFBRSxFQUFFO29CQUM3QixDQUFDLENBQUMsZ0JBQWdCLFVBQVUsRUFBRSxFQUFFLEVBQUU7YUFDekMsQ0FBQztpQkFDRCxZQUFZLEVBQUUsQ0FBQztZQUVwQixLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNoQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQWxIRCw0QkFrSEMifQ==