const { Command, CommandoMessage } = require('discord.js-commando')
const { MessageEmbed, User } = require('discord.js')
const { generateEmbed, basicEmbed } = require('../../utils/functions')
const { moderations } = require('../../utils/mongo/schemas')
const { stripIndent } = require('common-tags')

module.exports = class warnings extends Command {
    constructor(client) {
        super(client, {
            name: 'warnings',
            aliases: ['warns'],
            group: 'mod',
            memberName: 'warnings',
            description: 'Displays user warnings or all warnings on this server.',
            details: stripIndent`
                If \`user\` is not specified, I will show every single moderation log.
                \`user\` can be a user's username, ID or mention.
            `,
            format: 'warnings <user>',
            examples: ['warnings Pixoll'],
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [{
                key: 'user',
                prompt: 'What user do you want to get the warnings from?',
                type: 'user',
                default: ''
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {User} args.user The user to get the warnings from
     */
    async run(message, { user }) {
        const { guild } = message

        const query = user ? { guild: guild.id, type: 'warn', user: user.id } : { guild: guild.id, type: 'warn' }
        const warns = await moderations.find(query)
        if (warns.length === 0) return message.say(basicEmbed('blue', 'info', 'There are no warnings.'))

        const avatarURL = user ? user.displayAvatarURL({ dynamic: true }) : guild.iconURL({ dynamic: true })

        await generateEmbed(message, warns, {
            authorName: `${user?.username || guild.name}'s warnings`,
            authorIconURL: avatarURL,
            title: 'ID:',
            keysExclude: ['__v', 'updatedAt', 'guild', '_id', 'type', user ? 'user' : null],
            useDocID: true
        })
    }
}