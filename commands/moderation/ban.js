const { User } = require('discord.js')
const { Command, CommandoMessage } = require('discord.js-commando')
const { docID, isMod, basicEmbed } = require('../../utils/functions')
const { moderations } = require('../../utils/mongodb-schemas')
const { stripIndent } = require('common-tags')

module.exports = class ban extends Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'mod',
            memberName: 'ban',
            description: 'Ban a user permanently.',
            details: stripIndent`
                \`user\` has to be a user's username, ID or mention.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'ban [user] <reason>',
            examples: ['ban Pixoll', 'ban Pixoll The Ban Hammer has Spoken!'],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'user',
                    prompt: 'What user do you want to ban?',
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
     * @param {User} args.user The user to ban
     * @param {string} args.reason The reason of the ban
     */
    async run(message, { user, reason }) {
        // gets data that will be used later
        const { guild, author } = message
        const isOwner = guild.ownerID === author.id
        const botID = this.client.user.id
        const { members } = guild

        if (user.id === botID) return message.say(basicEmbed('red', 'cross', 'You can\'t make me ban myself.'))
        if (user.id === author.id) return message.say(basicEmbed('red', 'cross', 'You can\'t ban yourself.'))

        const isBanned = await message.guild.fetchBan(user).catch(() => null)
        if (isBanned) return message.say(basicEmbed('red', 'cross', 'That user is already banned.'))

        const member = message.guild.members.cache.get(user.id)
        if (member) {
            if (!member?.bannable) return message.say(basicEmbed('red', 'cross', `Unable to ban ${user.tag}`, 'Please check the role hierarchy or server ownership.'))
            if (!isOwner && isMod(member)) return message.say(basicEmbed('red', 'cross', 'That user is a mod/admin, you can\'t ban them.'))
        }

        // checks if the user is not a bot and if its in the server before trying to send the DM
        if (!user.bot && member) await user.send(basicEmbed('gold', '', `You have been banned from ${guild.name}`, stripIndent`
            **Reason:** ${reason}
            **Moderator:** ${author}
        `)).catch(() => null)

        await members.ban(user, { days: 7, reason: reason })

        message.say(basicEmbed('green', 'check', `${user.tag} has been banned`, `**Reason:** ${reason}`))

        // creates and saves the document
        const doc = {
            _id: docID(),
            type: 'ban',
            guild: guild.id,
            user: user.id,
            mod: author.id,
            reason: reason
        }

        await new moderations(doc).save()
    }
}