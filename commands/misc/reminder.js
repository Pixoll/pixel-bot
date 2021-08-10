const { Command, CommandoMessage } = require('discord.js-commando')
const { Duration, toNow } = require('../../utils/custom-ms')
const { basicEmbed, formatTime, customEmoji } = require('../../utils/functions')
const { reminders } = require('../../utils/mongodb-schemas')
const { stripIndent } = require('common-tags')

module.exports = class reminder extends Command {
    constructor(client) {
        super(client, {
            name: 'reminder',
            aliases: ['remindme', 'remind'],
            group: 'misc',
            memberName: 'reminder',
            description: 'Set a reminder.',
            details: stripIndent`
                \`time\` uses the command time formatting, for more information use the \`help\` command.
                \`reminder\` is the reminder that I have to send you after the \`time\` you specified, it can be anything you want.`,
            format: 'reminder [time] [reminder]',
            examples: ['reminder 1d Do some coding'],
            throttling: { usages: 1, duration: 3 },
            args: [
                {
                    key: 'time',
                    prompt: 'In how much time would you like to be reminded?',
                    type: 'string',
                    /** @param {string|number} time */
                    parse: (time) => formatTime(time),
                    /** @param {string|number} time */
                    validate: (time) => !!formatTime(time),
                    error: 'You didn\'t use the correct format. Please try again.'
                },
                {
                    key: 'remindAbout',
                    prompt: 'What do you want to be reminded about?',
                    type: 'string',
                    max: 512
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {number} args.time The time when the user should be reminder
     * @param {string} args.remindAbout What to remind the user about
     */
    async run(message, { time, remindAbout }) {
        const date = new Duration(time)
        const remindIn = toNow(date.fromNow, true)
        const remindAt = date.format.replace(' ', ' at ')

        await message.react(customEmoji('cross', false))

        await message.say(basicEmbed('green', 'check', `I'll remind you ${remindIn} (on ${remindAt})`, remindAbout))

        // creates and saves the new reminder
        const doc = {
            user: message.author.id,
            reminder: remindAbout,
            remindAt: Date.now() + time,
            link: message.url,
            message: message.id,
            channel: message.channel.id
        }

        await new reminders(doc).save()
    }
}