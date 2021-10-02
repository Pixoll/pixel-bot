const { MessageEmbed, MessageReaction, User, TextBasedChannels, Message, MessageOptions, GuildMember } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { myMs, noReplyInDMs } = require('../../utils')
const { fetchPartial, basicEmbed } = require('../../utils')
const { reminders } = require('../../mongo/schemas')
const { ReminderSchema } = require('../../mongo/typings')

/**
 * This module manages reminders.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    async function sendReminders() {
        const query = { remindAt: { $lte: Date.now() } }
        /** @type {ReminderSchema[]} */
        const data = await reminders.find(query)
        const { users, channels } = client

        for (const reminder of data) {
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

        await reminders.deleteMany(query)
        setTimeout(sendReminders, 5 * 1000)
    }

    await sendReminders()

    // Cancells the reminders
    client.on('messageReactionAdd', async (_reaction, _user) => {
        /** @type {MessageReaction} */
        const { message, emoji } = await fetchPartial(_reaction)
        /** @type {User} */
        const user = await fetchPartial(_user)

        if (user.bot || emoji.id !== '802617654442852394') return

        /** @type {ReminderSchema} */
        const data = await reminders.findOne({ user: user.id, message: message.id })
        if (!data) return

        await user.send({
            embeds: [basicEmbed({
                color: 'GREEN', emoji: 'check', fieldName: 'Your reminder has been cancelled',
                fieldValue: data.reminder
            })]
        })

        await data.deleteOne()
    })

    client.emit('debug', 'Loaded modules/reminders')
}