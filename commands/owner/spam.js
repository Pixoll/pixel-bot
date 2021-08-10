const { Command, CommandoMessage } = require('discord.js-commando')

module.exports = class spam extends Command {
    constructor(client) {
        super(client, {
            name: 'spam',
            group: 'owner',
            memberName: 'spam',
            description: 'Spams a channel with messages.',
            format: 'spam [number]',
            ownerOnly: true,
            args: [{
                key: 'number',
                prompt: 'How many messages should the bot spam?',
                type: 'integer'
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {number} args.number The amount of times the message sould be spammed
     */
    async run(message, { number }) {
        for (var i = 0; i < number; i++) {
            await message.say('spam')
        }
        message.reply('finished.')
    }
}