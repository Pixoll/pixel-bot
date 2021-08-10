const { Command, CommandoMessage } = require('discord.js-commando')
const { MessageEmbed, User } = require('discord.js')
const { stripIndent, oneLine } = require('common-tags')

/** sends an embed with the pfp of the user
 * @param {User} user the user
 */
function getAvatar(user) {
    const embed = new MessageEmbed()
        .setColor('#4c9f4c')
        .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
        .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))

    return embed
}

module.exports = class avatar extends Command {
    constructor(client) {
        super(client, {
            name: 'avatar',
            aliases: ['av'],
            group: 'misc',
            memberName: 'avatar',
            description: 'Displays a user\'s avatar.',
            details: stripIndent`
                If \`user\` is not specified, it will send your avatar.
                \`user\` can be a user's username, ID or mention.
            `,
            format: 'avatar <user>',
            examples: ['avatar Pixoll'],
            args: [{
                key: 'user',
                prompt: 'From what user do you want to get their avatar from?',
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
     * @param {User} args.user The user to get the avatar from
     */
    async run(message, { user }) {
        if (!user) message.say(getAvatar(message.author))
        else message.say(getAvatar(user))
    }
}