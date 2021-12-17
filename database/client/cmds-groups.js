/* eslint-disable no-unused-vars */
const { CommandoClient } = require('../../command-handler/typings')
/* eslint-enable no-unused-vars */

/**
 * Disables all saved modules in all servers.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    const { database, registry } = client
    const guilds = client.guilds.cache.toJSON()

    const global = await database.disabled.fetch()
    if (global) {
        for (const str of global.commands) {
            const cmd = registry.resolveCommand(str)
            if (cmd) cmd._globalEnabled = false
        }
        for (const str of global.groups) {
            const grp = registry.resolveGroup(str)
            if (grp) grp._globalEnabled = false
        }
    }

    for (const guild of guilds) {
        const data = await guild.database.disabled.fetch()
        if (data) {
            for (const str of data.commands) {
                const cmd = registry.resolveCommand(str)
                if (cmd) cmd.setEnabledIn(guild, false)
            }
            for (const str of data.groups) {
                const grp = registry.resolveGroup(str)
                if (grp) grp.setEnabledIn(guild, false)
            }
        }
    }
}
