const { Command, CommandoMessage } = require('discord.js-commando')
const { MessageEmbed, Role } = require('discord.js')
const { getKeyPerms } = require('../../utils/functions')
const { stripIndent } = require('common-tags')

module.exports = class roleinfo extends Command {
    constructor(client) {
        super(client, {
            name: 'roleinfo',
            group: 'misc',
            memberName: 'roleinfo',
            description: 'Displays multiple information about a role, such as color, position, members and key permissions (if any).',
            details: '`role` can be either a role\'s name, mention or ID. It\'s not case sensitive.',
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

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {Role} args.role The role to get information about
     */
    run(message, { role }) {
        const { hexColor, id, name, hoist, position, mentionable, members, createdTimestamp } = role
        const color = hexColor === '#000000' ? '' : hexColor
        const permissions = getKeyPerms(role)

        const roleInfo = new MessageEmbed()
            .setColor(color || '#4c9f4c')
            .setThumbnail(`https://www.colorhexa.com/${color.replace('#', '')}.png`)
            .setTitle(`Information about the ${name} role`).
            setDescription(stripIndent`
                **>** **Mention:** \\${role.toString()}
                **>** **Color:** ${color || 'None'}
                **>** **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **>** **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **>** **Position:** ${position}
                **>** **Members:** ${members.size}
            `)
            .setFooter(`Role ID: ${id} | Role Created`)
            .setTimestamp(createdTimestamp)

        if (permissions !== 'None') roleInfo.addField('Key Permissions', permissions)

        message.say(roleInfo)
    }
}