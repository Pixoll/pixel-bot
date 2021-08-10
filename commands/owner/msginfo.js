const { stripIndent } = require('common-tags')
const { Command, CommandoMessage } = require('discord.js-commando')
const { get } = require('lodash')

module.exports = class msginfo extends Command {
    constructor(client) {
        super(client, {
            name: 'msginfo',
            group: 'owner',
            memberName: 'msginfo',
            description: 'Gets info from a message.',
            format: 'msginfo [message ID]',
            ownerOnly: true,
            args: [
                {
                    key: 'msg',
                    prompt: 'What is the ID of the message?',
                    type: 'message'
                },
                {
                    key: 'property',
                    prompt: 'What property do you want to get?',
                    type: 'string',
                    default: ''
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {CommandoMessage} args.msg The message to get info from
     * @param {string} args.property The property of the message
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