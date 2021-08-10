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
            guildOnly: true,
            args: [{
                key: 'user',
                prompt: 'What is the user you want to check a ban for?',
                type: 'string',
                default: ''
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {string} args.user The user to look a ban for
     */
    async run(message, { user }) {
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

        if (user) {
            const matches = bansList.filter(({ tag, id }) => tag.toLowerCase().includes(user.toLowerCase()) || id === user).slice(0, 30)
            if (matches.length === 0) return message.say(basicEmbed('red', 'cross', 'That user does not exist or is not banned.'))
            if (matches.length > 1) return message.say(basicEmbed('red', 'cross', `Multiple ban cases found, please be more specific:`, matches.map(({ tag }) => `"${tag}"`).join(', ')))

            const banCase = matches.shift()

            const banEmbed = new MessageEmbed()
                .setColor('#4c9f4c')
                .setAuthor(`${guild.name}'s bans`, guild.iconURL({ dynamic: true }))
                .addField(`Ban for ${banCase.tag}`, `**Reason:** ${banCase.reason}`)
                .setFooter(`User ID: ${banCase.id}`)
                .setTimestamp()

            return message.say(banEmbed)
        }

        // creates and sends a paged embed with the bans
        generateEmbed(message, bansList, {
            authorName: `${guild.name}'s bans`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            title: 'Ban for',
            boldText: true,
            hasObjects: true,
            keyTitle: { name: 'tag' },
            keysExclude: ['tag', 'id']
        })
    }
}