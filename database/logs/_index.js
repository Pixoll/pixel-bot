const { CommandoClient } = require('../../command-handler/typings')
const { getLogsChannel } = require('../../utils')

/**
 * Re-sends audit-logs when deleted.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    async function sendLogs() {
        const guilds = client.guilds.cache.toJSON()

        for (const guild of guilds) {
            const logsChannel = await getLogsChannel(guild)
            if (!logsChannel) {
                guild.queuedLogs.splice(0, guild.queuedLogs)
                continue
            }

            const queued = guild.queuedLogs
            while (queued.length > 0) {
                const embeds = queued.splice(0, 10).filter(e => e)
                await logsChannel.send({ embeds }).catch(() => null)
            }
        }

        setTimeout(sendLogs, 1000)
    }

    await sendLogs()
}