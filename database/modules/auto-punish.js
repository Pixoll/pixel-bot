const { User } = require('discord.js')
const { CommandoClient, CommandoGuild } = require('../../command-handler/typings')
const myMs = require('../../utils/my-ms')
const { isMod, mute, kick, tempban, ban, moduleStatus } = require('../../utils/functions')
const { moderations, modules } = require('../../schemas')

/**
 * This module manages automatic punishments, related to the warns of the user.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    async function checkWarns() {
        const warns = await moderations.find({ type: 'warn' })
        const { guilds, users } = client

        for (const warn of warns) {
            /** @type {CommandoGuild} */
            const guild = await guilds.fetch(warn.guild, false).catch(() => null)
            if (!guild) continue

            const status = await moduleStatus(modules, guild, 'autoMod')
            if (!status) return

            /** @type {User} */
            const user = await users.fetch(warn.user, false).catch(() => null)
            if (!user) continue

            const { members } = guild
            const member = await members.fetch({ user: user.id, cache: false }).catch(() => null)

            const invites = await moderations.find({ type: 'warn', guild: guild.id, user: user.id, reason: 'Posted an invite' })
            if (invites.length > 2) { // Ban
                const level = await moderations.findOne({ user: user.id, guild: guild.id, reason: 'Possible raid threat' })
                if (!level) {
                    if (member) {
                        if (member.bannable) await ban(guild, client, user, 'Possible raid threat')
                    }
                    else await ban(guild, client, user, 'Possible raid threat')
                }
            }

            const amout = await moderations.find({ type: 'warn', guild: guild.id, user: user.id, reason: { $ne: 'Posted an invite' } })

            if (amout.length === 12) { // Ban
                const level = await moderations.findOne({ user: user.id, guild: guild.id, reason: 'You have 12 warnings' })
                if (level) return
                if (member ? (member.bannable) : true) await ban(guild, client, user, 'You have 12 warnings')
            } else if (amout.length === 9) { // Tempban
                const level = await moderations.findOne({ user: user.id, guild: guild.id, reason: 'You have 9 warnings' })
                if (level) return
                if (member ? (member.bannable) : true) await tempban(guild, client, user, myMs('30d'), 'You have 9 warnings')
            } else if (amout.length === 6) { // Kick
                const level = await moderations.findOne({ user: user.id, guild: guild.id, reason: 'You have 6 warnings' })
                if (!level && member && member.kickable) await kick(guild, client, member, 'You have 6 warnings')
            } else if (amout.length === 3) { // Mute
                const level = await moderations.findOne({ user: user.id, guild: guild.id, reason: 'You have 3 warnings' })
                const role = guild.roles.cache.find(role => role.name === 'Muted')
                if (!level && member && !member.roles.cache.has(role.id) || member.manageable || !isMod(member)) await mute(guild, client, member, role, myMs('1d'), 'You have 3 warnings')
            }
        }

        setTimeout(checkWarns, 5 * 1000)
    }

    checkWarns()
}
