const { Command, CommandoMessage } = require('discord.js-commando')
const { rules: rulesDocs } = require('../../utils/mongodb-schemas')
const { generateEmbed, basicEmbed } = require('../../utils/functions')

module.exports = class rules extends Command {
    constructor(client) {
        super(client, {
            name: 'rules',
            group: 'misc',
            memberName: 'rules',
            description: 'Displays all the rules of this server.',
            clientPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true,
            throttling: { usages: 1, duration: 3 }
        })
    }

    onBlock() { return }
    onError() { return }

    /** @param {CommandoMessage} message */
    async run(message) {
        // tries to get the saved rules for the server
        const rulesData = await rulesDocs.findOne({ guild: message.guild.id })
        const rules = rulesData ? Array(...rulesData.rules) : undefined

        if (!rules || rules.length === 0) return message.say(basicEmbed('blue', 'info', 'The are no saved rules for this server.'))

        // creates and sends the paged embed containing the rules
        generateEmbed(message, rules, {
            number: 5,
            authorName: `${message.guild.name}'s rules`,
            authorIconURL: message.guild.iconURL({ dynamic: true }),
            title: 'Rule'
        })
    }
}