const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { MessageEmbed, Role } = require('discord.js')
const { getKeyPerms, roleDetails } = require('../../utils')
const { stripIndent } = require('common-tags')

/** A command that can be run in a client */
module.exports = class RoleInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roleinfo',
            aliases: ['role-info'],
            group: 'misc',
            description:
                'Displays multiple information about a role, such as color, position, members and key permissions (if any).'
            ,
            details: roleDetails(),
            format: 'roleinfo [role]',
            examples: ['roleinfo Staff'],
            guildOnly: true,
            args: [{
                key: 'role',
                prompt: 'What role do you want to get information from?',
                type: 'role'
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {Role} args.role The role to get information about
     */
    async run(message, { role }) {
        const { hexColor, id, name, hoist, position, mentionable, members, createdTimestamp } = role
        const color = hexColor === '#000000' ? null : hexColor
        const permissions = getKeyPerms(role)

        const roleInfo = new MessageEmbed()
            .setColor(color || '#4c9f4c')
            .setThumbnail(`https://www.colorhexa.com/${(color || '#4c9f4c').replace('#', '')}.png`)
            .setAuthor(`Information for role: ${name}`).
            setDescription(stripIndent`
                **>** **Mention:** \`${role.toString()}\`
                **>** **Color:** ${color || 'None'}
                **>** **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **>** **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **>** **Position:** ${position}
                **>** **Members:** ${members.size}
            `)
            .setFooter(`Role id: ${id} | Created at`)
            .setTimestamp(createdTimestamp)

        if (permissions !== 'None') roleInfo.addField('Key Permissions', permissions)

        await message.replyEmbed(roleInfo)
    }
}