import { stripIndent } from 'common-tags';
import { EmbedBuilder } from 'discord.js';
import { CommandoClient, CommandoGuild } from 'pixoll-commando';
import { isGuildModuleEnabled, parseMessageToCommando, timestamp, hyperlink } from '../../utils';

/** Handles all of the invite logs. */
export default function (client: CommandoClient<true>): void {
    client.on('inviteCreate', async invite => {
        const { guild, inviter, maxUses, expiresAt, temporary, channel } = invite;
        if (!(guild instanceof CommandoGuild)) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'invites');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/invites#create".');

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: 'Created invite',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(stripIndent`
                **Link:** ${invite.toString()}
                **Channel:** ${channel?.toString()}
                **Inviter:** ${inviter ? `${inviter.toString()} ${inviter.tag}` : 'Inviter is unavailable.'}
                **Max. uses:** ${maxUses || 'No limit'}
                **Expires at:** ${timestamp(expiresAt ?? 0, 'R') || 'Never'}
                **Temp. membership:** ${temporary ? 'Yes' : 'No'}
            `)
            .setFooter({ text: `Inviter ID: ${inviter?.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('inviteDelete', async invite => {
        const { guild, channel } = invite;
        if (!(guild instanceof CommandoGuild)) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'invites');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/invites#delete".');

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
                name: 'Deleted invite',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(stripIndent`
                **Link:** ${invite.toString()}
                **Channel:** ${channel?.toString()}
            `)
            .setFooter({ text: `Channel ID: ${channel?.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('messageCreate', async message => {
        if (!message.inGuild() || parseMessageToCommando(message)?.isCommand) return;

        const { guild, author, content, channel, url, partial } = message;
        if (author.bot || partial) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'invites');
        if (!isEnabled) return;

        const invites = await guild.invites.fetch().catch(() => null);
        const matches = [...content.matchAll(/discord\.\w+\/(?:invite\/)?([^ ]+)/g)].map(m => m[1]);

        for (const code of matches) {
            const invite = await client.fetchInvite(code).catch(() => null);
            if (!invite || invites?.get(invite.code)) continue;

            const {
                channel: invChannel, maxUses, expiresAt, temporary, presenceCount, memberCount, guild: invGuild, inviter,
            } = invite;

            const info = invGuild ? stripIndent`
                **Server:** ${invGuild.name}
                **Channel:** ${invChannel?.toString()} ${invChannel?.name}
                **Online members:** ${presenceCount}/${memberCount}
            ` : stripIndent`
                **Group DM:** ${invChannel?.name}
                **Members:** ${memberCount}
            `;

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setAuthor({
                    name: `${author.tag} posted an invite`, iconURL: author.displayAvatarURL({ forceStatic: false }),
                })
                .setDescription(stripIndent`
                    ${author.toString()} posted an invite in ${channel.toString()} ${hyperlink('Jump to message', url)}
                    **Invite:** ${invite.toString()}
                `)
                .addFields({
                    name: 'Invite information',
                    value: stripIndent`
                    **Inviter:** ${inviter ? `${inviter.toString()} ${inviter.tag}` : 'Inviter is unavailable.'}
                    ${info}
                    **Max uses:** ${maxUses || 'No limit'}
                    **Expires at:** ${timestamp(expiresAt ?? 0, 'R') || 'Never'}
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
