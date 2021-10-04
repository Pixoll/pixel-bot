const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, generateEmbed } = require('../../utils')

/** A command that can be run in a client */
module.exports = class GuildsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'guilds',
            group: 'owner',
            description: 'Displays all the guilds the bot\'s in.',
            ownerOnly: true,
            dmOnly: true,
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const guilds = this.client.guilds.cache
        if (!guilds || guilds.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There bot is not in any server.'
            }))
        }

        const guildsList = guilds.map(g => ({
            name: g.name,
            'Guild id': g.id,
            owner: g.ownerId,
        }))

        // creates and sends a paged embed with the bans
        await generateEmbed(message, guildsList, {
            authorName: `${this.client.user.username}'s guilds`,
            authorIconURL: this.client.user.displayAvatarURL({ dynamic: true }),
            keyTitle: { suffix: 'name' }
        })
    }
}