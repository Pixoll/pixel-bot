const { CommandoClient } = require('../../command-handler/typings')
const { getLogsChannel } = require('../../utils')

/**
 * Re-sends audit-logs when deleted.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('messageDelete', async message => {
        if (message.partial) return
        const { guild, author, embeds, channelId } = message
        if (client.user.id !== author.id) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel || logsChannel.id !== channelId) return

        await logsChannel.send({ embeds }).catch(() => null)
    })
}