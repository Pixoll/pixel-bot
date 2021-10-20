const { User, GuildMember } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')

/**
 * This module manages expired punishments.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    async function checkPunishments() {
        const { users } = client
        const guilds = client.guilds.cache

        for (const [, guild] of guilds) {
            const { members, bans, database } = guild
            const db = database.active

            const docs = await db.fetchMany({ duration: { $lte: Date.now() } })
            for (const [, doc] of docs) {
                /** @type {User} */
                const mod = await users.fetch(doc.mod.id).catch(() => null)
                /** @type {User} */
                const user = await users.fetch(doc.user.id).catch(() => null)
                if (!user || !mod) continue

                if (doc.type === 'temp-ban') {
                    const ban = await bans.fetch(user).catch(() => null)
                    if (!ban) continue

                    await members.unban(user, 'Ban has expired.')
                    continue
                }

                /** @type {GuildMember} */
                const member = await members.fetch(user.id).catch(() => null)
                if (!member) continue
                const data = await database.setup.fetch()

                if (doc.type === 'mute') {
                    if (!data) continue
                    if (member.roles.cache.has(data.mutedRole)) {
                        await member.roles.remove(data.mutedRole)
                        client.emit('guildMemberUnmute', guild, mod, user, null, true)
                    }
                    continue
                }

                if (doc.type === 'temp-role') {
                    if (!member.roles.cache.has(doc.role)) continue
                    await member.roles.remove(doc.role)
                }
            }

            for (const [, doc] of docs) {
                await db.delete(doc)
            }
        }

        setTimeout(checkPunishments, 5 * 1000)
    }

    await checkPunishments()
}