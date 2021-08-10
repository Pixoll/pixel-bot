const { Command, CommandoMessage } = require('discord.js-commando')
const { generateEmbed, basicEmbed } = require('../../utils/functions')

module.exports = class invites extends Command {
    constructor(client) {
        super(client, {
            name: 'invites',
            group: 'misc',
            memberName: 'invites',
            description: 'Displays a list of all the invites of this server.',
            clientPermissions: ['MANAGE_GUILD', 'MANAGE_MESSAGES'],
            guildOnly: true
        })
    }

    onBlock() { return }
    onError() { return }

    /** @param {CommandoMessage} message */
    async run(message) {
        const { guild } = message

        // gets all the invites in the server
        const invites = await guild.fetchInvites()
        if (invites.size === 0) return message.say(basicEmbed('blue', 'info', 'There are no invites in this server.'))

        const invitesList = invites.map(({ uses, inviter, channel, url, code }) => ({
            uses: uses,
            inviter: inviter.tag,
            channel: channel.toString(),
            link: url,
            code: code
        })).sort((a, b) => b.uses - a.uses)

        generateEmbed(message, invitesList, {
            authorName: `${guild.name}'s invites`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            hasObjects: true,
            boldText: true,
            keyTitle: { name: 'link' },
            keysExclude: ['link']
        })
    }
}