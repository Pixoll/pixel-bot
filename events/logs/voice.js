const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { moduleStatus, getLogsChannel } = require('../../utils/functions')
const { setup, modules } = require('../../utils/mongo/schemas')

/**
 * Handles all of the voice logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        const { guild, member, id } = oldState

        const status = await moduleStatus(modules, guild, 'auditLogs', 'voice')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const { channel: channel1, serverMute: mute1, serverDeaf: deaf1 } = oldState
        const { channel: channel2, serverMute: mute2, serverDeaf: deaf2 } = newState
        const { user } = member

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated voice state', user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${user.toString()} ${user.tag}`)
            .setFooter(`User ID: ${id}`)
            .setTimestamp()

        if (!channel1) embed.setColor('GREEN').addField(`Joined ${channel2.type} channel`, `${channel2.toString()} ${channel2.name}`)

        if (!channel2) embed.setColor('ORANGE').addField(`Left ${channel1.type} channel`, `${channel1.toString()} ${channel1.name}`)

        if (channel1 && channel2) {
            if (channel1.id !== channel2.id) embed.addField(`Switched ${channel1.type} channels`, `${channel1} ➜ ${channel2}`)
        }

        if (typeof mute1 === 'boolean' && typeof mute2 === 'boolean') {
            if (mute1 !== mute2) embed.addField('Server mute', mute1 ? 'Yes ➜ No' : 'No ➜ Yes')
        }

        if (typeof deaf1 === 'boolean' && typeof deaf2 === 'boolean') {
            if (deaf1 !== deaf2) embed.addField('Server deaf', deaf1 ? 'Yes ➜ No' : 'No ➜ Yes')
        }

        if (embed.fields.length !== 0) logsChannel.send(embed).catch(() => null)
    })
}