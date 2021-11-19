/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js')
const { basicEmbed, sleep, timestamp } = require('../../utils')
const { CommandoClient } = require('../../command-handler/typings')
/* eslint-enable no-unused-vars */

/**
 * This module manages `!afk`'s timeouts and mentions.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('cMessageCreate', async message => {
        const { guild, author, isCommand, command } = message

        if (!guild || author.bot) return
        if (isCommand && command?.name === 'afk') return

        const db = guild.database.afk
        const status = await db.fetch({ user: author.id })
        if (!status) return

        await db.delete(status)

        const toDelete = await message.reply({
            embeds: [basicEmbed({
                color: 'GREEN', description: `Welcome back ${author.toString()}, I removed your AFK status.`
            })]
        })

        await sleep(10)
        await toDelete.delete().catch(() => null)
    })

    client.on('cMessageCreate', async message => {
        const { guild, author, mentions } = message
        const { everyone, users } = mentions

        if (!guild || author.bot || everyone) return

        const db = guild.database.afk
        for (const [, user] of users) {
            const data = await db.fetch({ user: user.id })
            if (!data) return

            const embed = new MessageEmbed()
                .setColor('GOLD')
                .setAuthor(`${user.username} is AFK`, user.displayAvatarURL({ dynamic: true }))
                .setDescription(`${data.status}\n${timestamp(data.updatedAt, 'R')}`)
                .setTimestamp(data.updatedAt)

            const toDelete = await message.replyEmbed(embed)

            await sleep(15)
            await toDelete.delete().catch(() => null)
        }
    })
}