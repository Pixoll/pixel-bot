const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { reminders } = require('../../mongo/schemas')
const { basicEmbed, customEmoji, timestamp, timeDetails } = require('../../utils')
const { ReminderSchema } = require('../../mongo/typings')

/** A command that can be run in a client */
module.exports = class ReminderCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reminder',
            aliases: ['remindme', 'remind'],
            group: 'misc',
            description: 'Set a reminder, and forget.',
            details: timeDetails('time'),
            format: 'reminder [time] [reminder]',
            examples: [
                'reminder 02/02/2022-21:58 Pixoll\'s b-day!',
                'remind 1d Do some coding'
            ],
            throttling: { usages: 1, duration: 3 },
            guarded: true,
            args: [
                {
                    key: 'time',
                    prompt: 'When would you like to be reminded?',
                    type: ['date', 'duration']
                },
                {
                    key: 'reminder',
                    prompt: 'What do you want to be reminded about?',
                    type: 'string',
                    max: 512
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {number|Date} args.time The time when the user should be reminder
     * @param {string} args.reminder What to remind the user about
     */
    async run(message, { time, reminder }) {
        if (typeof time === 'number') time = time + Date.now()
        if (time instanceof Date) time = time.getTime()

        const { author, id, channelId } = message
        const stamp = timestamp(time, 'R')

        /** @type {ReminderSchema} */
        const doc = {
            user: author.id,
            reminder,
            remindAt: time,
            message: id,
            channel: channelId
        }

        await new reminders(doc).save()

        await message.react(customEmoji('cross'))
        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            fieldName: `I'll remind you ${stamp} for:`, fieldValue: reminder,
            footer: 'React with ❌ to cancel the reminder.'
        }))
    }
}