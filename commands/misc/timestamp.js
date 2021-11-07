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
            details: timeDetails('time'),
            args: [{
                key: 'time',
                prompt: 'What time should the timestamp have?',
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
     * @param {number|Date} args.time The time when the user should be reminder
     */
    async run(message, { time }) {
        if (typeof time === 'number') time += Date.now()
        if (time instanceof Date) time = time.getTime()

        const timestamps = []
        for (const letter of letters) {
            const string = timestamp(time, letter)
            timestamps.push(`\`${string}\` ${string}`)
        }

        await message.reply({ content: timestamps.join('\n'), ...noReplyInDMs(message) })
    }
}