const { stripIndent } = require('common-tags')
const { User, MessageEmbed } = require('discord.js')
const { Command, CommandoMessage } = require('discord.js-commando')
const { basicEmbed, generateEmbed } = require('../../utils/functions')

module.exports = class bans extends Command {
    constructor(client) {
        super(client, {
            name: 'bans',
            group: 'mod',
            memberName: 'bans',
            description: 'Displays all the bans of this server, or look for a specific ban.',
            format: stripIndent`
                bans - Display all bans.
                bans <user> - Find a single ban.
            `,
            clientPermissions: ['BAN_MEMBERS', 'MANAGE_MESSAGES'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     */
    async run(message) {
        const { guild } = message

        // gets all the bans in the server
        const bans = await guild.fetchBans()
        if (!bans || bans.size === 0) return message.say(basicEmbed('blue', 'info', 'There are no bans in this server.'))

        const bansList = bans.map(({ user, reason }) => ({
            tag: user.tag,
            id: user.id,
            'User ID': user.id,
            reason: reason?.replace(/%20/g, ' ') || 'No reason given.'
        })).sort((a, b) => {
            var tagA = a.tag.toUpperCase()
            var tagB = b.tag.toUpperCase()

            if (tagA < tagB) return -1
            if (tagA > tagB) return 1
            return 0
        })

        // creates and sends a paged embed with the bans
        await generateEmbed(message, bansList, {
            authorName: `${guild.name}'s bans`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            title: 'Ban for',
            boldText: true,
            hasObjects: true,
            keyTitle: { suffix: 'tag' },
            keysExclude: ['tag', 'id']
        })
    }
}