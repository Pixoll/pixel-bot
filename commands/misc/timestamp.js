/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { timestamp, basicEmbed, replyAll } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

const letters = ['t', 'T', 'd', 'D', 'f', 'F', 'R']

/** A command that can be run in a client */
module.exports = class TimestampCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'timestamp',
            aliases: ['tstamp'],
            group: 'misc',
            description: 'date the Discord timestamp of any time you want.',
            details: '`duration` uses the bot\'s time formatting, for more information use the `help` command.',
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
            }],
            slash: {
                options: [{
                    type: 'string',
                    name: 'date',
                    description: 'The date for the timestamp.'
                }]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {number|Date} args.date The date for the timestamp
     */
    async run({ message, interaction }, { date }) {
        if (interaction) {
            const arg = this.argsCollector.args[0]
            date = await arg.parse(date ?? 'now').catch(() => null) || null
            if (!date) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'The date you specified is invalid.'
                }))
            }
        }

        if (typeof date === 'number') date += Date.now()
        if (date instanceof Date) date = date.getTime()

        const timestamps = []
        for (const letter of letters) {
            const string = timestamp(date, letter)
            timestamps.push(`\`${string}\` ${string}`)
        }

        await replyAll({ message, interaction }, timestamps.join('\n'))
    }
}
