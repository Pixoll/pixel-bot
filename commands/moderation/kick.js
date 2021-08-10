const { Command, CommandoMessage } = require('discord.js-commando')
const { GuildMember } = require('discord.js')
const { isMod, docID, basicEmbed } = require('../../utils/functions')
const { moderations } = require('../../utils/mongodb-schemas')
const { stripIndent } = require('common-tags')

module.exports = class kick extends Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            group: 'mod',
            memberName: 'kick',
            description: 'Kick a member.',
            details: stripIndent`
                \`member\` can be a member's username, ID or mention.
                If \`reason\` is not specified, it will default as 'No reason given.'
            `,
            format: 'kick [member] <reason>',
            examples: ['kick Pixoll', 'kick Pixoll Get out!'],
            clientPermissions: ['KICK_MEMBERS'],
            userPermissions: ['KICK_MEMBERS'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to kick?',
                    type: 'member'
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason of the kick?',
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
     * @param {GuildMember} args.member The member to kick
     * @param {string} args.reason The reason of the kick
     */
    async run(message, { member, reason }) {
        const { user } = member
        const { guild, author } = message
        const isOwner = guild.ownerID === author.id
        const botID = this.client.user.id
        const channel = guild.channels.cache.filter(({ type }) => type === 'text').first()

        if (user.id === botID) return message.say(basicEmbed('red', 'cross', 'You can\'t make me ban myself.'))
        if (user.id === author.id) return message.say(basicEmbed('red', 'cross', 'You can\'t ban yourself.'))

        if (!member.kickable) return message.say(basicEmbed('red', 'cross', `Unable to kick ${user.tag}`, 'Please check the role hierarchy or server ownership.'))
        if (!isOwner && isMod(member)) return message.say(basicEmbed('red', 'cross', 'That user is a mod/admin, you can\'t kick them.'))

        if (!member.user.bot) {
            const invite = await channel.createInvite({ maxAge: 604800, maxUses: 1 })
            await member.send(basicEmbed('gold', '', `You have been kicked from ${guild.name}`, stripIndent`
                **Reason:** ${reason}
                **Moderator:** ${author}
                
                Feel free to join back: ${invite.toString()}
                *This invite will expire in 1 week.*
            `)).catch(() => null)
        }

        await member.kick(reason)

        message.say(basicEmbed('green', 'check', `${user.tag} has been kicked`, `**Reason:** ${reason}`))

        // creates and saves the document
        const doc = {
            _id: docID(),
            type: 'kick',
            guild: guild.id,
            user: user.id,
            mod: author.id,
            reason: reason
        }

        await new moderations(doc).save()
    }
}