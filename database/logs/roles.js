/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { MessageEmbed, Permissions } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { customEmoji, isModuleEnabled, getKeyPerms, compareArrays, sliceFileName } = require('../../utils')
const { permissions } = require('../../command-handler')
/* eslint-enable no-unused-vars */

/**
 * Formats the {@link Permissions} into an array of string
 * @param {Readonly<Permissions>} perms The permissions to format
 */
function format(perms) {
    return perms?.toArray(false).map(perm => permissions[perm.toString()]) || []
}

/**
 * Returns a clickable link to the image. `None` if the link is invald
 * @param {string} link The link of the image
 */
function imageLink(link) {
    if (link) return `[Click here](${link})`
    return 'None'
}

/**
 * Handles all of the role logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('roleCreate', async role => {
        client.emit('debug', `Running event "${sliceFileName(__filename)}#roleCreate".`)

        const { guild, id, hexColor, mentionable, hoist, tags, unicodeEmoji } = role

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'roles')
        if (!isEnabled) return

        const color = hexColor === '#000000' ? null : hexColor
        const colorURL = color ? `https://www.color-hex.com/color/${color.replace('#', '')}` : null
        const url = role.iconURL({ size: 2048 }) || colorURL

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor('Created role', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **Role:** ${role.toString()}
                **Color:** ${color ? `[${color}](${colorURL})` : 'None'}
                **Emoji:** ${unicodeEmoji || 'None'}
                **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **Mod perms:** ${getKeyPerms(role)}
            `)
            .setFooter(`Role id: ${id}`)
            .setTimestamp()

        if (url) embed.setThumbnail(url)

        if (tags) {
            const bot = tags.botId ? `Bot role for <@${tags.botId}>` : null
            const integration = tags.integrationId ? `Integration role for <@${tags.integrationId}>` : null
            const boost = tags.premiumSubscriberRole ? 'Default Server Booster role.' : null
            const tagsArr = [bot, integration, boost].filter(t => t)
            embed.addField('Tags', tagsArr.join('\n'))
        }

        guild.queuedLogs.push(embed)
    })

    client.on('roleDelete', async role => {
        client.emit('debug', `Running event "${sliceFileName(__filename)}#roleDelete".`)

        const { guild, id, name, hexColor, mentionable, hoist, tags, unicodeEmoji } = role
        if (!guild.available) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'roles')
        if (!isEnabled) return

        const color = hexColor === '#000000' ? null : hexColor
        const colorURL = color ? `https://www.color-hex.com/color/${color.replace('#', '')}` : null
        const url = role.iconURL({ size: 2048 }) || colorURL

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted role', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **Name:** ${name}
                **Color:** ${color ? `[${color}](${colorURL})` : 'No color'}
                **Emoji:** ${unicodeEmoji || 'None'}
                **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **Mod perms:** ${getKeyPerms(role)}
            `)
            .setFooter(`Role id: ${id}`)
            .setTimestamp()

        if (url) embed.setThumbnail(url)

        if (tags) {
            const bot = tags.botId ? `Bot role for <@${tags.botId}>` : null
            const integration = tags.integrationId ? `Integration role for <@${tags.integrationId}>` : null
            const boost = tags.premiumSubscriberRole ? 'Default Server Booster role.' : null
            const tagsArr = [bot, integration, boost].filter(t => t)
            embed.addField('Tags', tagsArr.join('\n'))
        }

        guild.queuedLogs.push(embed)
    })

    client.on('roleUpdate', async (oldRole, newRole) => {
        client.emit('debug', `Running event "${sliceFileName(__filename)}#roleUpdate".`)

        const { guild, id } = oldRole

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'roles')
        if (!isEnabled) return

        const {
            name: name1, hexColor: color1, hoist: hoist1, mentionable: mention1,
            permissions: perms1, unicodeEmoji: emoji1, icon: icon1
        } = oldRole
        const {
            name: name2, hexColor: color2, hoist: hoist2, mentionable: mention2,
            permissions: perms2, unicodeEmoji: emoji2, icon: icon2
        } = newRole

        const [added, removed] = compareArrays(format(perms1), format(perms2))

        const color1link = `https://www.color-hex.com/color/${color1.replace('#', '')}`
        const color2link = `https://www.color-hex.com/color/${color2.replace('#', '')}`

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated role', guild.iconURL({ dynamic: true }))
            .setDescription(oldRole.toString())
            .setFooter(`Role id: ${id}`)
            .setTimestamp()

        if (name1 !== name2) embed.addField('Name', `${name1} ➜ ${name2}`)

        if (color1 !== color2) embed.addField('Color', `[${color1}](${color1link}) ➜ [${color2}](${color2link})`)

        if (emoji1 !== emoji2) embed.addField('Emoji', `${emoji1 || 'None'} ➜ ${emoji2 || 'None'}`)

        if (icon1 !== icon2) {
            embed.addField('Icon', stripIndent`
                **Before:** ${imageLink(oldRole.iconURL({ size: 2048 }))}
                **After:** ${imageLink(newRole.iconURL({ size: 2048 }))}
            `).setThumbnail(newRole.iconURL({ size: 2048 }))
        }

        if (hoist1 !== hoist2) embed.addField('Hoisted', hoist1 ? 'Yes ➜ No' : 'No ➜ Yes')

        if (mention1 !== mention2) embed.addField('Mentionable', mention1 ? 'Yes ➜ No' : 'No ➜ Yes')

        if (added.length !== 0) embed.addField(`${customEmoji('check')} Allowed permissions`, added.join(', '))

        if (removed.length !== 0) embed.addField(`${customEmoji('cross')} Denied permissions`, removed.join(', '))

        if (embed.fields.length !== 0) guild.queuedLogs.push(embed)
    })
}