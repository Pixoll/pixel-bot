/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { MessageEmbed, Role } = require('discord.js')
const { getKeyPerms, roleDetails } = require('../../utils')
const { stripIndent, oneLine } = require('common-tags')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class RoleInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'role-info',
            aliases: ['roleinfo'],
            group: 'misc',
            description: oneLine`
                Displays multiple information about a role, such as color, position, members and mod permissions.
            `,
            details: roleDetails(),
            format: 'roleinfo [role]',
            examples: ['roleinfo Staff'],
            guildOnly: true,
            args: [{
                key: 'role',
                prompt: 'What role do you want to get information from?',
                type: 'role'
            }],
            slash: {
                options: [{
                    type: 'role',
                    name: 'role',
                    description: 'The role to get info from.',
                    required: true
                }]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {Role} args.role The role to get information about
     */
    async run({ message, interaction }, { role }) {
        if (interaction) {
            role = interaction.options.getRole('role')
        }

        const { hexColor, id, name, hoist, position, mentionable, members, createdTimestamp, unicodeEmoji } = role
        const color = hexColor === '#000000' ? null : hexColor
        const colorURL = color ? `https://www.colorhexa.com/${color.replace('#', '')}.png` : null
        const url = role.iconURL({ size: 2048 }) || colorURL
        const permissions = getKeyPerms(role)

        const roleInfo = new MessageEmbed()
            .setColor(color || '#4c9f4c')
            .setAuthor(`Information for role: ${name}`)
            .setDescription(stripIndent`
                **Mention:** \`${role.toString()}\`
                **Color:** ${color ? `[${color}](${colorURL})` : 'None'}
                **Emoji:** ${unicodeEmoji || 'None'}
                **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **Position:** ${position}
                **Members:** ${members.size}
            `)
            .setFooter(`Role id: ${id} | Created at`)
            .setTimestamp(createdTimestamp)

        if (url) roleInfo.setThumbnail(url)

        if (permissions !== 'None') roleInfo.addField('Mod permissions', permissions)

        await interaction?.editReply({ embeds: [roleInfo] })
        await message?.replyEmbed(roleInfo)
    }
}