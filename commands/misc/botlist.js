const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { generateEmbed, pluralize } = require('../../utils')
const { GuildMember, Collection } = require('discord.js')

/** A command that can be run in a client */
module.exports = class BotListCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'botlist',
            aliases: ['bots'],
            group: 'misc',
            description: 'Displays the bot list of the server.',
            guildOnly: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        /** @type {Collection<string, GuildMember>} */
        const members = await message.guild.members.fetch().catch(() => null)
        const botList = members.filter(m => m.user.bot)
            .map(bot => `${bot.toString()} ${bot.user.tag}`)

        await generateEmbed(message, botList, {
            number: 20,
            authorName: `There's ${pluralize('bot', botList.length)}`,
            useDescription: true
        })
    }
}