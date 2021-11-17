/* eslint-disable no-unused-vars */
const { MessageEmbed, User } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled } = require('../../utils')
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

        /** @type {User} */
        const author = await emoji.fetchAuthor().catch(() => null)

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor('Created emoji', guild.iconURL({ dynamic: true }))
            .setDescription(`**${author.toString()} added an emoji:** ${name}`)
            .setThumbnail(url)
            .setFooter(`Emoji id: ${id}`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('emojiDelete', async emoji => {
        const { guild, name, id, url } = emoji

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'emojis')
        if (!isEnabled) return

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted emoji', guild.iconURL({ dynamic: true }))
            .setDescription(`**Name:** ${name}`)
            .setThumbnail(url)
            .setFooter(`Emoji id: ${id}`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
        const { guild, id, url } = oldEmoji

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'emojis')
        if (!isEnabled) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated emoji', guild.iconURL({ dynamic: true }))
            .addField('Name', `${oldEmoji.name} ➜ ${newEmoji.name}`)
            .setThumbnail(url)
            .setFooter(`Emoji id: ${id}`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })
}