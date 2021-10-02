const { stripIndent } = require('common-tags')
const { MessageEmbed, Permissions } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { customEmoji, isModuleEnabled, getKeyPerms, getLogsChannel } = require('../../utils')
const { permissions } = require('../../command-handler/util')

/**
 * Formats the {@link Permissions} into an array of string
 * @param {Readonly<Permissions>} perms The permissions to format
 */
function format(perms) {
    return perms?.toArray(false).map(perm => permissions[perm.toString()]) || []
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
        const { guild, id, hexColor, mentionable, hoist, tags } = role

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'roles')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

        const colorLink = `https://www.color-hex.com/color/${hexColor.replace('#', '')}`

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor('Created role', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Role:** ${role.toString()}
                **>** **Color:** [${hexColor}](${colorLink})
                **>** **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **>** **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **>** **Mod perms:** ${getKeyPerms(role)}
            `)
            .setFooter(`Role id: ${id}`)
            .setTimestamp()

        if (tags) {
            const bot = tags.botId ? `Bot role for <@${tags.botId}>` : null
            const integration = tags.integrationId ? `Integration role for <@${tags.integrationId}>` : null
            const boost = tags.premiumSubscriberRole ? `Default Server Booster role.` : null
            const tagsArr = [bot, integration, boost].filter(t => t)
            embed.addField('Tags', tagsArr.join('\n'))
        }

        await logsChannel.send({ embeds: [embed] }).catch(() => null)
    })

    client.on('roleDelete', async role => {
        const { guild, id, name, hexColor, mentionable, hoist, tags } = role
        if (!guild.available) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'roles')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(guild)
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
                **>** **Mod perms:** ${getKeyPerms(role)}
            `)
            .setFooter(`Role id: ${id}`)
            .setTimestamp()

        if (tags) {
            const bot = tags.botId ? `Bot role for <@${tags.botId}>` : null
            const integration = tags.integrationId ? `Integration role for <@${tags.integrationId}>` : null
            const boost = tags.premiumSubscriberRole ? `Default Server Booster role.` : null
            const tagsArr = [bot, integration, boost].filter(t => t)
            embed.addField('Tags', tagsArr.join('\n'))
        }

        await logsChannel.send({ embeds: [embed] }).catch(() => null)
    })

    client.on('roleUpdate', async (oldRole, newRole) => {
        const { guild, id } = oldRole

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'roles')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

        const { name: name1, hexColor: color1, hoist: hoist1, mentionable: mention1, permissions: perms1 } = oldRole
        const { name: name2, hexColor: color2, hoist: hoist2, mentionable: mention2, permissions: perms2 } = newRole

        const [added, removed] = comparePerms(format(perms1), format(perms2))

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

        if (hoist1 !== hoist2) embed.addField('Hoisted', hoist1 ? 'Yes ➜ No' : 'No ➜ Yes')

        if (mention1 !== mention2) embed.addField('Mentionable', mention1 ? 'Yes ➜ No' : 'No ➜ Yes')

        if (added.length !== 0) embed.addField(`${customEmoji('check')} Allowed permissions`, added.join(', '))

        if (removed.length !== 0) embed.addField(`${customEmoji('cross')} Denied permissions`, removed.join(', '))

        if (embed.fields.length !== 0) {
            await logsChannel.send({ embeds: [embed] }).catch(() => null)
        }
    })

    client.emit('debug', 'Loaded audit-logs/roles')
}