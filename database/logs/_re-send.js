/* eslint-disable no-unused-vars */
const { CommandoClient } = require('../../command-handler/typings')
const { getLogsChannel } = require('../../utils')
/* eslint-enable no-unused-vars */

/**
 * Re-sends audit-logs when deleted.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('messageDelete', async message => {
        if (message.partial) return
        const { guild, author, embeds, channelId } = message
        if (!guild || client.user.id !== author.id) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel || logsChannel.id !== channelId) return

        await logsChannel.send({ embeds }).catch(() => null)
    })

    client.on('messageDeleteBulk', async messages => {
        const notPartial = messages.filter(m => !m.partial)
        if (notPartial.size === 0) return

        const { guild, author, channelId } = notPartial.first()
        if (!guild || client.user.id !== author.id) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel || logsChannel.id !== channelId) return

        const embeds = notPartial.reduce((acc, msg) => acc.concat(msg.embeds), [])
        while (embeds.length !== 0) {
            const toSend = embeds.splice(0, 10)
            await logsChannel.send({ embeds: toSend }).catch(() => null)
        }
    })
}