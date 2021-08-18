const { stripIndent } = require('common-tags')
const { MessageEmbed, Message } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { sliceDots, moduleStatus, pluralize, fetchPartial, getLogsChannel } = require('../functions')
const { setup, modules } = require('../mongo/schemas')

/**
 * Fixes the size of the attachment, putting it on it's most compact version
 * @param {number} size The size of the attachment to fix
 */
function fixSize(size) {
    var i = 0
    while (size > 1024) {
        size /= 1024
        i++
    }

    const _size = size % 1 ? size.toFixed(2) : size

    if (i === 0) return _size + 'B'
    if (i === 1) return _size + 'KB'
    if (i === 2) return _size + 'MB'
}

/**
 * Handles all of the message logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('messageDelete', async _message => {
        /** @type {Message} */
        const message = await fetchPartial(_message)
        if (!message.author) return

        const { guild, author, content, attachments, member, type, url, channel, id } = message
        if (!guild || author?.bot) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'messages')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const _content = sliceDots(content, 1024)

        const deleted = type === 'PINS_ADD' ?
            `**${member.displayName}** pinned [**a message**](${url}) to this channel.` :
            _content

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted message', author?.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Author:** ${author.toString()} ${author.tag}
                **>** **Channel:** ${channel.toString()} ${channel.name}
            `)
            .setFooter(stripIndent`
                Author ID: ${author.id}
                Message ID: ${id}
            `)
            .setTimestamp()

        if (deleted) embed.addField('Message', deleted)

        if (attachments.size > 0) {
            const atts = []
            for (const [, { name, proxyURL, size, height, url }] of attachments) {
                const _size = fixSize(size)
                const link = `[${name}](${proxyURL})`
                const download = !height ? `- Download [here](${url})` : ''

                atts.push(`**>** ${link} - ${_size} ${download}`)
            }

            embed.addField('Attachments', atts.join('\n'))
        }

        logsChannel.send(embed)
    })

    client.on('messageDeleteBulk', async messages => {
        /** @type {Message} */
        const message = await fetchPartial(messages.first())

        const { guild, channel } = message
        if (!guild) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'messages')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted multiple messages', guild.iconURL({ dynamic: true }))
            .setDescription(`Deleted **${pluralize('message', messages.size)}** in ${channel.toString()} ${channel.name}`)
            .setFooter(`Channel ID: ${channel.id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('messageUpdate', async (oldMessage, _newMessage) => {
        /** @type {Message} */
        const newMessage = await fetchPartial(_newMessage)

        const { content: content1 } = oldMessage
        const { guild, channel, author, content: content2, url, id } = newMessage

        if (!guild || author.bot || content1 === content2) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'messages')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const oldContent = content1 !== null ? sliceDots(content1, 1024) || '`Empty`' : '`Couldn\'t fetch message content.`'
        const newContent = sliceDots(content2, 1024)

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Edited message', author.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Link:** [Click here](${url})
                **>** **Author:** ${author.toString()} ${author.tag}
                **>** **Channel:** ${channel.toString()} ${channel.name}
            `)
            .addFields(
                { name: 'Before', value: oldContent },
                { name: 'After', value: newContent }
            )
            .setFooter(`Message ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })
}