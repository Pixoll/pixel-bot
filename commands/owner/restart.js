/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, confirmButtons } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class RestartCommand extends Command {
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
        const confirmed = await confirmButtons(message, 'restart the bot')
        if (!confirmed) return

        await message.replyEmbed(basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Restarting...'
        }))

        this.client.user.setPresence({
            activities: [{
                name: 'Restarting...',
                type: 'PLAYING'
            }]
        })

        process.exit()
    }
}