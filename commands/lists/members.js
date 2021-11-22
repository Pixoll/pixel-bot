/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { Role } = require('discord.js')
const { generateEmbed, basicEmbed, pluralize, roleDetails, abcOrder } = require('../../utils')
/* eslint-enable no-unused-vars */

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
            }],
            slash: {
                options: [{
                    type: 'role',
                    name: 'role',
                    description: 'The role to get the members from.',
                    required: true
                }]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {Role} args.role The role to get the members from
     */
    async run({ message, interaction }, { role }) {
        const members = role.members.sort((a, b) => abcOrder(a.user.tag, b.user.tag))
            .map(m => `${m.toString()} ${m.user.tag}`)

        if (members.length === 0) {
            const embed = basicEmbed({
                color: 'BLUE', emoji: 'info', description: `The \`${role.name}\` role has no members.`
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        const { guild } = message || interaction
        await generateEmbed({ message, interaction }, members, {
            number: 20,
            authorName: `There's ${pluralize('member', members.length)} in ${role.name}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            useDescription: true
        })
    }
}