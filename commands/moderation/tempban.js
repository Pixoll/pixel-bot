const { User } = require('discord.js')
const { Command, CommandoMessage } = require('discord.js-commando')
const { docID, isMod, formatTime, basicEmbed } = require('../../utils/functions')
const { moderations, active } = require('../../utils/mongodb-schemas')
const { stripIndent } = require('common-tags')
const { ms } = require('../../utils/custom-ms')

module.exports = class tempban extends Command {
    constructor(client) {
        super(client, {
            name: 'tempban',
            group: 'mod',
            memberName: 'tempban',
            description: 'Ban a user for a specified amount of time.',
            details: stripIndent`
                \`user\` can be a user's username, ID or mention.
                If \`reason\` is not specified, it will default as 'No reason given.'.
            `,
            format: 'tempban [user] [duration] <reason>',
            examples: ['tempban Pixoll 1d', 'tempban Pixoll 30d Advertising in DM\'s'],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true,
            throttling: { usages: 1, duration: 3 },
            args: [
                {
                    key: 'user',
                    prompt: 'What user do you want to ban?',
                    type: 'user',
                    /** @param {User} user @param {CommandoMessage} message */
                    validate: async (user, message) => {
                        if (user.id === this.client.user.id) return false
                        if (user.id === message.author.id) return false
                        const isBanned = await message.guild.fetchBan(user).catch(() => undefined)
                        if (isBanned) return false
                        const member = message.guild.members.cache.get(user.id)
                        if (member) {
                            if (!member.bannable) return false
                            if (isMod(member)) return false
                        }
                        return true
                    },
                    error: stripIndent`
                        I cannot soft-ban that user. Possible reasons:
                        - The user ID is the same as yours or the bot.
                        - That user is already banned.
                        - Because of role hierarchy, server ownership or because they're a mod/admin.
                    `
                },
                {
                    key: 'duration',
                    prompt: 'How long should the ban last? (at least 1 min)',
                    type: 'string',
                    /** @param {string|number} duration */
                    parse: (duration) => formatTime(duration),
                    /** @param {string|number} duration */
                    validate: (duration) => !!formatTime(duration) && formatTime(duration) >= 60 * 1000,
                    error: 'You either didn\'t use the correct format, or the duration is less that 1 minute. Please provide a valid duration.'
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason of the ban?',
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
     * @param {User} args.user The user to temp-ban
     * @param {number} args.duration The duration of the temp-ban
     * @param {string} args.reason The reason of the temp-ban
     */
    async run(message, { user, duration, reason }) {
        // gets data that will be used later
        const { guild, author } = message
        const { members } = guild
        const isOwner = guild.ownerID === author.id
        const botID = this.client.user.id
        const channel = guild.channels.cache.filter(({ type }) => type === 'text').first()

        if (user.id === botID) return message.say(basicEmbed('red', 'cross', 'You can\'t make me ban myself.'))
        if (user.id === author.id) return message.say(basicEmbed('red', 'cross', 'You can\'t ban yourself.'))

        const isBanned = await message.guild.fetchBan(user).catch(() => null)
        if (isBanned) return message.say(basicEmbed('red', 'cross', 'That user is already banned.'))

        const member = message.guild.members.cache.get(user.id)
        if (member) {
            if (!member?.bannable) return message.say(basicEmbed('red', 'cross', `Unable to ban ${user.tag}`, 'Please check the role hierarchy or server ownership.'))
            if (!isOwner && isMod(member)) return message.say(basicEmbed('red', 'cross', 'That user is a mod/admin, you can\'t ban them.'))
        }

        const longTime = ms(duration, { long: true })

        // checks if the user is not a bot and if its in the server before trying to send the DM
        if (!user.bot && member) {
            const invite = await channel.createInvite({ maxAge: 0, maxUses: 1 })

            await user.send(basicEmbed('gold', '', `You have been banned from ${guild.name}`, stripIndent`
                **Reason:** ${reason}
                **Duration:** ${longTime}
                **Moderator:** ${author}
                
                Feel free to join back when your ban expires: ${invite.toString()}
            `)).catch(() => null)
        }

        await members.ban(user, { days: 7, reason: reason })

        message.say(basicEmbed('green', 'check', `${user.tag} has been banned`, stripIndent`
            **Duration:** ${longTime}
            **Reason:** ${reason}
        `))

        const documentID = docID()

        // creates and saves the mongodb documents
        const modDoc = {
            _id: documentID,
            type: 'temp-ban',
            guild: guild.id,
            user: user.id,
            mod: author.id,
            reason: reason,
            duration: longTime
        }
        const activeDoc = {
            _id: documentID,
            type: 'temp-ban',
            guild: guild.id,
            user: user.id,
            mod: author.id,
            duration: Date.now() + duration
        }

        await new moderations(modDoc).save()
        await new active(activeDoc).save()
    }
}