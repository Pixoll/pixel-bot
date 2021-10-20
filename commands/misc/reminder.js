const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, customEmoji, timestamp, timeDetails } = require('../../utils')

/** A command that can be run in a client */
module.exports = class ReminderCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reminder',
            aliases: ['remindme', 'remind'],
            group: 'misc',
            description: 'Set a reminder, and forget.',
            details: timeDetails('time') + '\nIf `reminder` is not specified, it will default to "Not specified".',
            format: 'reminder [time] <reminder>',
            examples: [
                'reminder 02/02/2022 Pixoll\'s b-day!',
                'remindme 1d Do some coding',
                'remind 2w',
            ],
            throttling: { usages: 1, duration: 3 },
            guarded: true,
            args: [
                {
                    key: 'time',
                    prompt: 'When would you like to be reminded?',
                    type: ['duration', 'date']
                },
                {
                    key: 'reminder',
                    prompt: 'What do you want to be reminded about?',
                    type: 'string',
                    max: 512,
                    default: '`Not specified`'
                }
            ]
        })

        this.db = this.client.database.reminders
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

        const { author, id, channelId, url } = message
        const stamp = timestamp(time, 'R')

        await this.db.add({
            user: author.id,
            reminder,
            remindAt: time,
            message: id,
            msgURL: url,
            channel: channelId,
        })

        await message.react(customEmoji('cross'))
        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            fieldName: `I'll remind you ${stamp} for:`, fieldValue: reminder,
            footer: 'React with ❌ to cancel the reminder.'
        }))
    }
}