const { stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { moduleStatus, getLogsChannel } = require('../functions')
const { setup, modules } = require('../mongodb-schemas')

/**
 * Handles all of the emoji logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('emojiCreate', async emoji => {
        const { guild, name, id, url } = emoji

        const status = await moduleStatus(modules, guild, 'auditLogs', 'emojis')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const author = await emoji.fetchAuthor()

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor('Created emoji', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Name:** ${name}
                **>** **Author:** ${author.toString()} ${author.tag}
            `)
            .setThumbnail(url)
            .setFooter(`Emoji ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('emojiDelete', async emoji => {
        const { guild, name, id, author, url } = emoji

        const status = await moduleStatus(modules, guild, 'auditLogs', 'emojis')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted emoji', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Name:** ${name}
                **>** **Author:** ${author.toString()} ${author.tag}
            `)
            .setThumbnail(url)
            .setFooter(`Emoji ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
        const { guild, id, url } = oldEmoji

        const status = await moduleStatus(modules, guild, 'auditLogs', 'emojis')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated emoji', guild.iconURL({ dynamic: true }))
            .setDescription('Name', `${oldEmoji.name} ➜ ${newEmoji.name}`)
            .setThumbnail(url)
            .setFooter(`Emoji ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })
}