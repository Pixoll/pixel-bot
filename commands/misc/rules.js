const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { rules } = require('../../mongo/schemas')
const { generateEmbed, basicEmbed } = require('../../utils')
const { RuleSchema } = require('../../mongo/typings')

/** A command that can be run in a client */
module.exports = class RulesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rules',
            group: 'misc',
            description: 'Displays all the rules of this server.',
            guildOnly: true,
            throttling: { usages: 1, duration: 3 }
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const { guildId, guild } = message

        /** @type {RuleSchema} */
        const rulesData = await rules.findOne({ guild: guildId })
        const rulesList = rulesData ? Array(...rulesData.rules) : null

        if (!rulesList || rulesList.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'The are no saved rules for this server.'
            }))
        }

        await generateEmbed(message, rulesList, {
            number: 5,
            authorName: `${guild.name}'s rules`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            title: 'Rule',
            hasObjects: false
        })
    }
}