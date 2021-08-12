const { stripIndent } = require('common-tags')
const { MessageEmbed, Invite } = require('discord.js')
const { CommandoClient, CommandoMessage } = require('discord.js-commando')
const { formatDate, moduleStatus, validURL, fetchPartial, getLogsChannel } = require('../functions')
const { setup, modules } = require('../mongo/schemas')

/**
 * Handles all of the invite logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('inviteCreate', async invite => {
        const { guild, inviter, maxUses, expiresAt, temporary, channel } = invite

        const status = await moduleStatus(modules, guild, 'auditLogs', 'invites')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Created invite', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Link:** ${invite.toString()}
                **>** **Channel:** ${channel.toString()} ${channel.name}
                **>** **Inviter:** ${inviter.toString()} ${inviter.tag}
                **>** **Max uses:** ${maxUses || 'No limit'}
                **>** **Expires at:** ${formatDate(expiresAt) || 'Never'}
                **>** **Temporary membership:** ${temporary ? 'Yes' : 'No'}
            `)
            .setFooter(`Inviter ID: ${inviter.id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('inviteDelete', async invite => {
        const { guild, channel } = invite

        const status = await moduleStatus(modules, guild, 'auditLogs', 'invites')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted invite', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Link:** ${invite.toString()}
                **>** **Channel:** ${channel.toString()} ${channel.name}
            `)
            .setFooter(`Channel ID: ${channel.id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('message', async _message => {
        /** @type {CommandoMessage} */
        const message = await fetchPartial(_message)

        const { guild, author, isCommand, content, channel, url } = message
        if (!guild || author.bot || isCommand) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'invites')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const invites = await guild.fetchInvites().catch(() => null)

        for (const link of content.split(/ +/)) {
            const isLink = validURL(link)
            if (!isLink) continue

            /** @type {Invite} */
            const invite = await client.fetchInvite(link).catch(() => null)
            if (!invite) continue
            if (invites.get(invite.code)) continue

            const { channel: invChannel, maxUses, expiresAt, temporary, presenceCount, memberCount, guild: invGuild } = invite

            const embed = new MessageEmbed()
                .setColor('BLUE')
                .setAuthor('Posted invite', author.displayAvatarURL({ dynamic: true }))
                .setDescription(stripIndent`
                    **>** **User:** ${author.toString()} ${author.tag}
                    **>** **Channel:** ${channel.toString()} ${channel.name}
                    **>** **Message:** [Click here](${url})
                    **>** **Invite:** ${invite.toString()}
                `)
                .addField('Invite information', stripIndent`
                    **>** **Server:** ${invGuild.name}
                    **>** **Channel:** ${invChannel.toString()} ${invChannel.name}
                    **>** **Online members:** ${presenceCount}/${memberCount}
                    **>** **Max uses:** ${maxUses || 'No limit'}
                    **>** **Expires at:** ${formatDate(expiresAt) || 'Never'}
                    **>** **Temporary membership:** ${temporary ? 'Yes' : 'No'}
                `)
                .setFooter(`Server ID: ${invGuild.id}`)
                .setTimestamp()

            logsChannel.send(embed)
        }
    })
}