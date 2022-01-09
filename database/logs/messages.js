/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { sliceDots, isModuleEnabled, pluralize } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/**
 * Formats the bytes to its most divisable point
 * @param {number|string} bytes The bytes to format
 * @param {number} [decimals] The amount od decimals to display
 * @param {boolean} [showUnit] Whether to display the units or not
 */
function formatBytes(bytes, decimals = 2, showUnit = true) {
    if (bytes === 0) {
        if (showUnit) return '0 B'
        return '0'
    }

    const k = 1000
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const float = parseFloat(
        (bytes / Math.pow(k, i)).toFixed(dm)
    ).toString()

    if (showUnit) return `${float} ${sizes[i]}`
    return float
}

/**
 * Handles all of the message logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('messageDelete', async message => {
        const { guild, author, content, attachments, channel, partial, stickers } = message
        if (partial || channel.type === 'DM' || author.bot) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'messages')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/messages#delete".')

        const deleted = sliceDots(content, 1024)

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor({
                name: 'Deleted message', iconURL: author.displayAvatarURL({ dynamic: true })
            })
            .setDescription(`Sent by ${author.toString()} in ${channel.toString()}`)
            .setFooter({ text: `Author ID: ${author.id}` })
            .setTimestamp()

        if (deleted) embed.addField('Message', deleted)

        if (attachments.size !== 0) {
            const atts = []
            for (const [, { name, proxyURL, size, height, url }] of attachments) {
                const bytes = formatBytes(size)
                const download = !height ? `- Download [here](${url})` : ''

                atts.push(`**>** [${name}](${proxyURL}) - ${bytes} ${download}`)
            }

            embed.addField('Files', atts.join('\n'))
        }

        if (stickers.size !== 0) {
            const sticks = []
            for (const [, { name, url }] of stickers) {
                sticks.push(`**>** [${name}](${url})`)
            }

            embed.addField('Stickers', sticks.join('\n'))
        }

        guild.queuedLogs.push(embed)
    })

    client.on('messageDeleteBulk', async messages => {
        const message = messages.first()

        const { guild, channel } = message
        if (channel.type === 'DM') return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'messages')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/messages#deleteBulk".')

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor({
                name: 'Deleted multiple messages', iconURL: guild.iconURL({ dynamic: true })
            })
            .setDescription(`Deleted **${pluralize('message', messages.size)}** in ${channel.toString()}`)
            .setFooter({ text: `Channel ID: ${channel.id}` })
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('messageUpdate', async (oldMessage, newMessage) => {
        const { content: content1 } = oldMessage
        if (newMessage.partial) {
            newMessage = await newMessage.fetch().catch(() => null)
            if (!newMessage) return
        }

        const { guild, channel, author, content: content2, url } = newMessage

        if (channel.type === 'DM' || author?.bot || content1 === content2) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'messages')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/messages#update".')

        const oldContent = content1 !== null ?
            sliceDots(content1, 1024) || '`Empty`' :
            '`Couldn\'t get old message content.`'
        const newContent = sliceDots(content2, 1024)

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({
                name: 'Edited message', iconURL: author.displayAvatarURL({ dynamic: true })
            })
            .setDescription(`Sent by ${author.toString()} in ${channel.toString()} [Jump to message](${url})`)
            .addField('Before', oldContent)
            .addField('After', newContent)
            .setFooter({ text: `Author ID: ${author.id}` })
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })
}
