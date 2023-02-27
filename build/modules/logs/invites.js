"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
/** Handles all of the invite logs. */
function default_1(client) {
    client.on('inviteCreate', async (invite) => {
        const { guild, inviter, maxUses, expiresAt, temporary, channel } = invite;
        if (!(guild instanceof pixoll_commando_1.CommandoGuild))
            return;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'invites');
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
                **Inviter:** ${inviter?.toString()} ${inviter?.tag}
                **Max. uses:** ${maxUses || 'No limit'}
                **Expires at:** ${(0, functions_1.timestamp)(expiresAt ?? 0, 'R') || 'Never'}
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
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'invites');
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
        if (!message.inGuild() || (0, functions_1.parseMessageToCommando)(message)?.isCommand)
            return;
        const { guild, author, content, channel, url, partial } = message;
        if (author.bot || partial)
            return;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'invites');
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
                name: `${author.tag} posted an invite`, iconURL: author.displayAvatarURL({ forceStatic: false }),
            })
                .setDescription((0, common_tags_1.stripIndent) `
                    ${author.toString()} posted an invite in ${channel.toString()} [Jump to message](${url})
                    **Invite:** ${invite.toString()}
                `)
                .addFields({
                name: 'Invite information',
                value: (0, common_tags_1.stripIndent) `
                    **Inviter:** ${inviter ? `${inviter.toString()} ${inviter.tag}` : 'Inviter is unavailable.'}
                    ${info}
                    **Max uses:** ${maxUses || 'No limit'}
                    **Expires at:** ${(0, functions_1.timestamp)(expiresAt ?? 0, 'R') || 'Never'}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52aXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2R1bGVzL2xvZ3MvaW52aXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FBMEM7QUFDMUMscURBQWdFO0FBQ2hFLHFEQUFnRztBQUVoRyxzQ0FBc0M7QUFDdEMsbUJBQXlCLE1BQTRCO0lBQ2pELE1BQU0sQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBQyxNQUFNLEVBQUMsRUFBRTtRQUNyQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDMUUsSUFBSSxDQUFDLENBQUMsS0FBSyxZQUFZLCtCQUFhLENBQUM7WUFBRSxPQUFPO1FBRTlDLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSxnQ0FBb0IsRUFBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUV2QixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDO1FBRTdELE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsTUFBTSxDQUFDO2FBQ2hCLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxnQkFBZ0I7WUFDdEIsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxTQUFTO1NBQzlELENBQUM7YUFDRCxjQUFjLENBQUMsSUFBQSx5QkFBVyxFQUFBOzRCQUNYLE1BQU0sQ0FBQyxRQUFRLEVBQUU7K0JBQ2QsT0FBTyxFQUFFLFFBQVEsRUFBRTsrQkFDbkIsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLE9BQU8sRUFBRSxHQUFHO2lDQUNqQyxP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