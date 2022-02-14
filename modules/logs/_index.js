/* eslint-disable no-unused-vars */
const { TextChannel } = require('discord.js');
const { CommandoClient, CommandoGuild } = require('pixoll-commando');
/* eslint-enable no-unused-vars */

/**
 * Gets the audit-logs channel
 * @param {CommandoGuild} guild The guild to look into
 * @returns {Promise<?TextChannel>}
 */
async function getLogsChannel(guild) {
    const data = await guild.database.setup.fetch();
    const channel = guild.channels.resolve(data?.logsChannel);
    return channel;
}

/**
 * Re-sends audit-logs when deleted.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    async function sendLogs() {
        const guilds = client.guilds.cache.toJSON();

        for (const guild of guilds) {
            const logsChannel = await getLogsChannel(guild);
            if (!logsChannel) {
                guild.queuedLogs = [];
                continue;
            }

            while (guild.queuedLogs.length > 0) {
                const embeds = guild.queuedLogs.splice(0, 10);
                await logsChannel.send({ embeds }).catch(() => null);
            }
        }

        setTimeout(async () => await sendLogs(), 3000);
    }

    await sendLogs();
};
