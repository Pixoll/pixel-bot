const { CommandoClient } = require('discord.js-commando')
const { prefixes } = require('../mongo/schemas')

/**
 * Applies all saved prefixes in all servers.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.once('ready', async () => {
        const Prefixes = await prefixes.find({})

        for (const data of Prefixes) {
            if (data.global) client.commandPrefix = data.prefix

            else {
                const guild = await client.guilds.fetch(data.guild, false, true)

                if (!guild) {
                    await data.deleteOne()
                    continue
                }

                guild.commandPrefix = data.prefix
            }
        }

        console.log('Applied all prefixes')
    })
}