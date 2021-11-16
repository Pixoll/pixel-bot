const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { generateEmbed, basicEmbed, pluralize } = require('../../utils')

/** A command that can be run in a client */
module.exports = class PollsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'polls',
            group: 'lists',
            description: 'Displays all the on-going polls on this server. Use the `poll` command to add polls.',
            guildOnly: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const { guild } = message
        const db = guild.database.polls

        const pollsData = await db.fetchMany()
        if (pollsData.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no active polls.'
            }))
        }

        await generateEmbed(message, pollsData.toJSON(), {
            number: 5,
            authorName: `There's ${pluralize('active poll', pollsData.size)}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            title: 'Poll',
            keys: ['channel', 'duration', 'endsAt']
        })
    }
}