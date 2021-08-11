const { CommandoClient } = require('discord.js-commando')
const { disabled } = require('../mongo/schemas')

/**
 * Disables all saved modules in all servers.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    const { commands, groups } = client.registry
    const Disabled = await disabled.find({})

    for (const data of Disabled) {
        const guild = await client.guilds.fetch(data.guild, false, true).catch(() => null)

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
            const match = groups.find(gr => gr.id === group)
            if (!match) continue

            match.setEnabledIn(guild, false)
        }
    }

    console.log('Disabled commands & groups')
}