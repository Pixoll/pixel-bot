const { Command, CommandoMessage } = require('discord.js-commando')
const { Role, GuildMember } = require('discord.js')
const { ms } = require('../../utils/custom-ms')
const { active } = require('../../utils/mongo/schemas')
const { basicEmbed, docID, isMod } = require('../../utils/functions')
const { stripIndent } = require('common-tags')

module.exports = class temprole extends Command {
    constructor(client) {
        super(client, {
            name: 'temprole',
            group: 'mod',
            memberName: 'temprole',
            description: 'Assign a role that persists for a limited time.',
            details: '`member` can be a member\'s username, ID or mention.\n`time` uses the command time formatting, for more information use the `help` command. `time` has to be at least 1 minute.\n`[role]` can be a role\'s name, ID or mention.',
            format: 'temprole [member] [duration] [role]',
            examples: ['temprole Pixoll 1d Moderator'],
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to give the role?',
                    type: 'member'
                },
                {
                    key: 'duration',
                    prompt: 'How long should this role last? (at least 1 min)',
                    type: 'string',
                    /** @param {string|number} duration */
                    parse: (duration) => formatTime(duration),
                    /** @param {string|number} duration */
                    validate: (duration) => !!formatTime(duration) && formatTime(duration) >= 60 * 1000,
                    error: 'You either didn\'t use the correct format, or the duration is less that 1 minute. Please provide a valid duration.'
                },
                {
                    key: 'role',
                    prompt: 'What role would you want to give then?',
                    type: 'role'
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason you\'re giving them the role?',
                    type: 'string',
                    max: 512,
                    default: 'No reason given.'
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {GuildMember} args.member The member to give the role
     * @param {number} args.duration The duration of the role
     * @param {Role} args.role The role to give
     * @param {string} args.reason The reason
     */
    async run(message, { member, duration, role, reason }) {
        const { guild, author } = message
        const { user } = member
        const longTime = ms(duration, { long: true })
        const { position, managed } = role

        const isOwner = guild.ownerID === author.id
        const highestMember = member.roles.highest.position
        const highestBot = guild.members.cache.get(botID).roles.highest.position

        if (isMod(role) || managed) return message.say(basicEmbed('red', 'cross', 'You should not give this role to someone else.'))

        if (isOwner) {
            if (position >= highestBot) return message.say(basicEmbed('red', 'cross', 'The bot cannot assign this role to other members. Please check the role hierarchy or server ownership.'))
        }
        else if (position >= highestMember || position >= highestBot) return message.say(basicEmbed('red', 'cross', 'You or the bot cannot assign this role to other members. Please check the role hierarchy or server ownership.'))

        if (!member.manageable) return message.say(basicEmbed('red', 'cross', `Unable to ban ${user.tag}`, 'Please check the role hierarchy or server ownership.'))

        if (member.roles.cache.has(role.id)) return message.say(basicEmbed('red', 'cross', 'That member already has that role.'))

        await member.roles.add(role, reason)

        message.say(basicEmbed('green', 'check', `Added role ${role.name} to ${user.tag}`, stripIndent`
            **Duration:** ${longTime}
            **Reason:** ${reason}
        `))

        const doc = {
            _id: docID(),
            type: 'temprole',
            guild: guild.id,
            user: user.id,
            role: role.id,
            duration: Date.now() + duration
        }

        await new active(doc).save()
    }
}