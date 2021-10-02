const { stripIndent } = require('common-tags')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { get } = require('lodash')

/** A command that can be run in a client */
module.exports = class msginfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'msginfo',
            group: 'owner',
            description: 'Gets info from a message.',
            format: 'msginfo [message Id]',
            ownerOnly: true,
            args: [
                {
                    key: 'msg',
                    prompt: 'What is the Id of the message?',
                    type: 'message'
                },
                {
                    key: 'property',
                    prompt: 'What property do you want to get?',
                    type: 'string',
                    required: false
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {CommandoMessage} args.msg The message to get info from
     * @param {string} args.property The property of The message the command is being run for
     */
    async run(message, { msg, property }) {
        const thing = property ? get(msg, property) : msg

        await message.author.send(stripIndent`
            **Message:** ${msg.url}
            **Type:** ${typeof thing}
        `)

        const response = `${typeof thing === 'object' ? JSON.stringify(thing, null, 4) : thing}`
        const dots = response.length > 1987 ? '\n...' : ''

        await message.author.send(`\`\`\`js\n${response.substr(0, 1987)}${dots}\`\`\``)
    }
}