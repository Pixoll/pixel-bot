const { User } = require('discord.js')
const { Command, CommandoMessage } = require('discord.js-commando')
const { basicEmbed } = require('../../utils/functions')

module.exports = class bancheck extends Command {
    constructor(client) {
        super(client, {
            name: 'bancheck',
            group: 'mod',
            memberName: 'bancheck',
            description: 'Check if a user is banned.',
            details: `\`user\` has to be a user's username, ID or mention.`,
            format: 'bancheck [user]',
            examples: ['bancheck Pixoll'],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [{
                key: 'user',
                prompt: 'What user do you want to check their ban?',
                type: 'user'
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {User} args.user The user to check their ban
     */
    async run(message, { user }) {
        const banLog = await message.guild.fetchBan(user).catch(() => null)

        if (banLog) {
            const reason = banLog.reason?.replace(/%20/g, ' ') || 'No reason given.'

            return message.say(basicEmbed('blue', 'info', `${user.tag} is already banned`, `**Reason:** ${reason}`))
        }

        message.say(basicEmbed('blue', 'info', `${user.tag} is not banned`))
    }
}