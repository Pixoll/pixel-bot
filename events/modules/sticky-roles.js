const { GuildMember } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { fetchPartial, isModuleEnabled } = require('../../utils')
const { stickyRoles, setup } = require('../../mongo/schemas')
const { SetupSchema, StickyRoleSchema } = require('../../mongo/typings')

/**
 * Handles sticky roles for joining/leaving members.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberAdd', async member => {
        const { guild, roles, id } = member
        if (id === client.user.id) return

        const isEnabled = await isModuleEnabled(guild, 'sticky-roles')
        if (!isEnabled) return

        /** @type {StickyRoleSchema} */
        const rolesData = await stickyRoles.findOne({ guild: guild.id, user: id })
        if (!rolesData) return

        for (const role of rolesData.roles) await roles.add(role).catch(() => null)
    })

    client.on('guildMemberRemove', async member => {
        /** @type {GuildMember} */
        const { guild, id, roles } = await fetchPartial(member)
        const botId = client.user.id
        if (id === botId) return

        const isEnabled = await isModuleEnabled(guild, 'sticky-roles')
        if (!isEnabled) return

        const { members } = guild

        /** @type {SetupSchema} */
        const data = await setup.findOne({ guild: guild.id })
        /** @type {StickyRoleSchema} */
        const rolesData = await stickyRoles.findOne({ guild: guild.id, user: id })

        /** @type {GuildMember} */
        const botMember = await members.fetch(botId).catch(() => null)
        const rolesArray = roles.cache.filter(async role => {
            const first = role.id !== guild.id
            const second = ![data?.memberRole, data?.botRole].includes(role.id)
            const third = role.position < botMember?.roles.highest.position

            return first && second && third
        }).map(r => r.id)

        /** @type {StickyRoleSchema} */
        const doc = {
            guild: guild.id,
            user: id,
            roles: rolesArray
        }

        if (!rolesData) await new stickyRoles(doc).save()
        else await rolesData.updateOne({ roles: rolesArray })
    })

    client.emit('debug', 'Loaded modules/sticky-roles')
}