const { stripIndent } = require('common-tags')
const { MessageEmbed, GuildAuditLogs, GuildMember } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, fetchPartial, getLogsChannel, timestamp } = require('../../utils')

/**
 * Handles all of the moderation logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberRemove', async _member => {
        /** @type {GuildMember} */
        const { guild, user, id } = await fetchPartial(_member)
        if (!guild.available || id === client.user.id) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'moderation')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

        /** @type {GuildAuditLogs} */
        const kickLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null)
        const kickLog = kickLogs.entries.first()
        if (!kickLog || kickLog.action !== 'MEMBER_KICK') return

        const { executor, reason, target } = kickLog
        if (target.id !== id) return

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Kicked user', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                Moderator ${executor.toString()} kicked ${user.toString()} ${user.tag}
                **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setFooter(`User id: ${id} | Mod id: ${executor.id}`)
            .setTimestamp()

        await logsChannel.send({ embeds: [embed] }).catch(() => null)
    })

    client.on('guildBanAdd', async banLog => {
        if (!banLog.guild.available) return
        await banLog.fetch().catch(() => null)
        if (!banLog) return

        const { user, guild, reason } = banLog

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'moderation')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

        /** @type {GuildAuditLogs} */
        const banLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null)
        const banLog2 = banLogs.entries.first()

        let moderator
        if (banLog2?.action === 'MEMBER_BAN_ADD' && banLog2?.target.id === user.id) {
            const { executor } = banLog2 || {}
            moderator = executor ? `Moderator ${executor.toString()} ` : null
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

        await logsChannel.send({ embeds: [embed] }).catch(() => null)
    })

    client.on('guildBanRemove', async unbanLog => {
        if (!unbanLog.guild.available) return
        await unbanLog.fetch().catch(() => null)
        if (!unbanLog) return

        const { user, guild } = unbanLog

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'moderation')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

        /** @type {GuildAuditLogs} */
        const unbanLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null)
        const unbanLog2 = unbanLogs.entries.first()

        let reason, moderator
        if (unbanLog2?.action === 'MEMBER_BAN_REMOVE' && unbanLog2?.target.id === user.id) {
            const { executor } = unbanLog2 || {}
            reason = unbanLog2.reason
            moderator = executor ? `Moderator ${executor.toString()} ` : null
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

        await logsChannel.send({ embeds: [embed] }).catch(() => null)
    })

    client.on('guildMemberMute', async (guild, mod, user, reason, duration) => {
        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'moderation')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('GOLD')
            .setAuthor('Muted member', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                Moderator ${mod.toString()} muted ${user.toString()} ${user.tag}
                **Expires:** ${timestamp(duration, 'R')}
                **Reason:** ${reason}
            `)
            .setFooter(`User id: ${user.id} | Mod id: ${mod.id}`)
            .setTimestamp()

        await logsChannel.send({ embeds: [embed] }).catch(() => null)
    })

    client.on('guildMemberUnmute', async (guild, mod, user, reason, expired) => {
        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'moderation')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

        const description = expired ?
            `${user.toString()}'s mute has expired.` :
            stripIndent`
                Moderator ${mod.toString()} unmuted ${user.toString()} ${user.tag}
                **Reason:** ${reason}
            `
        const footer = mod ?
            `User id: ${user.id} | Mod id: ${mod.id}` :
            `User id: ${user.id}`

        const embed = new MessageEmbed()
            .setColor('GOLD')
            .setAuthor('Unmuted member', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(description)
            .setFooter(footer)
            .setTimestamp()

        await logsChannel.send({ embeds: [embed] }).catch(() => null)
    })

    client.on('guildMemberWarn', async (guild, mod, user, reason) => {
        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'moderation')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('GOLD')
            .setAuthor('Warned member', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                Moderator ${mod.toString()} warned ${user.toString()} ${user.tag}
                **Reason:** ${reason}
            `)
            .setFooter(`User id: ${user.id} | Mod id: ${mod.id}`)
            .setTimestamp()

        await logsChannel.send({ embeds: [embed] }).catch(() => null)
    })
}