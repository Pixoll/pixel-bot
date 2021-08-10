const { Command, CommandoMessage } = require('discord.js-commando')
const { MessageEmbed, User } = require('discord.js')
const { cmdInfo, basicEmbed } = require('../../utils/functions')
const { active } = require('../../utils/mongodb-schemas')
const { stripIndent } = require('common-tags')

module.exports = class unban extends Command {
    constructor(client) {
        super(client, {
            name: 'unban',
            group: 'mod',
            memberName: 'unban',
            description: 'Unban a user.',
            details: stripIndent`
                \`user\` has to be a user\'s ID or mention.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'unban [user] <reason>',
            examples: ['unban 667937325002784768', 'unban 802267523058761759 Appealed'],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'user',
                    prompt: 'What user do you want to unban?',
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
     * @param {User} args.user The user to unban
     * @param {string} args.reason The reason of the unban
     */
    async run(message, { user, reason }) {
        const isBanned = await message.guild.fetchBan(user).catch(() => null)
        if (!isBanned) return message.say(basicEmbed('red', 'cross', 'That user is not banned.'))

        await message.guild.members.unban(user, reason)

        message.say(basicEmbed('green', 'check', `${user.tag} has been unbanned`, `**Reason:** ${reason}`))

        const data = await active.findOne({ type: 'temp-ban', user: user.id })
        if (data) await data.deleteOne()
    }
}