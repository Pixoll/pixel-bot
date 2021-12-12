/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { Command } = require('../../command-handler')
const { CommandInstances, CommandoMessage } = require('../../command-handler/typings')
const { get } = require('lodash')
const { sliceDots, code } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class MsgInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'msginfo',
            group: 'owner',
            description: 'Gets info from a message.',
            format: 'msginfo [message id]',
            ownerOnly: true,
            args: [
                {
                    key: 'msg',
                    prompt: 'What is the id of the message?',
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
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {CommandoMessage} args.msg The message to get info from
     * @param {string} args.property The property of The message the command is being run for
     */
    async run({ message }, { msg, property }) {
        const thing = property ? get(msg, property) : msg

        await message.direct(stripIndent`
            **Message:** ${msg.url}
            **Type:** ${typeof thing}
        `)

        const response = `${typeof thing === 'object' ? JSON.stringify(thing, null, 4) : thing}`
        const string = sliceDots(response, 1950)

        await message.direct(code(string, 'js'))
    }
}
