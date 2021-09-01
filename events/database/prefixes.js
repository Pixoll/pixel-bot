const { CommandoClient, CommandoGuild } = require('discord.js-commando')
const { prefixes } = require('../../utils/mongo/schemas')

/**
 * Applies all saved prefixes in all servers.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    const Prefixes = await prefixes.find({})
    const { guilds } = client

    for (const data of Prefixes) {
        if (data.global) client.commandPrefix = data.prefix

        else {
            /** @type {CommandoGuild} */
            const guild = await guilds.fetch(data.guild, false).catch(() => null)

            if (!guild) {
                await data.deleteOne()
                continue
            }

            guild.commandPrefix = data.prefix
        }
    }

    console.log('Applied all prefixes')
}