const { MessageEmbed, User, TextBasedChannels, Message, MessageOptions, GuildMember } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { myMs, noReplyInDMs, fetchPartial } = require('../../utils')
const { basicEmbed } = require('../../utils')

/**
 * This module manages reminders.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    const db = client.database.reminders

    async function sendReminders() {
        const data = await db.fetchMany({ remindAt: { $lte: Date.now() } })
        const { users, channels } = client

        for (const [, reminder] of data) {
            /** @type {User} */
            const user = await users.fetch(reminder.user).catch(() => null)
            if (!user) continue

            /** @type {TextBasedChannels} */
            const channel = channels.resolve(reminder.channel)
            if (!channel) continue

            /** @type {GuildMember} */
            let member
            if (channel.type !== 'DM') {
                member = await channel.guild.members.fetch(user).catch(() => null)
            }

            /** @type {Message} */
            const msg = await channel.messages.fetch(reminder.message).catch(() => null)

            const time = myMs(Date.now() - reminder.createdAt, { long: true, length: 1 })

            const embed = new MessageEmbed()
                .setColor('#4c9f4c')
                .setAuthor(member?.displayName || user.username, user.displayAvatarURL({ dynamic: true }))
                .setDescription(reminder.reminder)
                .setFooter(`Set about ${time} ago`)
                .setTimestamp(reminder.createdAt)

            /** @type {MessageOptions} */
            const options = {}
            if (msg) options.reply = { messageReference: msg }
            else if (channel.type !== 'DM') options.content = user.toString()

            await channel.send({ embeds: [embed], ...options, ...noReplyInDMs(msg) }).catch(() => null)
        }

        for (const [, reminder] of data) {
            await db.delete(reminder)
        }

        setTimeout(sendReminders, 15 * 1000)
    }

    await sendReminders()

    // Cancells the reminders
    client.on('messageReactionAdd', async (reaction, user) => {
        reaction = await fetchPartial(reaction)
        user = await fetchPartial(user)
        if (!reaction || !user) return

        const { message, emoji } = reaction
        if (user.bot || emoji.id !== '802617654442852394') return

        const data = await db.fetch({ user: user.id, message: message.id })
        if (!data) return

        await user.send({
            embeds: [basicEmbed({
                color: 'GREEN', emoji: 'check', fieldName: 'Your reminder has been cancelled',
                fieldValue: data.reminder
            })]
        })

        await db.delete(data)
    })
}