const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { GuildMember } = require('discord.js')
const { generateEmbed, basicEmbed, pluralize, memberDetails } = require('../../utils')

/** A command that can be run in a client */
module.exports = class RolesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roles',
            group: 'misc',
            description: 'Displays a list of roles in the server, or the roles of a specific member.',
            details: memberDetails(),
            format: 'roles <member>',
            examples: ['roles Pixoll'],
            clientPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true,
            args: [{
                key: 'member',
                prompt: 'What member do you want to get the roles from?',
                type: 'member',
                required: false
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to get the roles from
     */
    async run(message, { member }) {
        const { guild, guildId } = message

        const memberRoles = member?.roles.cache.filter(role => role.id !== guildId)
        const guildRoles = !memberRoles ? await guild.roles.fetch() : null

        const rolesCache = memberRoles || guildRoles.filter(role => role.id !== guildId)
        if (!rolesCache) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'I couldn\'t find any roles..'
            }))
        }

        const name = member?.user.username || guild.name
        const avatar = member?.user.displayAvatarURL({ dynamic: true }) || guild.iconURL({ dynamic: true })

        const roles = !!rolesCache?.size ?
            rolesCache.sort((a, b) => b.position - a.position).map(r => `${r.toString()} ${r.name}`) :
            'This member has no roles.'

        if (typeof roles == 'string') {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: roles
            }))
        }

        await generateEmbed(message, roles, {
            number: 20,
            authorName: `${name} has ${pluralize('role', roles.length)}`,
            authorIconURL: avatar,
            useDescription: true
        })
    }
}