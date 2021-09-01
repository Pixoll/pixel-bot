const { MessageEmbed, TextChannel } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { moduleStatus } = require('../../utils/functions')
const { welcome, modules } = require('../../utils/mongo/schemas')

/**
 * This module manages welcome messages.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberAdd', async ({ guild, user }) => {
        const status = await moduleStatus(modules, guild, 'welcome')
        if (!status) return

        const data = await welcome.findOne({ guild: guild.id })
        if (!data) return

        /** @type {TextChannel} */
        const channel = guild.channels.resolve(data?.channel)

        /** @param {String} str */
        function format(str) {
            return str.replace(/{user}/g, user.toString())
                .replace(/{server name}/g, guild.name)
                .replace(/{member count}/g, guild.memberCount)
        }

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`Welcome to ${guild.name}!`, guild.iconURL({ dynamic: true }))
            .setFooter('Enjoy your stay')
            .setTimestamp()

        if (data.dms) {
            embed.setDescription(format(data.dms))
            await user.send(embed).catch(() => null)
        }

        if (channel && data.message) {
            embed.setDescription(format(data.message))
            await channel.send(user.toString(), { embed })
        }
    })
}