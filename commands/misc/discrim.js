const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, generateEmbed, pluralize, abcOrder } = require('../../utils')

/** A command that can be run in a client */
module.exports = class DiscriminatorCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'discriminator',
            aliases: ['discrim'],
            group: 'misc',
            description: 'Displays a list of users with a discriminator.',
            details: '`discrim` has to be a number from 1 to 9999.',
            format: 'discriminator [discrim]',
            examples: ['discriminator 1234'],
            guildOnly: true,
            args: [{
                key: 'discriminator',
                prompt: 'What discriminator do you want to look for?',
                type: 'integer',
                /** @param {string} discrim */
                parse: discrim => discrim.padStart(4, '0').slice(-4),
                min: 1,
                max: 9999
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.discriminator The discriminator to filter displayed members
     */
    async run(message, { discriminator }) {
        const members = message.guild.members.cache
        const match = members.filter(m => m.user.discriminator === discriminator)
            .sort((a, b) => abcOrder(a.user.tag, b.user.tag))
            .map(m => `${m.toString()} ${m.user.tag}`)

        if (!match || match.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'I couldn\'t find any members.'
            }))
        }

        await generateEmbed(message, match, {
            number: 20,
            authorName: `Found ${pluralize('member', match.length)}`,
            useDescription: true
        })
    }
}