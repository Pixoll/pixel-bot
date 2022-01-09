/* eslint-disable no-unused-vars */
const { MessageEmbed, User } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/**
 * Handles all of the emoji logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('emojiCreate', async emoji => {
        const { guild, name, id, url } = emoji

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'emojis')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/emojis#create".')

        /** @type {User} */
        const author = await emoji.fetchAuthor().catch(() => null)

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor({
                name: 'Created emoji', iconURL: guild.iconURL({ dynamic: true })
            })
            .setDescription(author ?
                `**${author.toString()} added an emoji:** ${name}` :
                `**Added emoji:** ${name}`
            )
            .setThumbnail(url)
            .setFooter({ text: `Emoji ID: ${id}` })
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('emojiDelete', async emoji => {
        const { guild, name, id, url } = emoji

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'emojis')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/emojis#delete".')

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor({
                name: 'Deleted emoji', iconURL: guild.iconURL({ dynamic: true })
            })
            .setDescription(`**Name:** ${name}`)
            .setThumbnail(url)
            .setFooter({ text: `Emoji ID: ${id}` })
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
        const { guild, id, url } = oldEmoji

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'emojis')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/emojis#update".')

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({
                name: 'Updated emoji', iconURL: guild.iconURL({ dynamic: true })
            })
            .addField('Name', `${oldEmoji.name} ➜ ${newEmoji.name}`)
            .setThumbnail(url)
            .setFooter({ text: `Emoji ID: ${id}` })
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })
}
