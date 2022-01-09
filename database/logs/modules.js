/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/**
 * Handles all of the modules logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('moduleStatusChange', async (guild, module, enabled) => {
        if (!guild) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'modules')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/modules".')

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({
                name: 'Updated module status', iconURL: guild.iconURL({ dynamic: true })
            })
            .setDescription(`The \`${module}\` module has been \`${enabled ? 'enabled' : 'disabled'}\`.`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })
}
