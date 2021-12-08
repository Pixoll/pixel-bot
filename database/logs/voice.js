/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

const channelTypes = {
    GUILD_TEXT: 'Text',
    DM: 'Direct messages',
    GUILD_VOICE: 'Voice',
    GROUP_DM: 'Group direct messages',
    GUILD_CATEGORY: 'Category',
    GUILD_NEWS: 'News',
    GUILD_STORE: 'Store',
    UNKNOWN: 'Unknown',
    GUILD_NEWS_THREAD: 'News thread',
    GUILD_PUBLIC_THREAD: 'Public thread',
    GUILD_PRIVATE_THREAD: 'Private thread',
    GUILD_STAGE_VOICE: 'Stage',
}

/**
 * Handles all of the voice logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        const { guild, member, id } = oldState

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'voice')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/voice".')

        const { channel: channel1, serverMute: mute1, serverDeaf: deaf1 } = oldState
        const { channel: channel2, serverMute: mute2, serverDeaf: deaf2 } = newState
        const { user } = member

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
            .setFooter(`User id: ${id}`)
            .setTimestamp()

        if (!channel1 && channel2) {
            embed.setColor('GREEN')
                .setDescription(
                    `${user.toString()} joined ${channelTypes[channel2.type].toLowerCase()} channel ${channel2.toString()}`
                )
        }

        if (!channel2 && channel1) {
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
            embed.setDescription(`${user.toString()} has been server ${mute2 ? 'muted' : 'unmuted'}`)
        }

        if (typeof deaf1 === 'boolean' && typeof deaf2 === 'boolean' && deaf1 !== deaf2) {
            embed.setDescription(`${user.toString()} has been server ${deaf2 ? 'deafened' : 'undeafened'}`)
        }

        if (embed.description || embed.fields.length !== 0) {
            guild.queuedLogs.push(embed)
        }
    })
}