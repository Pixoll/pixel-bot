const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, getLogsChannel } = require('../../utils')

/**
 * Handles all of the command logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('moduleStatusChange', async (guild, module, enabled) => {
        if (!guild) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'modules')
        if (!isEnabled) return

        // const logsChannel = await getLogsChannel(guild)
        // if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated module status', guild.iconURL({ dynamic: true }))
            .setDescription(`The \`${module}\` module has been \`${enabled ? 'enabled' : 'disabled'}\`.`)
            .setTimestamp()

        // await logsChannel.send({ embeds: [embed] }).catch(() => null)
        guild.queuedLogs.push(embed)
    })
}