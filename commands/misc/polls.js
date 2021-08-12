const { Command, CommandoMessage } = require('discord.js-commando')
const { polls: pollsDocs } = require('../../utils/mongo/schemas')
const { generateEmbed, basicEmbed } = require('../../utils/functions')

module.exports = class polls extends Command {
    constructor(client) {
        super(client, {
            name: 'polls',
            group: 'misc',
            memberName: 'polls',
            description: 'Displays all the on-going polls on this server.',
            clientPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true,
            throttling: { usages: 1, duration: 3 }
        })
    }

    onBlock() { return }
    onError() { return }

    /** @param {CommandoMessage} message */
    async run(message) {
        const { guild } = message

        // tries to get all the active polls in the server
        const pollsData = await pollsDocs.find({ guild: message.guild.id })
        if (!pollsData || pollsData.length === 0) return message.say(basicEmbed('blue', 'info', 'There are no active polls.'))

        await generateEmbed(message, pollsData, {
            number: 5,
            authorName: `${guild.name}'s polls`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            title: 'Poll',
            keys: ['channel', 'duration', 'endsAt']
        })
    }
}