const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, generateEmbed } = require('../../utils')

/** A command that can be run in a client */
module.exports = class guildsCommand extends Command {
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
        // gets all the guilds the bot's in
        const guilds = this.client.guilds.cache
        if (!guilds || guilds.size === 0) return message.reply(basicEmbed('blue', 'info', 'There bot is not in any server.'))

        const guildsList = guilds.map(({ name, id, owner }) => ({
            name: name,
            'Guild Id': id,
            owner: owner.user.toString(),
            'Owner Id': owner.id
        }))

        // creates and sends a paged embed with the bans
        await generateEmbed(message, guildsList, {
            number: 6,
            authorName: `${this.client.user.username}'s guilds`,
            authorIconURL: this.client.user.displayAvatarURL({ dynamic: true }),
            title: 'Name:',
            keyTitle: { suffix: 'name' },
            keysExclude: ['name']
        })
    }
}