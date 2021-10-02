const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, sleep } = require('../../utils')

/** A command that can be run in a client */
module.exports = class restartCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'restart',
            group: 'owner',
            description: 'Restarts the bot.',
            ownerOnly: true,
            guarded: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        await message.reply(basicEmbed('gold', 'loading', 'The bot will restart in 10 seconds...'))

        await sleep(10)

        process.exit(1)
    }
}