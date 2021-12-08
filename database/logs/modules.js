/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, sliceFileName } = require('../../utils')
/* eslint-enable no-unused-vars */

/**
 * Handles all of the command logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('moduleStatusChange', async (guild, module, enabled) => {
        if (!guild) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'modules')
        if (!isEnabled) return

        client.emit('debug', `Running event "${sliceFileName(__filename)}".`)

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated module status', guild.iconURL({ dynamic: true }))
            .setDescription(`The \`${module}\` module has been \`${enabled ? 'enabled' : 'disabled'}\`.`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })
}