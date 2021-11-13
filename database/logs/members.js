const { stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, getLogsChannel, timestamp } = require('../../utils')

/**
 * Returns a clickable link to the image. `None` if the link is invald
 * @param {string} link The link of the image
 */
function imageLink(link) {
    if (link) return `[Click here](${link})`
    return 'None'
}

const imgOptions = { dynamic: true, size: 2048 }

/**
 * Handles all of the member logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberAdd', async member => {
        const { guild, user } = member

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'members')
        if (!isEnabled) return

        // const logsChannel = await getLogsChannel(guild)
        // if (!logsChannel) return

        const { tag, id, createdAt } = user

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor('User joined', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(`${user.toString()} ${tag}`)
            .addField('Registered', timestamp(createdAt, 'R'))
            .setFooter(`User id: ${id}`)
            .setTimestamp()

        // await logsChannel.send({ embeds: [embed] }).catch(() => null)
        guild.queuedLogs.push(embed)

        // if (Date.now() - createdTimestamp < myMs('3d')) {
        //     const autoMod = await isModuleEnabled(guild, 'audit-logs', 'autoMod')
        //     if (!autoMod) return

        //     return await ban(guild, client, user, 'Account is too young, possible raid threat.')
        // }
    })

    client.on('guildMemberRemove', async member => {
        member = await member.fetch().catch(() => null)
        if (!member) return

        const { guild, user, roles, id } = member
        if (!guild.available || id === client.user.id) return

        const status = await isModuleEnabled(guild, 'audit-logs', 'members')
        if (!status) return

        // const logsChannel = await getLogsChannel(guild)
        // if (!logsChannel) return

        const { tag } = user

        const rolesList = roles.cache.filter(r => r.id !== guild.id)
            .sort((a, b) => b.position - a.position).toJSON().join(' ')

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('User left', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(`${user.toString()} ${tag}`)
            .addField('Roles', rolesList || 'None')
            .setFooter(`User id: ${id}`)
            .setTimestamp()

        // await logsChannel.send({ embeds: [embed] }).catch(() => null)
        guild.queuedLogs.push(embed)
    })

    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        const { guild } = newMember
        if (!guild.available) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'members')
        if (!isEnabled) return

        // const logsChannel = await getLogsChannel(guild)
        // if (!logsChannel) return

        const { roles: roles1, nickname: nick1, avatar: avatar1 } = oldMember
        const { roles: roles2, nickname: nick2, avatar: avatar2, user, id } = newMember

        const role = roles1.cache.difference(roles2.cache).first()

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated member', newMember.displayAvatarURL({ dynamic: true }))
            .setDescription(`${user.toString()} ${user.tag}`)
            .setFooter(`User id: ${id}`)
            .setTimestamp()

        if (nick1 !== nick2) embed.addField('Nickname', `${nick1 || 'None'} ➜ ${nick2 || 'None'}`)

        if (avatar1 !== avatar2) embed.addField('Server avatar', stripIndent`
            **>** **Before:** ${imageLink(oldMember.displayAvatarURL(imgOptions))}
            **>** **After:** ${imageLink(newMember.displayAvatarURL(imgOptions))}
        `).setThumbnail(newMember.displayAvatarURL(imgOptions))

        if (role) {
            const action = roles2.cache.has(role.id) ? 'Added' : 'Removed'
            embed.addField(`${action} role`, `${role.toString()}`)
        }

        if (embed.fields.length !== 0) {
            // await logsChannel.send({ embeds: [embed] }).catch(() => null)
            guild.queuedLogs.push(embed)
        }
    })
}