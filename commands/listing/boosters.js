/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { generateEmbed, pluralize, abcOrder, basicEmbed } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class BoostersCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'boosters',
            aliases: ['boosts'],
            group: 'lists',
            description: 'Displays a list of the members that have boosted the server.',
            guildOnly: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const members = message.guild.members.cache
        const boosters = members.filter(m => m.roles.premiumSubscriberRole)
            .sort((a, b) => abcOrder(a.user.tag, b.user.tag))
            .map(m => `${m.toString()} ${m.user.tag}`)

        if (boosters.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no boosters in this server.'
            }))
        }

        await generateEmbed(message, boosters, {
            number: 20,
            authorName: `There's ${pluralize('booster', boosters.length)}`,
            useDescription: true
        })
    }
}