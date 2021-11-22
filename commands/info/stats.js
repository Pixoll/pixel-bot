/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { myMs, formatBytes } = require('../../utils')
const { MessageEmbed } = require('discord.js')
const { CommandInstances } = require('../../command-handler/typings')
/* eslint-enable no-unused-vars */

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
        const { user, uptime: _uptime } = this.client
        const guilds = this.client.guilds.cache
        const users = guilds.reduce((a, g) => a + g.memberCount, 0).toLocaleString()

        const uptime = myMs(_uptime, { long: true, length: 2, showMs: false }).toString()

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
            .addField('Uptime', uptime, true)
            .setTimestamp()

        await interaction?.editReply({ embeds: [stats] })
        await message?.replyEmbed(stats)
    }
}