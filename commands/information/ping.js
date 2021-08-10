const { Command, CommandoMessage } = require('discord.js-commando')

module.exports = class ping extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'info',
            memberName: 'ping',
            description: 'Pong! 🏓',
            guarded: true
        })
    }

    onBlock() { return }
    onError() { return }

    /**
    * @param {CommandoMessage} message The message
    */
    run(message) {
        message.say('Pong! 🏓')
    }
}