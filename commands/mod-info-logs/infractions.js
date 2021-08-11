const { Command, CommandoMessage } = require('discord.js-commando')
const { MessageEmbed, User } = require('discord.js')
const { generateEmbed, basicEmbed } = require('../../utils/functions')
const { moderations } = require('../../utils/mongo/schemas')

module.exports = class infractions extends Command {
    constructor(client) {
        super(client, {
            name: 'infractions',
            group: 'mod',
            memberName: 'infractions',
            description: 'Displays a list of infractions made by this user.',
            details: '`user` can be a user\'s username, ID or mention.',
            format: 'infractions [user]',
            examples: ['infractions Pixoll'],
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            args: [{
                key: 'user',
                prompt: 'What user do you want to get the infractions from?',
                type: 'user'
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {User} args.user The user to get the infractions from
     */
    async run(message, { user }) {
        const mods = await moderations.find({ guild: message.guild.id, user: user.id })
        if (mods.length < 1) return message.say(basicEmbed('blue', 'info', 'That user has no infractions.'))

        generateEmbed(message, mods, {
            authorName: `${user.username}'s infractions`,
            authorIconURL: user.displayAvatarURL({ dynamic: true }),
            title: 'ID:',
            hasObjects: true,
            boldText: true,
            keysExclude: ['__v', 'updatedAt', 'guild', '_id', 'user'],
            useDocID: true
        }, true)
    }
}