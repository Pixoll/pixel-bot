/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags');
const { MessageEmbed, Invite, Collection } = require('discord.js');
const { CommandoClient } = require('pixoll-commando');
const { isModuleEnabled, timestamp } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/**
 * Handles all of the invite logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('inviteCreate', async invite => {
        const { guild, inviter, maxUses, expiresAt, temporary, channel } = invite;

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'invites');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/invites#create".');

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({
                name: 'Created invite', iconURL: guild.iconURL({ dynamic: true }),
            })
            .setDescription(stripIndent`
                **Link:** ${invite.toString()}
                **Channel:** ${channel.toString()}
                **Inviter:** ${inviter.toString()} ${inviter.tag}
                **Max. uses:** ${maxUses || 'No limit'}
                **Expires at:** ${timestamp(expiresAt, 'R') || 'Never'}
                **Temp. membership:** ${temporary ? 'Yes' : 'No'}
            `)
            .setFooter({ text: `Inviter ID: ${inviter.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('inviteDelete', async invite => {
        const { guild, channel } = invite;

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'invites');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/invites#delete".');

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor({
                name: 'Deleted invite', iconURL: guild.iconURL({ dynamic: true }),
            })
            .setDescription(stripIndent`
                **Link:** ${invite.toString()}
                **Channel:** ${channel.toString()}
            `)
            .setFooter({ text: `Channel ID: ${channel.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('commandoMessageCreate', async message => {
        const { guild, author, isCommand, content, channel, url } = message;
        if (!guild || author.bot || isCommand) return;

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'invites');
        if (!isEnabled) return;

        /** @type {Collection<string, Invite>} */
        const invites = await guild.invites.fetch().catch(() => null);
        const matches = [...content.matchAll(/discord\.\w+\/(?:invite\/)?([^ ]+)/g)].map(m => m[1]);

        for (const code of matches) {
            /** @type {Invite} */
            const invite = await client.fetchInvite(code).catch(() => null);
            if (!invite || invites?.get(invite.code)) continue;

            const {
                channel: invChannel, maxUses, expiresAt, temporary, presenceCount, memberCount, guild: invGuild, inviter,
            } = invite;

            const info = invGuild ? stripIndent`
                **Server:** ${invGuild.name}
                **Channel:** ${invChannel.toString()} ${invChannel.name}
                **Online members:** ${presenceCount}/${memberCount}
            ` : stripIndent`
                **Group DM:** ${invChannel.name}
                **Members:** ${memberCount}
            `;

            const embed = new MessageEmbed()
                .setColor('BLUE')
                .setAuthor({
                    name: `${author.tag} posted an invite`, iconURL: author.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(stripIndent`
                    ${author.toString()} posted an invite in ${channel.toString()} [Jump to message](${url})
                    **Invite:** ${invite.toString()}
                `)
                .addField('Invite information', stripIndent`
                    **Inviter:** ${inviter ? `${inviter.toString()} ${inviter.tag}` : 'Inviter is unavailable.'}
                    ${info}
                    **Max uses:** ${maxUses || 'No limit'}
                    **Expires at:** ${timestamp(expiresAt, 'R') || 'Never'}
                    **Temporary membership:** ${temporary ? 'Yes' : 'No'}
                `)
                .setFooter({
                    text: invGuild
                        ? `Server ID: ${invGuild.id}`
                        : `Group DM ID: ${invChannel.id}`,
                })
                .setTimestamp();

            guild.queuedLogs.push(embed);
        }
    });
};
