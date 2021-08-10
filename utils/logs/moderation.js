const { stripIndent } = require('common-tags')
const { MessageEmbed, User } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { moduleStatus, fetchPartial } = require('../functions')
const { setup, modules } = require('../mongodb-schemas')

/**
 * Handles all of the moderation logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildBanAdd', async (guild, _user) => {
        if (!guild.available) return

        /** @type {User} */
        const user = await fetchPartial(_user)

        const status = await moduleStatus(modules, guild, 'auditLogs', 'members')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const banLogs = await guild.fetchAuditLogs({ limit: 1 })
        const banLog = banLogs.entries.first()
        if (!banLog || banLog.action !== 'MEMBER_BAN_ADD') return

        const { executor, reason } = banLog

        const embed = new MessageEmbed()
            .setColor('RED')
            .setAuthor('Banned user', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                **>** **User:** ${user.toString()} ${user.tag}
                **>** **Moderator:** ${executor.toString()} ${executor.tag}
                **>** **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setImage('https://media.giphy.com/media/fe4dDMD2cAU5RfEaCU/giphy.gif')
            .setFooter(`User ID: ${user.id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('guildBanRemove', async (guild, _user) => {
        /** @type {User} */
        const user = await fetchPartial(_user)

        const status = await moduleStatus(modules, guild, 'auditLogs', 'members')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const unbanLogs = await guild.fetchAuditLogs({ limit: 1 })
        const unbanLog = unbanLogs.entries.first()
        if (!unbanLog || unbanLog.action !== 'MEMBER_BAN_REMOVE') return

        const { executor, reason } = banLog

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Unbanned user', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                **>** **User:** ${user.toString()} ${user.tag}
                **>** **Moderator:** ${executor.toString()} ${executor.tag}
                **>** **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setFooter(`User ID: ${user.id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })
}