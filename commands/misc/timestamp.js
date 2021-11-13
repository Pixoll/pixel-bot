const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { noReplyInDMs, timeDetails, timestamp } = require('../../utils')

const letters = ['t', 'T', 'd', 'D', 'f', 'F', 'R']

/** A command that can be run in a client */
module.exports = class TimestampCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'timestamp',
            aliases: ['tstamp'],
            group: 'misc',
            description: 'Get the Discord timestamp of any time you want.',
            details: timeDetails('date'),
            format: 'timestamp <date>',
            examples: [
                'timestamp 3pm',
                'timestamp 22/10/2021',
                'timestamp 24/12/2022 23:59',
                'timestamp 2/2 10pm -3'
            ],
            args: [{
                key: 'date',
                prompt: 'What date should the timestamp have?',
                type: ['date', 'duration'],
                skipValidation: true,
                default: 0
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {number|Date} args.date The date for the timestamp
     */
    async run(message, { date }) {
        if (typeof date === 'number') date += Date.now()
        if (date instanceof Date) date = date.getTime()

        const timestamps = []
        for (const letter of letters) {
            const string = timestamp(date, letter)
            timestamps.push(`\`${string}\` ${string}`)
        }

        await message.reply({ content: timestamps.join('\n'), ...noReplyInDMs(message) })
    }
}