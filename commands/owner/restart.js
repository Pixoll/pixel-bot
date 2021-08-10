const { Command, CommandoMessage } = require('discord.js-commando')
const { basicEmbed, sleep } = require('../../utils/functions')

module.exports = class restart extends Command {
    constructor(client) {
        super(client, {
            name: 'restart',
            group: 'owner',
            memberName: 'restart',
            description: 'Restarts the bot.',
            ownerOnly: true
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     */
    async run(message) {
        await message.say(basicEmbed('gold', 'loading', 'The bot will restart in 10 seconds...'))

        await sleep(10)

        process.exit(1)
    }
}