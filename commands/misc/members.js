const { Command, CommandoMessage } = require('discord.js-commando')
const { Role } = require('discord.js')
const { generateEmbed, basicEmbed } = require('../../utils/functions')

module.exports = class members extends Command {
    constructor(client) {
        super(client, {
            name: 'members',
            group: 'misc',
            memberName: 'members',
            description: 'Displays a list of members in a role.',
            details: '`role` can be either a role\'s name, mention or ID. It\'s not case sensitive.',
            format: 'members [role]',
            examples: ['members Staff'],
            args: [{
                key: 'role',
                prompt: 'The role you want to get the members from.',
                type: 'role'
            }],
            guildOnly: true
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {Role} args.role The role to get the members from
     */
    async run(message, { role }) {
        if (!role) return message.say(basicEmbed('red', 'cross', 'That role does not exist.'))

        // gets the members in the role
        const memebrs = role.members.map(member => member)

        generateEmbed(message, memebrs, {
            number: 20,
            authorName: `Members in ${role.name}`,
            authorIconURL: message.guild.iconURL({ dynamic: true }),
            useDescription: true
        })
    }
}