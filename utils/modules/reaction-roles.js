const { TextChannel, NewsChannel, Message, MessageReaction, User, Role, GuildMember } = require('discord.js')
const { CommandoClient, CommandoGuild } = require('discord.js-commando')
const { findCommonElement, fetchPartial } = require('../functions')
const { reactionRoles } = require('../mongo/schemas')

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
            const guild = guilds.cache.get(data.guild) || await guilds.fetch(data.guild, false, true).catch(() => null)
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
            const message = await channel.messages.fetch(data.message, false, true).catch(() => null)
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
            const role = roles.cache.get(data.roles[i]) || await roles.fetch(data.roles[i], false, true).catch(() => null)
            /** @type {GuildMember} */
            const member = members.cache.get(id) || await members.fetch(id).catch(() => null)
            if (!member || !role) continue

            member.roles.add(role).catch(() => null)
        }
    })

    client.on('messageReactionRemove', async (_reaction, _user) => {
        /** @type {MessageReaction} */
        const { message, emoji } = await fetchPartial(_reaction)
        const { guild } = message
        const { roles, members } = guild
        const reaction = emoji.id || emoji.name

        /** @type {User} */
        const { bot, id } = await fetchPartial(_user)

        if (bot || !guild) return

        const rRoles = await reactionRoles.find({})
        if (rRoles.length === 0) return

        for (const data of rRoles) {
            if (message.id !== data.message || !data.emojis.includes(reaction)) continue

            /** @type {number} */
            const i = data.emojis.indexOf(reaction)

            /** @type {Role} */
            const role = roles.cache.get(data.roles[i]) || await roles.fetch(data.roles[i], false, true).catch(() => null)
            /** @type {GuildMember} */
            const member = members.cache.get(id) || await members.fetch(id).catch(() => null)
            if (!member || !role) continue

            member.roles.remove(role).catch(() => null)
        }
    })
}