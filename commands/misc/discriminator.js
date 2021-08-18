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
                parse: discrim => discrim.padStart(4, '0').slice(-4),
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
     async run(message, { discriminator }) {
        // looks for members matching 'discriminator' and returns if found none
        const members = await message.guild.members.fetch()
        const match = members?.filter(({ user }) => user.discriminator === discriminator).map(member => member)

        if (match.length === 0) return message.say(basicEmbed('red', 'cross', 'I couldn\'t find any members.'))

        await generateEmbed(message, match, {
            number: 20,
            color: 'random',
            authorName: 'Matched members',
            useDescription: true
        })
    }
}