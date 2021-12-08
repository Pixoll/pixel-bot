/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, timestamp, customEmoji } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/**
 * Handles all of the member logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        const { premiumSinceTimestamp: boostTime2, guild, user, id } = newMember
        const { premiumSinceTimestamp: boostTime1, partial } = oldMember
        if (!guild.available || partial || boostTime1 === boostTime2) return

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'boosts')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/boosts".')

        const action = boostTime1 === null ? 'started' : 'stopped'
        const emoji = action === 'started' ? customEmoji('boost') : ''

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor(user.tag, newMember.displayAvatarURL({ dynamic: true }))
            .setDescription(`${user.toString()} ${action} boosting ${emoji}`)
            .setFooter(`User id: ${id}`)
            .setTimestamp()

        if (action === 'stopped') embed.addField('Boosted for', timestamp(boostTime1, 'R'))

        guild.queuedLogs.push(embed)
    })
}