const { oneLine } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, getLogsChannel, sliceDots, code } = require('../../utils')

/**
 * Handles all of the command logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('commandRun', async (command, _, message) => {
        const { guild, author, channel, id, url, cleanContent } = message
        const isModCommand = !!command.userPermissions || command.ownerOnly ||
            command.serverOwnerOnly || command.name === 'prefix'

        if (channel.type === 'DM' || command.hidden || !isModCommand) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'commands')
        if (!isEnabled) return

        // const logsChannel = await getLogsChannel(guild)
        // if (!logsChannel) return

        const content = sliceDots(cleanContent, 1016)

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor(`Used ${command.name} command`, author.displayAvatarURL({ dynamic: true }))
            .setDescription(oneLine`
                ${author.toString()} used the \`${command.name}\` command in ${channel.toString()}
                [Jump to message](${url})
            `)
            .addField('Message', code(content))
            .setFooter(`Author id: ${author.id} | Message id: ${id}`)
            .setTimestamp()

        // await logsChannel.send({ embeds: [embed] }).catch(() => null)
        guild.queuedLogs.push(embed)
    })

    client.on('commandPrefixChange', async (guild, prefix) => {
        if (!guild) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'commands')
        if (!isEnabled) return

        // const logsChannel = await getLogsChannel(guild)
        // if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated command prefix', guild.iconURL({ dynamic: true }))
            .setDescription(`**New prefix:** ${prefix}`)
            .setTimestamp()

        // await logsChannel.send({ embeds: [embed] }).catch(() => null)
        guild.queuedLogs.push(embed)
    })

    client.on('commandStatusChange', async (guild, command, enabled) => {
        if (!guild) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'commands')
        if (!isEnabled) return

        // const logsChannel = await getLogsChannel(guild)
        // if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated command status', guild.iconURL({ dynamic: true }))
            .setDescription(`The \`${command.name}\` command has been \`${enabled ? 'enabled' : 'disabled'}\`.`)
            .setTimestamp()

        // await logsChannel.send({ embeds: [embed] }).catch(() => null)
        guild.queuedLogs.push(embed)
    })
}