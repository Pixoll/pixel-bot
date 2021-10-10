const { User, GuildMember } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { active, setup } = require('../../mongo/schemas')
const { ActiveSchema, SetupSchema } = require('../../mongo/typings')

/**
 * This module manages expired punishments.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    async function checkPunishments() {
        const query = { duration: { $lte: Date.now() } }
        /** @type {ActiveSchema[]} */
        const mods = await active.find(query)
        const { guilds, users } = client

        for (const doc of mods) {
            const guild = guilds.resolve(doc.guild)
            if (!guild) continue

            const { members, bans } = guild

            /** @type {User} */
            const mod = await users.fetch(doc.mod.id).catch(() => null)
            /** @type {User} */
            const user = await users.fetch(doc.user.id).catch(() => null)
            if (!user || !mod) continue
            /** @type {GuildMember} */
            const member = await members.fetch(user.id).catch(() => null)

            /** @type {SetupSchema} */
            const data = await setup.findOne({ guild: guild.id })

            if (doc.type === 'temp-ban') {
                const ban = await bans.fetch(user).catch(() => null)
                if (!ban) continue

                await members.unban(user, 'Ban has expired.')
                continue
            }

            if (!member) continue

            if (doc.type === 'mute') {
                if (!data) continue
                if (member.roles.cache.has(data.mutedRole)) {
                    await member.roles.remove(data.mutedRole)
                    client.emit('guildMemberUnmute', guild, mod, user, null, true)
                }
                continue
            }

            if (doc.type === 'temp-role') {
                if (member.roles.cache.has(doc.role)) {
                    await member.roles.remove(doc.role)
                    continue
                }
            }
        }

        await active.deleteMany(query)
        setTimeout(checkPunishments, 5 * 1000)
    }

    await checkPunishments()
}