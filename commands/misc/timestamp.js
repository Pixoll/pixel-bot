const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { noReplyInDMs, timeDetails } = require('../../utils')

const formatters = new Map([
    ['Short time', 't'],
    ['Long time', 'T'],
    ['Short date', 'd'],
    ['Long date', 'D'],
    ['Short date/time', 'f'],
    ['Long date/time', 'F'],
    ['Relative time', 'R'],
])

/** A command that can be run in a client */
module.exports = class TimestampCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'timestamp',
            group: 'misc',
            description: 'Get the Discord timestamp of any time you want.',
            details: timeDetails('time'),
            args: [{
                key: 'time',
                prompt: 'What time should the timestamp have?',
                type: ['date', 'duration']
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {number|Date} args.time The time when the user should be reminder
     */
    async run(message, { time }) {
        if (typeof time === 'number') time = time + Date.now()
        if (time instanceof Date) time = time.getTime()

        const epoch = Math.round(time / 1000)

        const timestamps = []
        for (const [type, letter] of formatters) {
            const string = `<t:${epoch}:${letter}>`
            timestamps.push(`**${type}:** \`${string}\` (${string})`)
        }

        await message.reply({ content: timestamps.join('\n'), ...noReplyInDMs(message) })
    }
}