const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { reminders } = require('../../mongo/schemas')
const { generateEmbed, basicEmbed, pluralize } = require('../../utils')

/** A command that can be run in a client */
module.exports = class RemindersCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reminders',
            group: 'misc',
            description: 'Displays a list of all your active reminders.',
            clientPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 }
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const { author } = message

        const data = await reminders.find({ user: author.id })
        if (data.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'You have no active reminders.'
            }))
        }

        await generateEmbed(message, data, {
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