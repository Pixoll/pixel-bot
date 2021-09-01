const { MessageEmbed, MessageReaction, User, TextChannel, DMChannel, NewsChannel } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { ms } = require('../../utils/custom-ms')
const { fetchPartial, basicEmbed } = require('../../utils/functions')
const { reminders } = require('../../utils/mongo/schemas')

/**
 * This module manages reminders.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    async function sendReminders() {
        const query = { remindAt: { $lte: Date.now() } }
        const data = await reminders.find(query)
        const { users, channels } = client

        for (const reminder of data) {
            /** @type {User} */
            const user = await users.fetch(reminder.user, false).catch(() => null)
            if (!user) continue

            /** @type {TextChannel|NewsChannel|DMChannel} */
            const channel = channels.resolve(reminder.channel)
            if (!channel) continue

            const time = Date.now() - reminder.createdAt
            const format = ms(time, { long: true, length: 1 })

            const embed = new MessageEmbed()
                .setColor('#4c9f4c')
                .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
                .setDescription(`[Link to original](${reminder.link})`)
                .addField('Reminder', reminder.reminder)
                .setFooter(`Set about ${format} ago`)
                .setTimestamp(reminder.createdAt)

            channel.send(user.toString(), { embed }).catch(() => null)
        }

        await reminders.deleteMany(query)
        setTimeout(sendReminders, 1 * 1000)
    }

    sendReminders()

    // Cancells the reminders
    client.on('messageReactionAdd', async (_reaction, _user) => {
        /** @type {MessageReaction} */
        const { message, emoji } = await fetchPartial(_reaction)
        /** @type {User} */
        const user = await fetchPartial(_user)

        if (user.bot || emoji.id !== '802617654442852394') return

        const data = await reminders.findOne({ user: user.id, message: message.id })
        if (!data) return

        await user.send(basicEmbed('green', 'check', 'Your reminder has been cancelled', data.reminder))

        await data.deleteOne()
    })
}