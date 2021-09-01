const { TextChannel, NewsChannel, Message, MessageReaction, User, Role, GuildMember } = require('discord.js')
const { CommandoClient, CommandoGuild } = require('discord.js-commando')
const { findCommonElement, fetchPartial } = require('../../utils/functions')
const { reactionRoles } = require('../../utils/mongo/schemas')

/**
 * This module manages reaction roles.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    async function getReactionRoles() {
        const rRoles = await reactionRoles.find({})
        if (rRoles.length === 0) return
        const { guilds } = client

        for (const data of rRoles) {
            /** @type {CommandoGuild} */
            const guild = await guilds.fetch(data.guild, false).catch(() => null)
            if (!guild) {
                await data.deleteOne()
                continue
            }

            /** @type {TextChannel|NewsChannel} */
            const channel = guild.channels.resolve(data.channel)
            if (!channel) {
                await data.deleteOne()
                continue
            }

            /** @type {Message} */
            const message = await channel.messages.fetch(data.message, false).catch(() => null)
            const reactions = message?.reactions.cache
            const commonEmojis = !!findCommonElement(reactions?.map(({ emoji }) => emoji.id || emoji.name), data.emojis)

            if (!message || reactions.size === 0 || !commonEmojis) {
                await data.deleteOne()
                continue
            }
        }

        setTimeout(getReactionRoles, 60 * 1000)
    }

    getReactionRoles()

    client.on('messageReactionAdd', async (_reaction, _user) => {
        /** @type {MessageReaction} */
        const { message, emoji } = await fetchPartial(_reaction)
        const { guild } = message
        const reaction = emoji.id || emoji.name

        /** @type {User} */
        const { bot, id } = await fetchPartial(_user)

        if (bot || !guild) return
        const { roles, members } = guild

        const rRoles = await reactionRoles.find({})
        if (rRoles.length === 0) return

        for (const data of rRoles) {
            if (message.id !== data.message || !data.emojis.includes(reaction)) continue

            /** @type {number} */
            const i = data.emojis.indexOf(reaction)

            /** @type {Role} */
            const role = await roles.fetch(data.roles[i], false).catch(() => null)
            /** @type {GuildMember} */
            const member = await members.fetch({ user: id, cache: false }).catch(() => null)
            if (!member || !role) continue

            member.roles.add(role).catch(() => null)
        }
    })

    client.on('messageReactionRemove', async (_reaction, _user) => {
        /** @type {MessageReaction} */
        const { message, emoji } = await fetchPartial(_reaction)
        const { guild } = message
        const reaction = emoji.id || emoji.name

        /** @type {User} */
        const { bot, id } = await fetchPartial(_user)

        if (bot || !guild) return
        const { roles, members } = guild

        const rRoles = await reactionRoles.find({})
        if (rRoles.length === 0) return

        for (const data of rRoles) {
            if (message.id !== data.message || !data.emojis.includes(reaction)) continue

            /** @type {number} */
            const i = data.emojis.indexOf(reaction)

            /** @type {Role} */
            const role = await roles.fetch(data.roles[i], false).catch(() => null)
            /** @type {GuildMember} */
            const member = await members.fetch({ user: id, cache: false }).catch(() => null)
            if (!member || !role) continue

            member.roles.remove(role).catch(() => null)
        }
    })
}