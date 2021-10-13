const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { sliceDots, isModuleEnabled, pluralize, getLogsChannel, formatBytes } = require('../../utils')

/**
 * Handles all of the message logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('messageDelete', async message => {
        const { guild, author, content, attachments, channel, id, partial, stickers } = message
        if (partial || channel.type === 'DM' || author.bot) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'messages')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

        const deleted = sliceDots(content, 1024)

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted message', author.displayAvatarURL({ dynamic: true }))
            .setDescription(`Sent by ${author.toString()} in ${channel.toString()}`)
            .setFooter(`Author id: ${author.id} | Message id: ${id}`)
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

        await logsChannel.send({ embeds: [embed] }).catch(() => null)
    })

    client.on('messageDeleteBulk', async messages => {
        const message = messages.first()

        const { guild, channel } = message
        if (channel.type === 'DM') return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'messages')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted multiple messages', guild.iconURL({ dynamic: true }))
            .setDescription(`Deleted **${pluralize('message', messages.size)}** in ${channel.toString()}`)
            .setFooter(`Channel id: ${channel.id}`)
            .setTimestamp()

        await logsChannel.send({ embeds: [embed] }).catch(() => null)
    })

    client.on('messageUpdate', async (oldMessage, newMessage) => {
        const { content: content1 } = oldMessage
        await newMessage.fetch()
        const { guild, channel, author, content: content2, url, id } = newMessage

        if (channel.type === 'DM' || author?.bot || content1 === content2) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'messages')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

        const oldContent = content1 !== null ?
            sliceDots(content1, 1024) || '`Empty`' :
            '`Couldn\'t get old message content.`'
        const newContent = sliceDots(content2, 1024)

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Edited message', author.displayAvatarURL({ dynamic: true }))
            .setDescription(`Sent by ${author.toString()} in ${channel.toString()} [Jump to message](${url})`)
            .addField('Before', oldContent)
            .addField('After', newContent)
            .setFooter(`Author id: ${author.id} | Message id: ${id}`)
            .setTimestamp()

        await logsChannel.send({ embeds: [embed] }).catch(() => null)
    })

    client.emit('debug', 'Loaded audit-logs/messages')
}