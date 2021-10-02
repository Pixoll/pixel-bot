const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, getLogsChannel, channelTypes } = require('../../utils')

/**
 * Handles all of the voice logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        const { guild, member, id } = oldState

        const status = await isModuleEnabled(guild, 'audit-logs', 'voice')
        if (!status) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

        const { channel: channel1, serverMute: mute1, serverDeaf: deaf1 } = oldState
        const { channel: channel2, serverMute: mute2, serverDeaf: deaf2 } = newState
        const { user } = member

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
            .setFooter(`User id: ${id}`)
            .setTimestamp()

        if (!channel1) {
            embed.setColor('GREEN')
                .setDescription(
                    `${user.toString()} joined  ${channelTypes[channel2.type].toLowerCase()} channel ${channel2.toString()}`
                    )
        }

        if (!channel2) {
            embed.setColor('ORANGE')
                .setDescription(
                    `${user.toString()} left ${channelTypes[channel1.type].toLowerCase()} channel ${channel1.toString()}`
                    )
        }

        if (channel1 && channel2 && channel1.id !== channel2.id) {
            embed.addField(
                `Switched ${channelTypes[channel1.type].toLowerCase()} channels`,
                `${channel1.toString()} ➜ ${channel2.toString()}`
            )
        }

        if (typeof mute1 === 'boolean' && typeof mute2 === 'boolean' && mute1 !== mute2) {
            embed.setDescription(`${user.toString()} has been server ${mute2 ? 'muted': 'unmuted'}`)
        }

        if (typeof deaf1 === 'boolean' && typeof deaf2 === 'boolean' && deaf1 !== deaf2) {
            embed.setDescription(`${user.toString()} has been server ${deaf2 ? 'deafened': 'undeafened'}`)
        }

        if (embed.description || embed.fields.length !== 0) {
            await logsChannel.send({ embeds: [embed] }).catch(() => null)
        }
    })

    client.emit('debug', 'Loaded audit-logs/voice')
}