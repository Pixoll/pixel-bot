/* eslint-disable no-unused-vars */
const { TextChannel, Message, Role, GuildMember } = require('discord.js')
const { CommandoClient, CommandoMessage } = require('../../command-handler/typings')
/* eslint-enable no-unused-vars */

/**
 * Loops over every element contained on both arrays and checks wether they have common elements.
 * @param {array} first The first array.
 * @param {array} second The second array.
 * @returns {boolean}
 */
 function findCommonElement(first, second) {
    for (let i = 0; i < first?.length; i++) {
        for (let j = 0; j < second?.length; j++) {
            if (first[i] === second[j]) return true
        }
    }
    return false
}

/**
 * This module manages reaction roles.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    async function removeMissingData() {
        client.emit('debug', 'Running "modules/reaction-roles#missingData".')

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
        if (reaction.partial) {
            reaction = await reaction.fetch().catch(() => null)
            if (!reaction) return
        }
        if (user.partial) {
            user = await user.fetch().catch(() => null)
            if (!user) return
        }

        let { message, emoji } = reaction
        if (message.partial) {
            message = await message.fetch().catch(() => null)
            if (!message) return
        }

        /** @type {CommandoMessage} */
        const { guild } = message
        const react = emoji.id || emoji.name
        if (user.bot || !guild) return

        client.emit('debug', 'Running event "modules/reaction-roles#messageReactionAdd".')
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
        if (reaction.partial) {
            reaction = await reaction.fetch().catch(() => null)
            if (!reaction) return
        }
        if (user.partial) {
            user = await user.fetch().catch(() => null)
            if (!user) return
        }

        let { message, emoji } = reaction
        if (message.partial) {
            message = await message.fetch().catch(() => null)
            if (!message) return
        }

        /** @type {CommandoMessage} */
        const { guild } = message
        const react = emoji.id || emoji.name
        if (user.bot || !guild) return

        client.emit('debug', 'Running event "modules/reaction-roles#messageReactionRemove".')
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
