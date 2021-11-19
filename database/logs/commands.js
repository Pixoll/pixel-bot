/* eslint-disable no-unused-vars */
const { oneLine } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, sliceDots, code } = require('../../utils')
/* eslint-enable no-unused-vars */

/**
 * Handles all of the command logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('commandRun', async (command, _, { message, interaction }) => {
        const { guild, channel } = message || interaction
        const author = message?.author || interaction.user
        const isModCommand = !!command.userPermissions || command.ownerOnly ||
            command.guildOwnerOnly || command.name === 'prefix'

        if (channel.type === 'DM' || command.hidden || !isModCommand) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'commands')
        if (!isEnabled) return

        let string
        if (message) string = message.cleanContent
        else {
            string = `/${command.name}`
            const data = interaction.options.data[0]
            if (data) {
                /** @param {data} data */
                function concat(data) {
                    if (data.name && data.value === undefined) {
                        string += ` ${data.name}`
                        for (const option of data.options) {
                            concat(option)
                        }
                    } else {
                        string += ` ${data.name}: ${data.value}`
                    }
                }
                concat(data)
            }
        }
        const content = sliceDots(string, 1016)

        let url
        if (message) url = message.url
        else {
            const msg = await interaction.fetchReply()
            if (msg) url = msg.url
        }

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor(`Used ${command.name} command`, author.displayAvatarURL({ dynamic: true }))
            .setDescription(oneLine`
                ${author.toString()} used the \`${command.name}\` command in ${channel.toString()}
                ${url ? `[Jump to message](${url})` : ''}
            `)
            .addField('Message', code(content))
            .setFooter(`Author id: ${author.id}`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('commandPrefixChange', async (guild, prefix) => {
        if (!guild) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'commands')
        if (!isEnabled) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated command prefix', guild.iconURL({ dynamic: true }))
            .setDescription(`**New prefix:** ${prefix}`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('commandStatusChange', async (guild, command, enabled) => {
        if (!guild) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'commands')
        if (!isEnabled) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated command status', guild.iconURL({ dynamic: true }))
            .setDescription(`The \`${command.name}\` command has been \`${enabled ? 'enabled' : 'disabled'}\`.`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })
}