/* eslint-disable no-unused-vars */
const { TextChannel, Message, Role, GuildMember } = require('discord.js')
const { CommandoClient, CommandoMessage } = require('../../command-handler/typings')
const { findCommonElement, fetchPartial, sliceFileName } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/**
 * This module manages reaction roles.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    async function removeMissingData() {
        client.emit('debug', `Running "${sliceFileName(__filename)}#missingData".`)

        const guilds = client.guilds.cache.toJSON()
        const channels = client.channels.cache

        for (const guild of guilds) {
            const db = guild.database.reactionRoles

            const data = await db.fetchMany()
            for (const doc of data.toJSON()) {
                /** @type {TextChannel} */
                const channel = channels.get(doc.channel)
                if (!channel) {
                    await db.delete(doc)
                    continue
                }

                /** @type {Message} */
                const message = await channel.messages.fetch(doc.message).catch(() => null)
                const reactions = message?.reactions.cache
                const commonEmojis = !!findCommonElement(
                    reactions?.map(r => r.emoji.id || r.emoji.name), doc.emojis
                )

                if (!message || reactions.size === 0 || !commonEmojis) {
                    await db.delete(doc)
                    continue
                }
            }
        }

        setTimeout(async () => await removeMissingData(), 60 * 60 * 1000)
    }

    await removeMissingData()

    client.on('messageReactionAdd', async (reaction, user) => {
        reaction = await fetchPartial(reaction)
        user = await fetchPartial(user)

        let { message, emoji } = reaction
        message = await message.fetch().catch(() => null)
        if (!message) return

        /** @type {CommandoMessage} */
        const { guild } = message
        const react = emoji.id || emoji.name
        if (user.bot || !guild) return

        client.emit('debug', `Running event "${sliceFileName(__filename)}#messageReactionAdd".`)
        const { roles, members, database } = guild

        const data = await database.reactionRoles.fetch({ message: message.id })
        if (!data || !data.emojis.includes(react)) return

        const i = data.emojis.indexOf(react)

        /** @type {Role} */
        const role = await roles.fetch(data.roles[i]).catch(() => null)
        /** @type {GuildMember} */
        const member = await members.fetch(user).catch(() => null)
        if (!member || !role) return

        await member.roles.add(role).catch(() => null)
    })

    client.on('messageReactionRemove', async (reaction, user) => {
        reaction = await reaction.fetch().catch(() => null)
        user = await user.fetch().catch(() => null)
        if (!reaction || !user) return

        let { message, emoji } = reaction
        message = await message.fetch().catch(() => null)
        if (!message) return

        /** @type {CommandoMessage} */
        const { guild } = message
        const react = emoji.id || emoji.name
        if (user.bot || !guild) return

        client.emit('debug', `Running event "${sliceFileName(__filename)}#messageReactionRemove".`)
        const { roles, members, database } = guild

        const data = await database.reactionRoles.fetch({ message: message.id })
        if (!data || !data.emojis.includes(react)) return

        const i = data.emojis.indexOf(react)

        /** @type {Role} */
        const role = await roles.fetch(data.roles[i]).catch(() => null)
        /** @type {GuildMember} */
        const member = await members.fetch(user).catch(() => null)
        if (!member || !role) return

        await member.roles.remove(role).catch(() => null)
    })
}