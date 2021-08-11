const { Command, CommandoMessage } = require('discord.js-commando')
const { reminders: remindersDocs } = require('../../utils/mongo/schemas')
const { generateEmbed, basicEmbed } = require('../../utils/functions')

module.exports = class reminders extends Command {
    constructor(client) {
        super(client, {
            name: 'reminders',
            group: 'misc',
            memberName: 'reminders',
            description: 'Displays all of your active reminders.',
            clientPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 }
        })
    }

    onBlock() { return }
    onError() { return }

    /** @param {CommandoMessage} message */
    async run(message) {
        // tries to get the reminders of the user
        const data = await remindersDocs.find({ user: message.author.id })
        if (!data || data.length === 0) return message.say(basicEmbed('blue', 'info', 'You have no active reminders.'))

        // creates and sends a paged embed with the reminders
        generateEmbed(message, data, {
            authorName: `${message.author.username}'s reminders`,
            authorIconURL: message.author.displayAvatarURL({ dynamic: true }),
            title: 'Reminder set at',
            hasObjects: true,
            boldText: true,
            keyTitle: { name: 'remindAt', isDate: true },
            keys: ['reminder']
        }, true)
    }
}