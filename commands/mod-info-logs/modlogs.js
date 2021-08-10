const { Command, CommandoMessage } = require('discord.js-commando')
const { User } = require('discord.js')
const { generateEmbed, basicEmbed } = require('../../utils/functions')
const { moderations } = require('../../utils/mongodb-schemas')
const { stripIndent } = require('common-tags')

module.exports = class modlogs extends Command {
    constructor(client) {
        super(client, {
            name: 'modlogs',
            group: 'mod',
            memberName: 'modlogs',
            description: 'Displays user moderator logs of a user or all mod logs on this server.',
            details: stripIndent`
                If \`user\` is not specified, I will show every single moderation log.
                \`user\` can be a user's username, ID or mention.
            `,
            format: 'modlogs <user>',
            examples: ['modlogs Pixoll'],
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [{
                key: 'user',
                prompt: 'What user do you want to get the mod logs from?',
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
     * @param {User} args.user The user to get the mod logs from
     */
    async run(message, { user }) {
        const { guild } = message

        const query = user ? { guild: guild.id, user: user.id } : { guild: guild.id }
        const modLogs = await moderations.find(query)
        if (modLogs.length === 0) return message.say(basicEmbed('blue', 'info', 'There are no moderation logs.'))

        const avatarURL = user ? user.displayAvatarURL({ dynamic: true }) : guild.iconURL({ dynamic: true })

        generateEmbed(message, modLogs, {
            authorName: `${user?.username || guild.name}'s moderation logs`,
            authorIconURL: avatarURL,
            title: 'ID:',
            hasObjects: true,
            boldText: true,
            keysExclude: ['__v', 'updatedAt', 'guild', '_id', user ? 'mod' : null],
            useDocID: true
        }, true)
    }
}