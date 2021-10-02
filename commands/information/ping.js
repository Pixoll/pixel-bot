const { oneLine } = require('common-tags')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')

/** A command that can be run in a client */
module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'info',
            description: 'Pong! 🏓',
            guarded: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const pingMsg = await message.reply('Pinging...')

        const roundtrip = pingMsg.createdTimestamp - message.createdTimestamp
        const heartbeat = Math.round(this.client.ws.ping || 0)

        await pingMsg.edit(oneLine`
			🏓 Pong! The message round-trip took ${roundtrip}ms.
			${heartbeat ? `The heartbeat ping is ${heartbeat}ms.` : ''}
		`)
    }
}