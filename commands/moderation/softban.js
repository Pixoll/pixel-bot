const { Command, CommandoMessage } = require('discord.js-commando')
const { User } = require('discord.js')
const { isMod, docID, basicEmbed } = require('../../utils/functions')
const { moderations } = require('../../utils/mongo/schemas')
const { stripIndent } = require('common-tags')

module.exports = class softban extends Command {
    constructor(client) {
        super(client, {
            name: 'softban',
            group: 'mod',
            memberName: 'softban',
            description: 'Soft-ban a user (Ban and immediate unban to delete user messages).',
            details: stripIndent`
                \`user\` has to be a user's username, ID or mention.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'softban [user] <reason>',
            examples: ['softban Pixoll', 'softban Pixoll Mass-spam'],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'user',
                    prompt: 'What user do you want to soft-ban?',
                    type: 'user'
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
     * @param {User} args.user The user to soft-ban
     * @param {string} args.reason The reason of the soft-ban
     */
    async run(message, { user, reason }) {
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
        if (!member?.bannable) return message.say(basicEmbed('red', 'cross', `Unable to ban ${user.tag}`, 'Please check the role hierarchy or server ownership.'))
        if (!isOwner && isMod(member)) return message.say(basicEmbed('red', 'cross', 'That user is a mod/admin, you can\'t ban them.'))

        if (!user.bot && member) {
            const invite = await channel.createInvite({ maxAge: 604800, maxUses: 1 })
            await member.send(basicEmbed('gold', '', `You have been soft-banned from ${guild.name}`, stripIndent`
                **Reason:** ${reason}
                **Moderator:** ${author}
                
                Feel free to join back: ${invite.toString()}
                *This invite will expire in 1 week.*
            `)).catch(() => null)
        }

        await members.ban({ days: 7, reason: reason })
        await members.unban(user, 'Soft-ban')

        message.say(basicEmbed('green', 'check', `${user.tag} has been soft-banned`, `**Reason:** ${reason}`))

        // creates and saves the document
        const doc = {
            _id: docID(),
            type: 'soft-ban',
            guild: guild.id,
            user: user.id,
            mod: author.id,
            reason: reason
        }

        await new moderations(doc).save()
    }
}