const { Command, CommandoMessage } = require('discord.js-commando')
const { generateEmbed } = require('../../utils/functions')

module.exports = class botlist extends Command {
    constructor(client) {
        super(client, {
            name: 'botlist',
            aliases: ['bots'],
            group: 'misc',
            memberName: 'botlist',
            description: 'Displays the bot list of this server.',
            guildOnly: true
        })
    }

    onBlock() { return }
    onError() { return }

    /** @param {CommandoMessage} message */
    async run(message) {
        // gets a list of the bots in the server
        const botList = message.guild.members.cache.filter(({ user: { bot } }) => bot).map(bot => bot)

        await generateEmbed(message, botList, {
            number: 20,
            color: 'random',
            authorName: 'Bot list',
            useDescription: true
        })
    }
}