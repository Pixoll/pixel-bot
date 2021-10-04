const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, sleep } = require('../../utils')

/** A command that can be run in a client */
module.exports = class CleanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'clean',
            group: 'owner',
            description: 'Delete a message in your DMs with the bot.',
            format: 'clean [msg]',
            examples: ['clean 12345678912345678'],
            ownerOnly: true,
            dmOnly: true,
            args: [{
                key: 'msg',
                prompt: 'What message do you want to delete?',
                type: 'message'
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {CommandoMessage} args.msg The message to delete
     */
    async run(message, { msg }) {
        if (!msg.author.bot) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That message was not sent by the bot.'
            }))
        }

        await msg.delete()
        const toDelete = await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: 'Message deleted.'
        }))
        await sleep(10)
        await toDelete.delete()
    }
}