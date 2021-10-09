const { TextChannel, Message, MessageReaction, User, Role, GuildMember } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { findCommonElement, fetchPartial } = require('../../utils')
const { reactionRoles } = require('../../mongo/schemas')
const { ReactionRoleSchema } = require('../../mongo/typings')

/**
 * This module manages reaction roles.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    async function removeMissingData() {
        /** @type {ReactionRoleSchema[]} */
        const rRoles = await reactionRoles.find({})
        if (rRoles.length === 0) return
        const guilds = client.guilds.cache
        const channels = client.channels.cache

        for (const data of rRoles) {
            const guild = guilds.get(data.guild)
            if (!guild) {
                await data.deleteOne()
                continue
            }

            /** @type {TextChannel} */
            const channel = channels.get(data.channel)
            if (!channel) {
                await data.deleteOne()
                continue
            }

            /** @type {Message} */
            const message = await channel.messages.fetch(data.message).catch(() => null)
            const reactions = message?.reactions.cache
            const commonEmojis = !!findCommonElement(reactions?.map(({ emoji }) => emoji.id || emoji.name), data.emojis)

            if (!message || reactions.size === 0 || !commonEmojis) {
                await data.deleteOne()
                continue
            }
        }

        setTimeout(removeMissingData, 60 * 60 * 1000)
    }

    await removeMissingData()

    client.on('messageReactionAdd', async (_reaction, _user) => {
        /** @type {MessageReaction} */
        const { message, emoji } = await fetchPartial(_reaction)
        /** @type {User} */
        const user = await fetchPartial(_user)

        const { guild } = message
        const reaction = emoji.id || emoji.name
        if (user.bot || !guild) return

        const { roles, members } = guild

        /** @type {ReactionRoleSchema} */
        const data = await reactionRoles.findOne({ guild: guild.id, message: message.id })
        if (!data) return
        if (!data.emojis.includes(reaction)) return

        const i = data.emojis.indexOf(reaction)

        /** @type {Role} */
        const role = await roles.fetch(data.roles[i]).catch(() => null)
        /** @type {GuildMember} */
        const member = await members.fetch(user).catch(() => null)
        if (!member || !role) return

        await member.roles.add(role).catch(() => null)
    })

    client.on('messageReactionRemove', async (_reaction, _user) => {
        /** @type {MessageReaction} */
        const { message, emoji } = await fetchPartial(_reaction)
        /** @type {User} */
        const user = await fetchPartial(_user)

        const { guild } = message
        const reaction = emoji.id || emoji.name
        if (user.bot || !guild) return

        const { roles, members } = guild

        /** @type {ReactionRoleSchema} */
        const data = await reactionRoles.findOne({ guild: guild.id, message: message.id })
        if (!data) return
        if (!data.emojis.includes(reaction)) return

        const i = data.emojis.indexOf(reaction)

        /** @type {Role} */
        const role = await roles.fetch(data.roles[i]).catch(() => null)
        /** @type {GuildMember} */
        const member = await members.fetch(user).catch(() => null)
        if (!member || !role) return

        await member.roles.remove(role).catch(() => null)
    })

    client.emit('debug', 'Loaded modules/reaction-roles')
}