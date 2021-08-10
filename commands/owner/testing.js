const { Command, CommandoMessage } = require('discord.js-commando')
const { ms, Duration, toNow } = require('../../utils/custom-ms')
const { formatDate } = require('../../utils/functions')

module.exports = class test extends Command {
    constructor(client) {
        super(client, {
            name: 'test',
            group: 'owner',
            memberName: 'test',
            description: 'Testing command.',
            ownerOnly: true,
            args: [{
                key: 'argument',
                prompt: 'The argument.',
                type: 'string'
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {string|number} args.argument The argument
     */
    async run(message, { argument }) {
        const isNumber = !!Number(argument) || Number(argument) === 0
        const string = isNumber ? ms(Number(argument)) : argument

        const date = new Duration(string).fromNow
        const offset = toNow(date, true)

        message.say(`${string}\n${formatDate(date)}\n${offset}`)
    }
}