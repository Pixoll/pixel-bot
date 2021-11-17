/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { generateEmbed, basicEmbed, confirmButtons } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class RulesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rules',
            group: 'lists',
            description: 'Displays all the rules of this server. Use the `rule` command to add rules.',
            guildOnly: true,
            format: stripIndent`
                rules <view> - Display the server rules.
                rules clear - Delete all of the server rules (server owner only).
            `,
            args: [{
                key: 'subCommand',
                label: 'sub-command',
                prompt: 'What sub-command do you want to use?',
                type: 'string',
                oneOf: ['view', 'clear'],
                default: 'view'
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {'view'|'clear'} args.subCommand The sub-command to use
     */
    async run(message, { subCommand }) {
        subCommand = subCommand.toLowerCase()
        this.db = message.guild.database.rules

        const data = await this.db.fetch()

        if (!data || data.rules.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE',
                emoji: 'info',
                description: 'The are no saved rules for this server. Use the `rule` command to add rules.'
            }))
        }

        switch (subCommand) {
            case 'view':
                return await this.view(message, data.rules)
            case 'clear':
                return await this.clear(message, data)
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {string[]} rules The rules list
     */
    async view(message, rulesList) {
        const { guild } = message

        await generateEmbed(message, rulesList, {
            number: 5,
            authorName: `${guild.name}'s rules`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            title: 'Rule',
            hasObjects: false
        })
    }

    /**
     * The `clear` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Collection<string, ReminderSchema>} data The rules data
     */
    async clear(message, data) {
        const { client, guild, author } = message

        if (!client.isOwner(message) && guild.ownerId !== author.id) {
            return await this.onBlock(message, 'guildOwnerOnly')
        }

        const confirmed = await confirmButtons(message, 'delete all of the server rules')
        if (!confirmed) return

        await this.db.delete(data)

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: 'All the server rules have been deleted.'
        }))
    }
}