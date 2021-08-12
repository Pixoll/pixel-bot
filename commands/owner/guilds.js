const { Command, CommandoMessage } = require('discord.js-commando')
const { basicEmbed, generateEmbed } = require('../../utils/functions')

module.exports = class guilds extends Command {
    constructor(client) {
        super(client, {
            name: 'guilds',
            group: 'owner',
            memberName: 'guilds',
            description: 'Displays all the guilds the bot\'s in.',
            ownerOnly: true
        })
    }

    onBlock() { return }
    onError() { return }

    /** @param {CommandoMessage} message */
    async run(message) {
        if (message.channel.type !== 'dm') return message.say(basicEmbed('red', 'cross', 'This command can only be used in DMs.'))

        // gets all the guilds the bot's in
        const guilds = this.client.guilds.cache
        if (!guilds || guilds.size === 0) return message.say(basicEmbed('blue', 'info', 'There bot is not in any server.'))

        const guildsList = guilds.map(({ name, id, owner }) => ({
            name: name,
            'Guild ID': id,
            owner: owner.user.toString(),
            'Owner ID': owner.id
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