const { Command, CommandoMessage } = require('discord.js-commando')
const { basicEmbed } = require('../../utils/functions')

module.exports = class clean extends Command {
    constructor(client) {
        super(client, {
            name: 'clean',
            group: 'owner',
            memberName: 'clean',
            description: 'Delete a message in your DMs with the bot.',
            format: 'clean [msg]',
            examples: ['clean 12345678912345678'],
            ownerOnly: true,
            args: [{
                key: 'msg',
                prompt: 'What message do you want to delete?',
                type: 'message'
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {CommandoMessage} args.msg The message to delete
     */
    async run(message, { msg }) {
        if (!msg.author.bot) return await message.say(basicEmbed('red', 'cross', 'That message was not sent by the bot.'))

        await msg.delete()
        await message.say(basicEmbed('green', 'check', 'Message deleted.')).then(msg =>
            msg.delete({ timeout: 5 * 1000 }).catch(() => null)
        )
    }
}