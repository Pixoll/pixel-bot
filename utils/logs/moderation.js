const { stripIndent } = require('common-tags')
const { MessageEmbed, User, GuildAuditLogs, GuildMember } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { moduleStatus, fetchPartial, getLogsChannel } = require('../functions')
const { setup, modules } = require('../mongo/schemas')

/**
 * Handles all of the moderation logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberRemove', async _member => {
        /** @type {GuildMember} */
        const { guild, user, id } = await fetchPartial(_member)

        if (!guild.available || id === client.user.id) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'members')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        /** @type {GuildAuditLogs} */
        const kickLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null)
        const kickLog = kickLogs.entries.first()
        if (!kickLog || kickLog.action !== 'MEMBER_KICK') return

        const { executor, reason, target } = kickLog
        if (target.id !== user.id) return

        const kick = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Kicked user', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                **>** **User:** ${user.toString()} ${user.tag}
                **>** **Moderator:** ${executor.toString()} ${executor.tag}
                **>** **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setFooter(`User ID: ${id}`)
            .setTimestamp()

        logsChannel.send(kick).catch(() => null)
    })

    client.on('guildBanAdd', async (guild, _user) => {
        if (!guild.available) return

        /** @type {User} */
        const user = await fetchPartial(_user)

        const status = await moduleStatus(modules, guild, 'auditLogs', 'moderation')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        /** @type {GuildAuditLogs} */
        const banLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null)
        const banLog = banLogs.entries.first()

        const { executor, reason } = banLog || {}
        const moderator = executor ? `${executor.toString()} ${executor.tag}` : 'Couldn\'t fetch moderator.'

        const embed = new MessageEmbed()
            .setColor('GOLD')
            .setAuthor('Banned user', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                **>** **User:** ${user.toString()} ${user.tag}
                **>** **Moderator:** ${moderator}
                **>** **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setImage('https://media.giphy.com/media/fe4dDMD2cAU5RfEaCU/giphy.gif')
            .setFooter(`User ID: ${user.id}`)
            .setTimestamp()

        logsChannel.send(embed).catch(() => null)
    })

    client.on('guildBanRemove', async (guild, _user) => {
        /** @type {User} */
        const user = await fetchPartial(_user)

        const status = await moduleStatus(modules, guild, 'auditLogs', 'moderation')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        /** @type {GuildAuditLogs} */
        const unbanLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null)
        const unbanLog = unbanLogs.entries.first()

        const { executor, reason } = unbanLog || {}
        const moderator = executor ? `${executor.toString()} ${executor.tag}` : 'Couldn\'t fetch moderator.'

        const embed = new MessageEmbed()
            .setColor('GOLD')
            .setAuthor('Unbanned user', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                **>** **User:** ${user.toString()} ${user.tag}
                **>** **Moderator:** ${moderator}
                **>** **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setFooter(`User ID: ${user.id}`)
            .setTimestamp()

        logsChannel.send(embed).catch(() => null)
    })
}
