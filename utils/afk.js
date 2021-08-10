const { MessageEmbed } = require('discord.js')
const { afk } = require('./mongodb-schemas')
const { basicEmbed, fetchPartial } = require('./functions')
const { CommandoClient, CommandoMessage } = require('discord.js-commando')
const { toNow } = require('./custom-ms')

/**
 * This function handles `!afk`'s timeouts and mentions.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('message', async _message => {
        /** @type {CommandoMessage} */
        const message = await fetchPartial(_message)
        
        const { guild, author, isCommand, command } = message

        if (!guild || author.bot) return
        if (isCommand && command?.name === 'afk') return

        const status = await afk.findOne({ guild: guild.id, user: author.id })
        if (!status) return

        await status.deleteOne()

        message.say(basicEmbed('green', '', `Welcome back ${author.toString()}, I removed your AFK status.`))
            .then(msg =>
                msg.delete({ timeout: 10000 }).catch(() => null)
            )
    })

    client.on('message', async _message => {
        /** @type {CommandoMessage} */
        const message = await fetchPartial(_message)

        const { guild, author, mentions } = message
        const { everyone, users } = mentions

        if (!guild || author.bot || everyone) return

        for (const [, user] of users) {
            const data = await afk.findOne({ guild: guild.id, user: user.id })
            if (!data) return

            const diff = toNow(data.updatedAt)

            const embed = new MessageEmbed()
                .setColor('GOLD')
                .setAuthor(`${user.username} is AFK`, user.displayAvatarURL({ dynamic: true }))
                .addField('Status:', data.status)
                .setFooter(`${diff} ago`)
                .setTimestamp(data.updatedAt)

            message.say(embed).then(msg =>
                msg.delete({ timeout: 30000 }).catch(() => null)
            )
        }
    })
}