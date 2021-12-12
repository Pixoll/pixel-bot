/* eslint-disable no-unused-vars */
const { CommandoClient } = require('../../command-handler/typings')
/* eslint-enable no-unused-vars */

/**
 * Applies all saved prefixes in all servers.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    const { database } = client
    const guilds = client.guilds.cache.toJSON()

    const global = await database.prefixes.fetch()
    if (global) client.prefix = global.prefix

    for (const guild of guilds) {
        const data = await guild.database.prefixes.fetch()
        if (data) guild.prefix = data.prefix
    }
}
