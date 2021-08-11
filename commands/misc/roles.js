const { stripIndent } = require('common-tags')
const { GuildMember } = require('discord.js')
const { Command, CommandoMessage } = require('discord.js-commando')
const { generateEmbed } = require('../../utils/functions')

module.exports = class roles extends Command {
    constructor(client) {
        super(client, {
            name: 'roles',
            group: 'misc',
            memberName: 'roles',
            description: 'Displays a list of roles in the server, or the roles of a specific member.',
            details: stripIndent`
                If \`member\` is not specified, it will display the server roles.
                \`member\` can be a member's username, ID or mention.
            `,
            format: 'roles <member>',
            examples: ['roles Pixoll'],
            clientPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true,
            args: [{
                key: 'member',
                prompt: 'What member do you want to get the roles from?',
                type: 'member',
                default: ''
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {GuildMember} args.member The member to get the roles from
     */
     async run(message, { member }) {
        const { guild } = message
        const rolesCache = member.roles?.cache.filter(({ id }) => id !== message.guild.id) || guild.roles.cache.filter(({ id }) => id !== message.guild.id)
        const name = member.user?.username || guild.name
        const avatar = member.user?.displayAvatarURL({ dynamic: true }) || guild.iconURL({ dynamic: true })

        const roles = !!rolesCache.size ? rolesCache.map(role => role).sort((a, b) => b.position - a.position) : ['This member has no roles.']

        await generateEmbed(message, roles, {
            number: 20,
            authorName: `${name}'s roles`,
            authorIconURL: avatar,
            useDescription: true
        })
    }
}