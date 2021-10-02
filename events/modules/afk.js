const { MessageEmbed } = require('discord.js')
const { afk } = require('../../mongo/schemas')
const { basicEmbed, sleep, timestamp } = require('../../utils')
const { CommandoClient } = require('../../command-handler/typings')
const { Document } = require('mongoose')
const { AfkSchema } = require('../../mongo/typings')

/**
 * This module manages `!afk`'s timeouts and mentions.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('cMessageCreate', async message => {
        const { guild, author, isCommand, command } = message

        if (!guild || author.bot) return
        if (isCommand && command?.name === 'afk') return

        /** @type {Document} */
        const status = await afk.findOne({ guild: guild.id, user: author.id })
        if (!status) return

        await status.deleteOne()

        const toDelete = await message.replyEmbed(basicEmbed({
            color: 'GREEN', description: `Welcome back ${author.toString()}, I removed your AFK status.`
        }))

        await sleep(5)
        await toDelete.delete().catch(() => null)
    })

    client.on('cMessageCreate', async message => {
        const { guild, author, mentions } = message
        const { everyone, users } = mentions

        if (!guild || author.bot || everyone) return

        for (const [, user] of users) {
            /** @type {AfkSchema} */
            const data = await afk.findOne({ guild: guild.id, user: user.id })
            if (!data) return

            const embed = new MessageEmbed()
                .setColor('GOLD')
                .setAuthor(`${user.username} is AFK`, user.displayAvatarURL({ dynamic: true }))
                .setDescription(`${data.status}\n${timestamp(data.updatedAt, 'R')}`)
                .setTimestamp(data.updatedAt)

            const toDelete = await message.replyEmbed(embed)

            await sleep(10)
            await toDelete.delete().catch(() => null)
        }
    })

    client.emit('debug', 'Loaded modules/afk')
}