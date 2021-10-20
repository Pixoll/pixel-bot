const { CommandoClient, CommandoMember } = require('../../command-handler/typings')
const { isModuleEnabled } = require('../../utils')

/**
 * Handles sticky roles for joining/leaving members.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    const botId = client.user.id

    client.on('guildMemberAdd', /** @param {CommandoMember} member */ async member => {
        const { guild, roles, id } = member
        if (id === botId) return

        const isEnabled = await isModuleEnabled(guild, 'sticky-roles')
        if (!isEnabled) return

        const rolesData = await guild.database.stickyRoles.fetch({ user: id })
        if (!rolesData) return

        for (const role of rolesData.roles) await roles.add(role).catch(() => null)
    })

    client.on('guildMemberRemove', /** @param {CommandoMember} member */ async member => {
        member = await member.fetch()
        const { guild, id, roles } = member
        if (id === botId) return

        const isEnabled = await isModuleEnabled(guild, 'sticky-roles')
        if (!isEnabled) return

        const { database } = guild

        const data = await database.setup.fetch()
        const rolesData = await database.stickyRoles.fetch({ user: id })

        const rolesArray = roles.cache.filter(async role => {
            const first = role.id !== guild.id
            const second = ![data?.memberRole, data?.botRole].includes(role.id)
            const third = role.position < guild.me?.roles.highest.position

            return first && second && third
        }).map(r => r.id)

        if (!rolesData) await database.stickyRoles.add({
            guild: guild.id,
            user: id,
            roles: rolesArray
        })
        else await database.stickyRoles.update(rolesData, { roles: rolesArray })
    })
}