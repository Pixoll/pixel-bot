const { GuildMember } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { fetchPartial } = require('../functions')
const { stickyRoles, setup } = require('../mongodb-schemas')

/**
 * Handles database behaviour in member events.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberAdd', async _member => {
        /** @type {GuildMember} */
        const { guild, user, roles, id } = await fetchPartial(_member)

        const data = await setup.findOne({ guild: guild.id })

        if (data?.memberRole && !user.bot) roles.add(data.memberRole).catch(() => null)
        if (data?.botRole && user.bot) roles.add(data.botRole).catch(() => null)

        const rolesData = await stickyRoles.findOne({ guild: guild.id, user: id })
        if (!rolesData) return

        for (const role of rolesData.roles) roles.add(role).catch(() => null)
    })

    client.on('guildMemberRemove', async _member => {
        /** @type {GuildMember} */
        const { guild, id, roles } = await fetchPartial(_member)

        const data = await setup.findOne({ guild: guild.id })
        const rolesData = await stickyRoles.findOne({ guild: guild.id, user: id })

        const rolesArray = roles.cache.filter(async ({ id, position }) => {
            const first = id !== guild.id
            const second = ![data?.memberRole, data?.botRole].includes(id)

            const botMember = await guild.members.fetch(client.user.id)
            const third = position < botMember.roles.highest.position

            return first && second && third
        }).map(({ id }) => id)

        const doc = {
            guild: guild.id,
            user: id,
            roles: rolesArray
        }

        if (!rolesData) await new stickyRoles(doc).save()
        else await rolesData.updateOne({ roles: rolesArray })
    })
}