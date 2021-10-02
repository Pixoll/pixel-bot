const Command = require('../../command-handler/commands/base')
const { myMs, formatBytes } = require('../../utils')
const { MessageEmbed } = require('discord.js')
const { stripIndent } = require('common-tags')
const { CommandoMessage } = require('../../command-handler/typings')

/** A command that can be run in a client */
module.exports = class StatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            group: 'info',
            description: 'Displays some statistics of the bot.',
            guarded: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const { user, users, guilds, uptime: _uptime } = this.client

        const uptime = myMs(_uptime, { long: true, length: 2, showMs: false })

        // The memory usage in MB
        const { heapUsed, rss } = process.memoryUsage()
        const usedMemory = formatBytes(heapUsed, 2, false)
        const maxMemory = formatBytes(rss, 2, false)

        const stats = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${user.username}'s stats`, user.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Servers:** ${guilds.cache.size}
                **>** **Users:** ${users.cache.filter(u => !u.bot).size}
                **>** **Uptime:** ${uptime}
                **>** **Memory usage:** ${usedMemory}/${maxMemory} MB
            `)
            .setTimestamp()

        await message.replyEmbed(stats)
    }
}