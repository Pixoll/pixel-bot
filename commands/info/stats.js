/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { replyAll } = require('../../utils/functions')
const { MessageEmbed } = require('discord.js')
const myMs = require('../../utils/my-ms')
const { CommandInstances } = require('../../command-handler/typings')
/* eslint-enable no-unused-vars */

/**
 * Formats the bytes to its most divisable point
 * @param {number|string} bytes The bytes to format
 * @param {number} [decimals] The amount od decimals to display
 * @param {boolean} [showUnit] Whether to display the units or not
 */
function formatBytes(bytes, decimals = 2, showUnit = true) {
    if (bytes === 0) {
        if (showUnit) return '0 B'
        return '0'
    }

    const k = 1000
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const float = parseFloat(
        (bytes / Math.pow(k, i)).toFixed(dm)
    ).toString()

    if (showUnit) return `${float} ${sizes[i]}`
    return float
}

/** A command that can be run in a client */
module.exports = class StatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            group: 'info',
            description: 'Displays some statistics of the bot.',
            guarded: true,
            slash: true
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const { user, uptime } = this.client
        const guilds = this.client.guilds.cache
        const users = guilds.reduce((a, g) => a + g.memberCount, 0).toLocaleString()

        const uptimeStr = myMs(uptime, { long: true, length: 2, showMs: false }).toString()

        // The memory usage in MB
        const { heapUsed, rss } = process.memoryUsage()
        const usedMemory = formatBytes(heapUsed, 2, false)
        const maxMemory = formatBytes(rss, 2, false)

        const stats = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${user.username}'s stats`, user.displayAvatarURL({ dynamic: true }))
            .addField('Servers', guilds.size.toLocaleString(), true)
            .addField('Users', users, true)
            .addField('Memory usage', `${usedMemory}/${maxMemory} MB`, true)
            .addField('Uptime', uptimeStr, true)
            .setTimestamp()

        await replyAll({ message, interaction }, stats)
    }
}
