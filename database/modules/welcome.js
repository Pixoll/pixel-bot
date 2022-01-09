/* eslint-disable no-unused-vars */
const { MessageEmbed, TextChannel } = require('discord.js')
const { CommandoClient, CommandoMember } = require('../../command-handler/typings')
const { isModuleEnabled } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/**
 * This module manages welcome messages.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberAdd', /** @param {CommandoMember} member */ async ({ guild, user }) => {
        if (user.bot) return

        const isEnabled = await isModuleEnabled(guild, 'welcome')
        if (!isEnabled) return

        client.emit('debug', 'Running event "modules/welcome".')

        const data = await guild.database.welcome.fetch()
        if (!data) return

        /** @type {TextChannel} */
        const channel = guild.channels.resolve(data.channel)

        /** @param {String} str */
        function format(str) {
            return str.replace(/{user}/g, user.toString())
                .replace(/{server_name}/g, guild.name)
                .replace(/{member_count}/g, guild.memberCount)
        }

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `Welcome to ${guild.name}!`, iconURL: guild.iconURL({ dynamic: true })
            })
            .setFooter({ text: 'Enjoy your stay' })
            .setTimestamp()

        if (channel && data.message) {
            embed.setDescription(format(data.message))
            await channel.send({ content: user.toString(), embeds: [embed] })
        }
    })
}
