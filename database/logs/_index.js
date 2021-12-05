/* eslint-disable no-unused-vars */
const { CommandoClient } = require('../../command-handler/typings')
const { getLogsChannel } = require('../../utils')
/* eslint-enable no-unused-vars */

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
                guild.queuedLogs = []
                continue
            }

            while (guild.queuedLogs.length > 0) {
                const embeds = guild.queuedLogs.splice(0, 10)
                await logsChannel.send({ embeds }).catch(() => null)
            }
        }

        setTimeout(async () => await sendLogs(), 3000)
    }

    await sendLogs()
}