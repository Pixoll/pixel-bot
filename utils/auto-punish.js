const { CommandoClient } = require('discord.js-commando')
const { ms } = require('./custom-ms')
const { isMod, mute, kick, tempban, ban, moduleStatus } = require('./functions')
const { moderations, modules } = require('./mongodb-schemas')

/**
 * This function performs automatic punishments according to the amount of warnings a member has
 * @param {CommandoClient} client
 **/
module.exports = (client) => {
    async function checkWarns() {
        const warns = await moderations.find({ type: 'warn' })

        for (const warn of warns) {
            const guild = await client.guilds.fetch(warn.guild, false, true)
            if (!guild) continue

            const status = await moduleStatus(modules, guild, 'autoMod')
            if (!status) return

            const user = await client.users.fetch(warn.user, false, true)
            if (!user) continue

            const member = await guild.members.fetch(user.id)

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
                if (member ? (member.bannable) : true) await tempban(guild, client, user, ms('30d'), 'You have 9 warnings')
            } else if (amout.length === 6) { // Kick
                const level = await moderations.findOne({ user: user.id, guild: guild.id, reason: 'You have 6 warnings' })
                if (!level && member && member.kickable) await kick(guild, client, member, 'You have 6 warnings')
            } else if (amout.length === 3) { // Mute
                const level = await moderations.findOne({ user: user.id, guild: guild.id, reason: 'You have 3 warnings' })
                const role = guild.roles.cache.find(role => role.name === 'Muted')
                if (!level && member && !member.roles.cache.has(role.id) || member.manageable || !isMod(member)) await mute(guild, client, member, role, ms('1d'), 'You have 3 warnings')
            }
        }

        setTimeout(checkWarns, 5 * 1000)
    }

    checkWarns()
}