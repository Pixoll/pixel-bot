const { Command, CommandoMessage } = require('discord.js-commando')
const { basicEmbed, generateEmbed } = require('../../utils/functions')

module.exports = class discriminator extends Command {
    constructor(client) {
        super(client, {
            name: 'discriminator',
            aliases: ['discrim'],
            group: 'misc',
            memberName: 'discriminator',
            description: 'Displays a list of users with a discriminator.',
            details: '`discriminator` has to be a number from 1 to 9999.',
            format: 'discriminator [discriminator]',
            examples: ['discriminator 1234'],
            guildOnly: true,
            args: [{
                key: 'discriminator',
                prompt: 'What discriminator do you want to look for?',
                type: 'integer',
                min: 1,
                max: 9999
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {number} args.discriminator The discriminator to filter displayed members
     */
     async run(message, { discriminator: discrim }) {
        // looks for members matching 'discrim' and returns if found none
        const match = message.guild.members.cache.filter(({ user: { discriminator } }) => parseInt(discriminator) === discrim).map(member => member)
        if (match.length === 0) return message.say(basicEmbed('red', 'cross', 'I couldn\'t find any members.'))

        await generateEmbed(message, match, {
            number: 20,
            color: 'random',
            authorName: 'Matched members',
            useDescription: true
        })
    }
}