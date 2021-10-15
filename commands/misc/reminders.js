const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { reminders } = require('../../mongo/schemas')
const { generateEmbed, basicEmbed, pluralize } = require('../../utils')
const { ReminderSchema } = require('../../mongo/typings')

/** A command that can be run in a client */
module.exports = class RemindersCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reminders',
            group: 'misc',
            description: 'Displays a list of all your active reminders.',
            throttling: { usages: 1, duration: 3 }
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const { author } = message

        /** @type {ReminderSchema[]} */
        const data = await reminders.find({ user: author.id })
        if (data.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'You have no active reminders.'
            }))
        }

        const list = data.sort((a, b) => a.remindAt - b.remindAt).map(r => ({
            remindAt: r.remindAt,
            reminder: `${r.reminder}\n[Jump to message](${r.msgURL})`
        }))

        await generateEmbed(message, list, {
            authorName: `You have ${pluralize('reminder', data.length)}`,
            authorIconURL: author.displayAvatarURL({ dynamic: true }),
            title: 'Reminder set for',
            keyTitle: { suffix: 'remindAt' },
            keys: ['reminder'],
            toUser: true,
            dmMsg: 'Check your DMs for the list of your reminders.'
        })
    }
}