/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { MessageEmbed, GuildAuditLogs } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, timestamp } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/**
 * Handles all of the moderation logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberRemove', async member => {
        member = member.fetch().catch(() => null)
        if (!member) return

        const { guild, user, id } = member
        if (!guild.available || id === client.user.id) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'moderation')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/moderation#guildMemberRemove".')

        /** @type {GuildAuditLogs} */
        const kickLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null)
        const kickLog = kickLogs?.entries.first()
        if (!kickLog || kickLog.action !== 'MEMBER_KICK') return

        const { executor, reason, target } = kickLog
        if (target.id !== id) return

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Kicked user', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                ${executor.toString()} kicked ${user.toString()} ${user.tag}
                **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setFooter(`User id: ${id} • Mod id: ${executor.id}`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('guildBanAdd', async banLog => {
        if (!banLog.guild.available) return
        banLog = await banLog.fetch().catch(() => null)
        if (!banLog) return

        const { user, guild, reason } = banLog

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'moderation')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/moderation#guildBanAdd".')

        /** @type {GuildAuditLogs} */
        const banLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null)
        const banLog2 = banLogs?.entries.first()

        let moderator
        if (banLog2?.action === 'MEMBER_BAN_ADD' && banLog2?.target.id === user.id) {
            const { executor } = banLog2 || {}
            moderator = executor ? `${executor.toString()} ` : null
        }

        const embed = new MessageEmbed()
            .setColor('GOLD')
            .setAuthor('Banned user', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                ${moderator ? moderator + 'banned' : 'Banned'} ${user.toString()} ${user.tag}
                **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setImage('https://media.giphy.com/media/fe4dDMD2cAU5RfEaCU/giphy.gif')
            .setFooter(`User id: ${user.id}`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('guildBanRemove', async unbanLog => {
        if (!unbanLog.guild.available) return
        unbanLog = await unbanLog.fetch().catch(() => null)
        if (!unbanLog) return

        const { user, guild } = unbanLog

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'moderation')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/moderation#guildBanRemove".')

        /** @type {GuildAuditLogs} */
        const unbanLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null)
        const unbanLog2 = unbanLogs?.entries.first()

        let reason, moderator
        if (unbanLog2?.action === 'MEMBER_BAN_REMOVE' && unbanLog2?.target.id === user.id) {
            const { executor } = unbanLog2 || {}
            reason = unbanLog2.reason
            moderator = executor ? `${executor.toString()} ` : null
        }

        const embed = new MessageEmbed()
            .setColor('GOLD')
            .setAuthor('Unbanned user', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                ${moderator ? moderator + 'unbanned' : 'Unbanned'} ${user.toString()} ${user.tag}
                **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setFooter(`User id: ${user.id}`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('guildMemberMute', async (guild, mod, user, reason, duration) => {
        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'moderation')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/moderation#guildMemberMute".')

        const embed = new MessageEmbed()
            .setColor('GOLD')
            .setAuthor('Muted member', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                ${mod.toString()} muted ${user.toString()} ${user.tag}
                **Expires:** ${timestamp(duration, 'R')}
                **Reason:** ${reason}
            `)
            .setFooter(`User id: ${user.id} • Mod id: ${mod.id}`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('guildMemberUnmute', async (guild, mod, user, reason) => {
        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'moderation')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/moderation#guildMemberUnmute".')

        const modFooter = mod ? ` • Mod id: ${mod.id}` : ''

        const embed = new MessageEmbed()
            .setColor('GOLD')
            .setAuthor('Unmuted member', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                ${mod.toString()} unmuted ${user.toString()} ${user.tag}
                **Reason:** ${reason}
            `)
            .setFooter(`User id: ${user.id}` + modFooter)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('guildMemberWarn', async (guild, mod, user, reason) => {
        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'moderation')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/moderation#guildMemberWarn".')

        const embed = new MessageEmbed()
            .setColor('GOLD')
            .setAuthor('Warned member', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                ${mod.toString()} warned ${user.toString()} ${user.tag}
                **Reason:** ${reason}
            `)
            .setFooter(`User id: ${user.id} • Mod id: ${mod.id}`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })
}