const { stripIndent } = require('common-tags')
const { MessageEmbed, GuildMember } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { ms } = require('../custom-ms')
const { ban, moduleStatus, fetchPartial, getLogsChannel } = require('../functions')
const { setup, modules } = require('../mongo/schemas')

/**
 * Handles all of the member logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberAdd', async _member => {
        /** @type {GuildMember} */
        const { guild, user } = await fetchPartial(_member)

        const status = await moduleStatus(modules, guild, 'auditLogs', 'members')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const { tag, createdTimestamp, id } = user
        const age = ms(Date.now() - createdTimestamp, { long: true, length: 2, showAnd: true })

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor('User joined', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(`${user.toString()} ${tag}`)
            .addField('Account age', age)
            .setFooter(`User ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)

        if (Date.now() - createdTimestamp < ms('3d')) {
            const autoMod = await moduleStatus(modules, guild, 'auditLogs', 'autoMod')
            if (!autoMod) return

            return await ban(guild, client, user, 'Account is too young, possible raid threat.')
        }
    })

    client.on('guildMemberRemove', async _member => {
        /** @type {GuildMember} */
        const { guild, user, roles, id } = await fetchPartial(_member)

        if (!guild.available || id === client.user.id) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'members')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const { tag } = user

        const rolesList = roles.cache.filter(({ id }) => id !== guild.id).map(r => r).sort((a, b) => b.position - a.position).join(' ')

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('User left', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(`${user.toString()} ${tag}`)
            .addField('Roles', rolesList || 'None')
            .setFooter(`User ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)

        const kickLogs = await guild.fetchAuditLogs({ limit: 1 })
        const kickLog = kickLogs.entries.first()

        if (kickLog && kickLog.action === 'MEMBER_KICK') {
            const { executor, reason } = kickLog

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

            logsChannel.send(kick)
        }
    })

    client.on('guildMemberUpdate', async (_oldMember, _newMember) => {
        /** @type {GuildMember} */
        const oldMember = await fetchPartial(_oldMember)
        /** @type {GuildMember} */
        const newMember = await fetchPartial(_newMember)

        const { guild, user, id } = oldMember
        if (!guild.available) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'members')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const { roles: roles1, nickname: nick1 } = oldMember
        const { roles: roles2, nickname: nick2 } = newMember

        const role = roles1.cache.difference(roles2.cache).first()

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated member', user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${user.toString()} ${user.tag}`)
            .setFooter(`User ID: ${id}`)
            .setTimestamp()

        if (nick1 !== nick2) embed.addField('Nickname', `${nick1 || 'None'} ➜ ${nick2 || 'None'}`)

        if (role) {
            const action = roles2.cache.has(role.id) ? 'Added' : 'Removed'
            embed.addField(`${action} role`, `${role.toString()} ${role.name}`)
        }

        if (embed.fields.length !== 0) logsChannel.send(embed)
    })
}