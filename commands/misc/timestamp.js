/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { noReplyInDMs, timeDetails, timestamp, basicEmbed } = require('../../utils')
/* eslint-enable no-unused-vars */

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
                return await interaction.editReply({
                    embeds: [basicEmbed({
                        color: 'RED', emoji: 'cross', description: 'The date you specified is not valid.'
                    })]
                })
            }
        }

        if (typeof date === 'number') date += Date.now()
        if (date instanceof Date) date = date.getTime()

        const timestamps = []
        for (const letter of letters) {
            const string = timestamp(date, letter)
            timestamps.push(`\`${string}\` ${string}`)
        }

        const options = { content: timestamps.join('\n'), ...noReplyInDMs(message) }
        await interaction?.editReply(options)
        await message?.reply(options)
    }
}