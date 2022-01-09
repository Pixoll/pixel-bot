/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { MessageEmbed, User } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/**
 * Handles all of the sticker logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('stickerCreate', async sticker => {
        const { guild, url, id, description, name, tags } = sticker

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'stickers')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/stickers#create".')

        /** @type {User} */
        const user = await sticker.fetchUser().catch(() => null)

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor({
                name: 'Created sticker', iconURL: guild.iconURL({ dynamic: true })
            })
            .setDescription(user ?
                `**${user.toString()} added a sticker:** ${name}` :
                `**Added a sticker:** ${name}`
            )
            .addField('Information', stripIndent`
                **Related emoji:** ${tags.map(s => `:${s}:`).join(' ')}
                **Description:** ${description || 'No description.'}
            `)
            .setThumbnail(url)
            .setFooter({ text: `Sticker ID: ${id}` })
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('stickerDelete', async sticker => {
        const { guild, url, id, description, name, tags } = sticker

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'stickers')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/stickers#delete".')

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor({
                name: 'Deleted sticker', iconURL: guild.iconURL({ dynamic: true })
            })
            .setDescription(stripIndent`
                **Name:** ${name}
                **Related emoji:** ${tags.map(s => `:${s}:`).join(' ')}
                **Description:** ${description || 'No description.'}
            `)
            .setThumbnail(url)
            .setFooter({ text: `Sticker ID: ${id}` })
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('stickerUpdate', async (oldSticker, newSticker) => {
        const { guild, url, id } = newSticker

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'stickers')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/sticker#update".')

        const { name: name1, description: description1, tags: tags1 } = oldSticker
        const { name: name2, description: description2, tags: tags2 } = newSticker

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({
                name: 'Updated sticker', iconURL: guild.iconURL({ dynamic: true })
            })
            .setThumbnail(url)
            .setFooter({ text: `Sticker ID: ${id}` })
            .setTimestamp()

        if (name1 !== name2) embed.addField('Name', `${name1} ➜ ${name2}`)

        if (description1 !== description2) {
            embed.addField('Description', stripIndent`
                **Before**
                ${description1 || 'No description.'}
                **After**
                ${description2 || 'No description.'}
            `)
        }

        if (tags1 !== tags2) {
            embed.addField(
                'Related emoji',
                `${tags1.map(s => `:${s}:`).join(' ')} ➜ ${tags2.map(s => `:${s}:`).join(' ')}`
            )
        }

        if (embed.fields.length !== 0) guild.queuedLogs.push(embed)
    })
}
