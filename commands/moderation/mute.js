const { Command, CommandoMessage } = require('discord.js-commando')
const { GuildMember } = require('discord.js')
const { ms } = require('../../utils/custom-ms')
const { isMod, docID, basicEmbed, formatTime } = require('../../utils/functions')
const { moderations, active, setup } = require('../../utils/mongo/schemas')
const { stripIndent } = require('common-tags')

module.exports = class mute extends Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            group: 'mod',
            memberName: 'mute',
            description: 'Mute a member so they cannot type or speak.',
            details: stripIndent`
                \`member\` can be a member\'s username, ID or mention.
                \`duration\` uses the command time formatting, for more information use the \`help\` command. \`duration\` has to be at least 1 minute.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'mute [member] [duration] <reason>',
            examples: ['mute Pixoll 2h', 'mute Pixoll 6h Excessive swearing'],
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to mute?',
                    type: 'member'
                },
                {
                    key: 'duration',
                    prompt: 'How long should the mute last? (at least 1 min)',
                    type: 'string',
                    /** @param {string|number} duration */
                    parse: (duration) => formatTime(duration),
                    /** @param {string|number} duration */
                    validate: (duration) => !!formatTime(duration) && formatTime(duration) >= 60 * 1000,
                    error: 'You either didn\'t use the correct format, or the duration is less that 1 minute. Please provide a valid duration.'
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason of the mute?',
                    type: 'string',
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
     * @param {GuildMember} args.member The member to mute
     * @param {number} args.duration The duration of the mute
     * @param {string} args.reason The reason of the mute
     */
    async run(message, { member, duration, reason }) {
        // gets data that will be used later
        const { guild, author } = message
        const { user } = member
        const isOwner = guild.ownerID === author.id
        const botID = this.client.user.id

        const _roles = await guild.roles.fetch()
        const roles = _roles.cache

        const data = await setup.findOne({ guild: guild.id })
        if (!data || !data.mutedRole) return message.say(basicEmbed('red', 'cross', 'No mute role found in this server, please use the `setup` command before using this.'))

        if (member.id === botID) return message.say(basicEmbed('red', 'cross', 'You can\'t make me mute myself.'))
        if (member.id === author.id) return message.say(basicEmbed('red', 'cross', 'You can\'t mute yourself.'))

        if (!member.manageable) return message.say(basicEmbed('red', 'cross', `Unable to mute ${user.tag}`, 'Please check the role hierarchy or server ownership.'))
        if (!isOwner && isMod(member)) return message.say(basicEmbed('red', 'cross', 'That user is a mod/admin, you can\'t mute them.'))

        const longTime = ms(duration, { long: true })

        const role = roles.get(data.mutedRole)

        if (member.roles.cache.has(role.id)) return message.say(basicEmbed('red', 'cross', 'That user is already muted.'))

        await member.roles.add(role)

        if (!member.user.bot) member.send(basicEmbed('gold', '', `You have been muted on ${guild.name}`, stripIndent`
            ** Duration:** ${longTime}
            ** Reason:** ${reason}
            ** Moderator:** ${author}
        `)).catch(() => null)

        message.say(basicEmbed('green', 'check', `${user.tag} has been muted`, stripIndent`
            **Duration:** ${longTime}
            **Reason:** ${reason}
        `))

        const documentID = docID()

        const modLog = {
            _id: documentID,
            type: 'mute',
            guild: guild.id,
            user: user.id,
            mod: author.id,
            reason: reason,
            duration: longTime
        }

        const activeLog = {
            _id: documentID,
            type: 'mute',
            guild: guild.id,
            user: user.id,
            duration: Date.now() + duration
        }

        await new moderations(modLog).save()
        await new active(activeLog).save()
    }
}