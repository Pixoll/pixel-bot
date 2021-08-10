const { Command, CommandoMessage } = require('discord.js-commando')
const { Role, GuildMember } = require('discord.js')
const { isMod, basicEmbed } = require('../../utils/functions')
const { stripIndent } = require('common-tags')

/**
 * gets all the roles separated by commas
 * @param {string} string the string containing the roles
 * @param {CommandoMessage} message the command message
 * @returns {Role[]}
 */
function getRoles(string, message) {
    const isOwner = message.guild.ownerID === message.author.id
    const highestMember = message.member.roles.highest.position
    const highestBot = message.guild.members.cache.get(message.client.user.id).roles.highest.position
    const array = string.toLowerCase().split(/\s*,\s*/)

    const rolesList = []
    for (const str of array) {
        const role = message.guild.roles.cache.get(str.replace(/[^0-9]/g, '')) || message.guild.roles.cache.find(({ name }) => name.toLowerCase() === str)
        if (role) rolesList.push(role)
    }

    /** @param {number} position */
    function filter(position) {
        if (isOwner) return position < highestBot
        return position < highestMember && position < highestBot
    }
    return rolesList.filter(({ position }) => filter(position))
}

module.exports = class role extends Command {
    constructor(client) {
        super(client, {
            name: 'role',
            group: 'mod',
            memberName: 'role',
            description: 'Add or remove roles from a member.',
            details: stripIndent
                `\`member\` can be a member's username, ID or mention.
                \`role\` can be a role's name, ID or mention.
                \`roles\` can be 1 or more roles separated by commas (with a max. of 30 different roles).
            `,
            format: stripIndent`
                role toggle [member] [roles] - Toggles the roles of a member.
                role removeall [member] - Removes the member's roles.
                role all [role] - Toggles a role on every member and bot.
                role bots [role] - Toggles a role on every bot.
                role members [role] - Toggles a role on every member.
            `,
            examples: ['role toggle Pixoll Developer, Moderator', 'role removeall Pixoll', 'role all Member', 'role bots Bots', 'role members Ping Role'],
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['toggle', 'removeall', 'all', 'bots', 'members']
                },
                {
                    key: 'roleMember',
                    prompt: 'What role do you want to toggle? or what member are you looking for?',
                    type: 'role|member'
                },
                {
                    key: 'roles',
                    prompt: 'What roles do you want to toggle for that member?',
                    type: 'string',
                    default: '',
                    /** @param {string} string @param {CommandoMessage} message */
                    parse: (string, message) => getRoles(string, message),
                    /** @param {string} string @param {CommandoMessage} message */
                    validate: (string, message) => {
                        const subCommand = message.parseArgs().split(/ +/).shift().toLowerCase()
                        if (subCommand !== 'toggle') return true
                        return getRoles(string, message).length >= 1
                    },
                    error: 'I couldn\'t find any of the roles you specified. Please make sure all of them are not bot roles, the role hierarchy and server ownership.'
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
    * @param {CommandoMessage} message The message
    * @param {object} args The arguments
    * @param {string} args.subCommand The sub-command
    * @param {Role|GuildMember} args.roleMember The role or member
    * @param {Role[]} args.roles The role or member
    */
    async run(message, { subCommand, roleMember, roles }) {
        const { member, guild } = message
        const botID = this.client.user.id
        const { position } = roleMember

        const isOwner = guild.ownerID === member.id
        const highestMember = member.roles.highest.position
        const highestBot = guild.members.cache.get(botID).roles.highest.position

        if (subCommand.toLowerCase() === 'toggle') {
            if (!roleMember.user) return message.say(basicEmbed('red', 'cross', 'That member does not exist.'))

            for (const role of roles) {
                if (roleMember.roles.cache.has(role.id)) await roleMember.roles.remove(role)
                else await roleMember.roles.add(role)
            }

            return message.say(basicEmbed('green', 'check', `Toggled the following roles for ${roleMember.user.tag}`, roles.map(({ name }) => name).join(', ')))
        }

        if (subCommand.toLowerCase() === 'removeall') {
            if (!roleMember.user) return message.say(basicEmbed('red', 'cross', 'That member does not exist.'))

            if (roleMember.roles.cache.size === 0) return message.say(basicEmbed('red', 'cross', 'That member has no roles.'))

            const memberRoles = roleMember.roles.cache.filter(({ managed }) => !managed)
            for (const [, role] of memberRoles) await roleMember.roles.remove(role)

            return message.say(basicEmbed('red', 'cross', `Removed every role from ${roleMember.user.tag}.`))
        }

        if (roleMember.user) return message.say(basicEmbed('red', 'cross', 'That role does not exist.'))

        if (isMod(roleMember) || roleMember.managed) return message.say(basicEmbed('red', 'cross', 'That role cannot be used in this sub-command.'))

        if (isOwner) {
            if (position >= highestBot) return message.say(basicEmbed('red', 'cross', 'The bot cannot assign this role to other members. Please check the role hierarchy or server ownership.'))
        }
        else if (position >= highestMember || position >= highestBot) return message.say(basicEmbed('red', 'cross', 'You or the bot cannot assign this role to other members. Please check the role hierarchy or server ownership.'))

        /**
         * filters the members depending on the sub-command used
         * @param {GuildMember} member the member to filter
         */
        function filterMembers(member) {
            if (subCommand.toLowerCase() === 'bots') return member.user.bot
            if (subCommand.toLowerCase() === 'members') return !member.user.bot
            return !!member
        }

        const members = message.guild.members.cache.filter(member => filterMembers(member))

        for (const [, member] of members) {
            if (member.roles.cache.has(roleMember.id)) await member.roles.remove(roleMember)
            else await member.roles.add(roleMember)
        }

        message.say(basicEmbed('green', 'check', `Toggled the \`${roleMember.name}\` for the members/bots.`))
    }
}