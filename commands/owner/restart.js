const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, sleep } = require('../../utils')

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
        let count = 10
        const toEdit = await message.replyEmbed(basicEmbed({
            color: 'GOLD', emoji: 'loading', description: `The bot will restart in ${count--} seconds...`
        }))
        await sleep(1)

        while (count > 0) {
            await toEdit.edit({
                embeds: [basicEmbed({
                    color: 'GOLD', emoji: 'loading', description: `The bot will restart in ${count--} seconds...`
                })]
            })
            await sleep(1)
        }

        await toEdit.edit({
            embeds: [basicEmbed({
                color: 'GOLD', emoji: 'loading', description: 'Restarting...'
            })]
        })

        this.client.user.setPresence({
            activities: [{
                name: 'Restarting...',
                type: 'PLAYING'
            }]
        })

        process.exit()
    }
}