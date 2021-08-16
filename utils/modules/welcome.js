const { MessageEmbed, TextChannel } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { moduleStatus } = require('../functions')
const { welcome, modules } = require('../mongo/schemas')

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

        /** @param {String} str */
        function format(str) {
            return str.replace(/{user}/g, user)
                .replace(/{server name}/g, guild.name)
                .replace(/{member count}/g, guild.memberCount)
        }

        if (data.dms) {
            const embed = new MessageEmbed()
                .setColor('#4c9f4c')
                .setAuthor(`Welcome to ${guild.name}!`, guild.iconURL({ dynamic: true }))
                .setDescription(format(data.dms))
                .setFooter(guild.name, guild.iconURL({ dynamic: true }))
                .setTimestamp()
            user.send(embed).catch(() => null)
        }

        if (!data.channel && !data.message) return

        /** @type {TextChannel} */
        const channel = guild.channels.resolve(data.channel)
        if (!channel) return

        channel.send(format(data.message))
            .then(msg => msg.suppressEmbeds().catch(() => null))
            .catch(() => null)
    })
}