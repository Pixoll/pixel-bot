const { stripIndent } = require('common-tags')
const { MessageEmbed, PermissionOverwrites } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { formatPerm, customEmoji, moduleStatus, getKeyPerms, getLogsChannel } = require('../functions')
const { setup, modules } = require('../mongodb-schemas')

/**
 * Formats the PermissionOverwrites into an array of string
 * @param {PermissionOverwrites|Readonly<Permissions>} perms The permissions to format
 * @param {boolean} [isRole] If these are role permissions
 * @returns {string[]}
 */
function format(perms, isRole) {
    if (isRole) return perms?.toArray(false).map(perm => formatPerm(perm)) || []
    return [
        perms?.deny.toArray(false).map(perm => formatPerm(perm)) || [],
        perms?.allow.toArray(false).map(perm => formatPerm(perm)) || []
    ]
}

/**
 * Compares and returns the difference between the set of permissions
 * @param {string[]} Old The old permissions
 * @param {string[]} New The new permissions
 */
function comparePerms(Old = [], New = []) {
    const arr1 = New.filter(perm => !Old.includes(perm))
    const arr2 = Old.filter(perm => !New.includes(perm))
    return [arr1, arr2]
}

/**
 * Handles all of the role logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('roleCreate', async role => {
        const { guild, id, name, hexColor } = role

        const status = await moduleStatus(modules, guild, 'auditLogs', 'roles')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const colorLink = `https://www.color-hex.com/color/${hexColor.replace('#', '')}`

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor('Created role', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Role:** ${role.toString()} ${name}
                **>** **Color:** [${hexColor}](${colorLink})
                **>** **Key permissions:** ${getKeyPerms(role)}
            `)
            .setFooter(`Role ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('roleDelete', async role => {
        const { guild, id, name, hexColor, mentionable, hoist } = role
        if (!guild.available) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'roles')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const colorLink = `https://www.color-hex.com/color/${hexColor.replace('#', '')}`

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted role', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Name:** ${name}
                **>** **Color:** [${hexColor}](${colorLink})
                **>** **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **>** **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **>** **Key permissions:** ${getKeyPerms(role)}
            `)
            .setFooter(`Role ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('roleUpdate', async (oldRole, newRole) => {
        const { guild, id } = oldRole

        const status = await moduleStatus(modules, guild, 'auditLogs', 'roles')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const { name: name1, hexColor: color1, hoist: hoist1, mentionable: mention1, permissions: perms1 } = oldRole
        const { name: name2, hexColor: color2, hoist: hoist2, mentionable: mention2, permissions: perms2 } = newRole

        const oldPerms = format(perms1, true)
        const newPerms = format(perms2, true)
        const [added, removed] = comparePerms(oldPerms, newPerms)

        const color1link = `https://www.color-hex.com/color/${color1.replace('#', '')}`
        const color2link = `https://www.color-hex.com/color/${color2.replace('#', '')}`

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated role', guild.iconURL({ dynamic: true }))
            .setDescription(`${oldRole.toString()} ${oldRole.name}`)
            .setFooter(`Role ID: ${id}`)
            .setTimestamp()

        if (name1 !== name2) embed.addField('Name', `${name1} ➜ ${name2}`)

        if (color1 !== color2) embed.addField('Color', `[${color1}](${color1link}) ➜ [${color2}](${color2link})`)

        if (hoist1 !== hoist2) embed.addField('Hoisted', hoist1 ? 'Yes ➜ No' : 'No ➜ Yes')

        if (mention1 !== mention2) embed.addField('Mentionable', mention1 ? 'Yes ➜ No' : 'No ➜ Yes')

        if (added.length !== 0) embed.addField(`${customEmoji('check', false)} Allowed permissions`, added.join(', '))

        if (removed.length !== 0) embed.addField(`${customEmoji('cross', false)} Denied permissions`, removed.join(', '))

        if (embed.fields.length > 0) logsChannel.send(embed)
    })
}