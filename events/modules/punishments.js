const { MessageEmbed } = require('discord.js')
const { CommandoClient, CommandoGuild } = require('../../command-handler/typings')
const { active, setup } = require('../../mongo/schemas')

/**
 * This module manages expired punishments.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    async function checkPunishments() {
        const query = { duration: { $lte: Date.now() } }
        const mods = await active.find(query)
        const { guilds, users } = client

        for (const mod of mods) {
            /** @type {CommandoGuild} */
            const guild = await guilds.fetch(mod.guild, false).catch(() => null)
            if (!guild) continue

            const user = await users.fetch(mod.user, false).catch(() => null)
            if (!user) continue
            const member = guild.members.cache.get(user.id)

            if (mod.type === 'temp-ban') {
                const ban = await guild.fetchBan(user).catch(() => null)
                if (ban) guild.members.unban(user, 'Ban has expired.')
            } else if (mod.type === 'mute' || mod.type === 'temp-role') {
                if (!member) continue
                const role = mod.type === 'mute' ? guild.roles.cache.find(role => role.name.toLowerCase() === 'muted') : guild.roles.cache.find(role => role.id === mod.role)
                if (role && member.roles.cache.has(role.id)) member.roles.remove(role)
            }

            const data = await setup.findOne({ guild: guild.id })
            const logsChannel = data ? guild.channels.cache.find(channel => channel.id === data.logsChannel) : undefined
            if (!logsChannel) return

            const embed = new MessageEmbed()
                .setColor('#f1c40f')
                .setAuthor(`${user.tag} | Unban`, user.displayAvatarURL({ dynamic: true }))
                .setDescription(`**>** **User:** ${user}\n**>** **Moderator:** <@${mod.mod}>\n**>** **Reason:** Ban has expired.`)
                .setFooter(`User Id: ${user.id}`)
                .setTimestamp()

            logsChannel.send(embed).catch(() => null)
        }

        await active.deleteMany(query)
        setTimeout(checkPunishments, 5 * 1000)
    }

    checkPunishments()
}