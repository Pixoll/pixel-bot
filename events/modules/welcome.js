const { MessageEmbed, TextChannel } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled } = require('../../utils')
const { welcome } = require('../../mongo/schemas')
const { WelcomeSchema } = require('../../mongo/typings')

/**
 * This module manages welcome messages.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberAdd', async ({ guild, user }) => {
        if (user.bot) return

        const isEnabled = await isModuleEnabled(guild, 'welcome')
        if (!isEnabled) return

        /** @type {WelcomeSchema} */
        const data = await welcome.findOne({ guild: guild.id })
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
            .setAuthor(`Welcome to ${guild.name}!`, guild.iconURL({ dynamic: true }))
            .setFooter('Enjoy your stay')
            .setTimestamp()

        if (data.dms) {
            embed.setDescription(format(data.dms))
            await user.send({ embeds: [embed] }).catch(() => null)
        }

        if (channel && data.message) {
            embed.setDescription(format(data.message))
            await channel.send({ content: user.toString(), embeds: [embed] })
        }
    })

    client.emit('debug', 'Loaded modules/welcome')
}