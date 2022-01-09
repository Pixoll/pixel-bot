/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js')
const { basicEmbed, sleep, timestamp } = require('../../utils/functions')
const { CommandoClient, CommandoMessage } = require('../../command-handler/typings')
/* eslint-enable no-unused-vars */

/**
 * This module manages `!afk`'s timeouts and mentions.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('commandoMessageCreate', async message => {
        const { guild, author, isCommand, command } = message
        if (!guild || author.bot || (isCommand && command?.name === 'afk')) return

        const db = guild.database.afk
        const status = await db.fetch({ user: author.id })
        if (!status) return

        await db.delete(status)

        const toDelete = await message.replyEmbed(basicEmbed({
            color: 'GREEN', description: `Welcome back ${author.toString()}, I removed your AFK status.`
        }))

        await sleep(10)
        await toDelete?.delete().catch(() => null)
    })

    client.on('commandoMessageCreate', async message => {
        const { guild, author, mentions } = message
        const { everyone, users } = mentions
        if (!guild || author.bot || everyone) return

        const db = guild.database.afk
        const embeds = []
        for (const user of users.toJSON()) {
            const data = await db.fetch({ user: user.id })
            if (!data) continue

            const embed = new MessageEmbed()
                .setColor('GOLD')
                .setAuthor({
                    name: `${user.username} is AFK`, iconURL: user.displayAvatarURL({ dynamic: true })
                })
                .setDescription(`${data.status}\n${timestamp(data.updatedAt, 'R')}`)
                .setTimestamp(data.updatedAt)
            embeds.push(embed)
        }

        if (embeds.length === 0) return

        const toDelete = []
        while (embeds.length > 0) {
            const sliced = embeds.splice(0, 10)
            /** @type {CommandoMessage} */
            const msg = await message.replyEmbed({ embeds: sliced }).catch(() => null)
            toDelete.push(msg)
        }

        await sleep(15)
        for (const msg of toDelete) {
            await msg?.delete().catch(() => null)
        }
    })
}
