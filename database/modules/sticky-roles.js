/* eslint-disable no-unused-vars */
const { CommandoClient, CommandoMember } = require('../../command-handler/typings')
const { isModuleEnabled, fetchPartial } = require('../../utils')
/* eslint-enable no-unused-vars */

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
        member = await fetchPartial(member)
        if (!member) return

        const { guild, id, roles } = member
        if (id === botId || !guild.available) return

        const isEnabled = await isModuleEnabled(guild, 'sticky-roles')
        if (!isEnabled) return

        const { setup, stickyRoles } = guild.database
        const data = await setup.fetch()

        const rolesArray = roles.cache.filter(role => {
            if (role.id === guild.id) return false
            if (guild.me.roles.highest.comparePositionTo(role) < 1) return false
            if ([data?.memberRole, data?.botRole].includes(role.id)) return false
            return true
        })

        await stickyRoles.add({
            guild: guild.id,
            user: id,
            roles: rolesArray.map(r => r.id)
        })
    })
}