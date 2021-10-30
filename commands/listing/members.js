const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { Role } = require('discord.js')
const { generateEmbed, basicEmbed, pluralize, roleDetails, abcOrder } = require('../../utils')

/** A command that can be run in a client */
module.exports = class MembersCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'members',
            group: 'lists',
            description: 'Displays a list of members in a role.',
            details: roleDetails(),
            format: 'members [role]',
            examples: ['members Staff'],
            guildOnly: true,
            args: [{
                key: 'role',
                prompt: 'What role do you want to get the members from?',
                type: 'role'
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {Role} args.role The role to get the members from
     */
    async run(message, { role }) {
        const members = role.members.sort((a, b) => abcOrder(a.user.tag, b.user.tag))
            .map(m => `${m.toString()} ${m.user.tag}`)

        if (members.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: `The \`${role.name}\` role has no members.`
            }))
        }

        await generateEmbed(message, members, {
            number: 20,
            authorName: `There's ${pluralize('member', members.length)} in ${role.name}`,
            authorIconURL: message.guild.iconURL({ dynamic: true }),
            useDescription: true
        })
    }
}