const { CommandoClient } = require('../../command-handler/typings')
const { disabled } = require('../../mongo/schemas')
const { DisabledSchema } = require('../../mongo/typings')

/**
 * Disables all saved modules in all servers.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    const { commands, groups } = client.registry
    /** @type {DisabledSchema[]} */
    const Disabled = await disabled.find({})
    const { guilds } = client

    for (const data of Disabled) {
        const guild = guilds.cache.get(data.guild)
        if (!guild) {
            await data.deleteOne()
            continue
        }

        for (const command of data.commands) {
            const match = commands.find(cmd => cmd.name === command)
            if (!match) continue

            match.setEnabledIn(guild, false)
        }

        for (const group of data.groups) {
            const match = groups.find(grp => grp.id === group)
            if (!match) continue

            match.setEnabledIn(guild, false)
        }
    }

    client.emit('debug', 'Disabled commands & groups')
}