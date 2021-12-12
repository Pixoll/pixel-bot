/* eslint-disable no-unused-vars */
const { TextChannel } = require('discord.js')
const { CommandoClient, CommandoGuild } = require('../../command-handler/typings')
/* eslint-enable no-unused-vars */

/**
 * Gets the audit-logs channel
 * @param {CommandoGuild} guild The guild to look into
 * @returns {Promise<?TextChannel>}
 */
async function getLogsChannel(guild) {
    const data = await guild.database.setup.fetch()
    const channel = guild.channels.resolve(data?.logsChannel)
    return channel
}

/**
 * Re-sends audit-logs when deleted.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('messageDelete', async message => {
        if (message.partial) return
        const { guild, author, embeds, channelId } = message
        if (!guild || client.user.id !== author.id || embeds.length === 0) return

        client.emit('debug', 'Running event "logs/_re-send#messageDelete".')

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel || logsChannel.id !== channelId) return

        await logsChannel.send({ embeds }).catch(() => null)
    })

    client.on('messageDeleteBulk', async messages => {
        const notPartial = messages.filter(m => !m.partial)
        if (notPartial.size === 0) return

        const { guild, author, channelId } = notPartial.first()
        if (!guild || client.user.id !== author.id) return

        client.emit('debug', 'Running event "logs/_re-send#messageDeleteBulk".')

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel || logsChannel.id !== channelId) return

        const embeds = notPartial.reduce((acc, msg) => acc.concat(msg.embeds), [])
        while (embeds.length !== 0) {
            const toSend = embeds.splice(0, 10)
            await logsChannel.send({ embeds: toSend }).catch(() => null)
        }
    })

    client.on('messageUpdate', async (oldMessage, newMessage) => {
        if (oldMessage.partial || newMessage.partial) return
        const { guild, author, embeds, channelId, channel } = oldMessage
        if (
            !guild || client.user.id !== author.id || embeds.length === 0 || embeds.length === newMessage.embeds.length
        ) return

        client.emit('debug', 'Running event "logs/_re-send#messageUpdate".')

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel || logsChannel.id !== channelId) return

        await newMessage?.delete().catch(() => null)
        await channel.send({ embeds }).catch(() => null)
    })
}
