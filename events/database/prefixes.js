const { CommandoClient, CommandoGuild } = require('../../command-handler/typings')
const { prefixes } = require('../../mongo/schemas')
const { PrefixSchema } = require('../../mongo/typings')

/**
 * Applies all saved prefixes in all servers.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    /** @type {PrefixSchema[]} */
    const Prefixes = await prefixes.find({})
    const guilds = client.guilds.cache

    for (const data of Prefixes) {
        if (data.global) client.prefix = data.prefix
        else {
            /** @type {CommandoGuild} */
            const guild = guilds.get(data.guild)
            if (!guild) {
                await data.deleteOne()
                continue
            }
            guild.prefix = data.prefix
        }
    }

    client.emit('debug', 'Applied all prefixes')
}