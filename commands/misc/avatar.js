const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { MessageEmbed, User } = require('discord.js')
const { userDetails } = require('../../utils')

/** A command that can be run in a client */
module.exports = class AvatarCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'avatar',
            aliases: ['av'],
            group: 'misc',
            description: 'Displays a user\'s avatar, or yours if you don\'t specify any.',
            details: userDetails,
            format: 'avatar <user>',
            examples: ['avatar Pixoll'],
            args: [{
                key: 'user',
                prompt: 'What user do you want to get their avatar from?',
                type: 'user',
                required: false
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to get the avatar from
     */
    async run(message, { user }) {
        if (!user) user = message.author

        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 2048 })

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }), avatarURL)
            .setImage(avatarURL)

        await message.replyEmbed(embed)
    }
}