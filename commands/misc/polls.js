const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { polls } = require('../../mongo/schemas')
const { generateEmbed, basicEmbed, pluralize } = require('../../utils')

/** A command that can be run in a client */
module.exports = class PollsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'polls',
            group: 'misc',
            description: 'Displays all the on-going polls on this server.',
            throttling: { usages: 1, duration: 3 },
            guildOnly: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const { guild, guildId } = message

        const pollsData = await polls.find({ guild: guildId })
        if (pollsData.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no active polls.'
            }))
        }

        await generateEmbed(message, pollsData, {
            number: 5,
            authorName: `There's ${pluralize('active poll', pollsData.length)}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            title: 'Poll',
            keys: ['channel', 'duration', 'endsAt']
        })
    }
}