const { stripIndent } = require('common-tags')
const { MessageEmbed, Invite, Collection } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, validURL, getLogsChannel, timestamp } = require('../../utils')

/**
 * Handles all of the invite logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('inviteCreate', async invite => {
        const { guild, inviter, maxUses, expiresAt, temporary, channel } = invite

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'invites')
        if (!isEnabled) return

        // const logsChannel = await getLogsChannel(guild)
        // if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Created invite', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Link:** ${invite.toString()}
                **>** **Channel:** ${channel.toString()}
                **>** **Inviter:** ${inviter.toString()} ${inviter.tag}
                **>** **Max. uses:** ${maxUses || 'No limit'}
                **>** **Expires at:** ${timestamp(expiresAt, 'R') || 'Never'}
                **>** **Temp. membership:** ${temporary ? 'Yes' : 'No'}
            `)
            .setFooter(`Inviter id: ${inviter.id}`)
            .setTimestamp()

        // await logsChannel.send({ embeds: [embed] }).catch(() => null)
        guild.queuedLogs.push(embed)
    })

    client.on('inviteDelete', async invite => {
        const { guild, channel } = invite

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'invites')
        if (!isEnabled) return

        // const logsChannel = await getLogsChannel(guild)
        // if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted invite', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Link:** ${invite.toString()}
                **>** **Channel:** ${channel.toString()}
            `)
            .setFooter(`Channel id: ${channel.id}`)
            .setTimestamp()

        // await logsChannel.send({ embeds: [embed] }).catch(() => null)
        guild.queuedLogs.push(embed)
    })

    client.on('cMessageCreate', async message => {
        const { guild, author, isCommand, content, channel, url } = message
        if (!guild || author.bot || isCommand) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'invites')
        if (!isEnabled) return

        // const logsChannel = await getLogsChannel(guild)
        // if (!logsChannel) return

        /** @type {Collection<string,Invite>} */
        const invites = await guild.invites.fetch().catch(() => null)

        // const embeds = []
        for (const link of content.split(/ +/)) {
            const isLink = validURL(link)
            if (!isLink) continue

            /** @type {Invite} */
            const invite = await client.fetchInvite(link).catch(() => null)
            if (!invite) continue
            if (invites?.get(invite.code)) continue

            const { channel: invChannel, maxUses, expiresAt, temporary, presenceCount, memberCount, guild: invGuild } = invite

            const embed = new MessageEmbed()
                .setColor('BLUE')
                .setAuthor(`${author.tag} posted an invite`, author.displayAvatarURL({ dynamic: true }))
                .setDescription(stripIndent`
                    ${author.toString()} posted an invite in ${channel.toString()} [Jump to message](${url})
                    **Invite:** ${invite.toString()}
                `)
                .addField('Invite information', stripIndent`
                    **>** **Server:** ${invGuild.name}
                    **>** **Channel:** ${invChannel.toString()} ${invChannel.name}
                    **>** **Online members:** ${presenceCount}/${memberCount}
                    **>** **Max uses:** ${maxUses || 'No limit'}
                    **>** **Expires at:** ${timestamp(expiresAt, 'R') || 'Never'}
                    **>** **Temporary membership:** ${temporary ? 'Yes' : 'No'}
                `)
                .setFooter(`Server id: ${invGuild.id}`)
                .setTimestamp()

            // embeds.push(embed)
            guild.queuedLogs.push(embed)
        }

        // while (embeds.length !== 0) {
        //     const toSend = embeds.splice(0, 10).filter(e => e)
        //     await logsChannel.send({ embeds: toSend }).catch(() => null)
        // }
    })
}