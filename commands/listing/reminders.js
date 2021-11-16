const { stripIndent } = require('common-tags')
const { Collection } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { generateEmbed, basicEmbed, pluralize, confirmButtons } = require('../../utils')
const { ReminderSchema } = require('../../schemas/types')

/** A command that can be run in a client */
module.exports = class RemindersCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reminders',
            group: 'lists',
            description: 'Displays a list of all your active reminders. Use the `reminder` command to add reminders.',
            format: stripIndent`
                reminders <view> - Display your reminders.
                reminders clear - Delete all of your reminders.
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

        this.db = this.client.database.reminders
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {'view'|'clear'} args.subCommand The sub-command to use
     */
    async run(message, { subCommand }) {
        subCommand = subCommand.toLowerCase()

        const data = await this.db.fetchMany({ user: message.author.id })
        if (data.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info',
                description: 'You have no active reminders. Use the `reminder` command to add reminders.'
            }))
        }

        switch (subCommand) {
            case 'view':
                return await this.view(message, data)
            case 'clear':
                return await this.clear(message, data)
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Collection<string, ReminderSchema>} reminders The reminders data
     */
    async view(message, reminders) {
        const list = reminders.sort((a, b) => a.remindAt - b.remindAt).map(r => ({
            remindAt: r.remindAt,
            reminder: `${r.reminder}\n[Jump to message](${r.msgURL})`
        }))

        await generateEmbed(message, list, {
            authorName: `You have ${pluralize('reminder', reminders.size)}`,
            authorIconURL: message.author.displayAvatarURL({ dynamic: true }),
            title: 'Reminder set for',
            keyTitle: { suffix: 'remindAt' },
            keys: ['reminder'],
            numbered: true,
            toUser: true,
            dmMsg: 'Check your DMs for the list of your reminders.'
        })
    }

    /**
     * The `clear` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Collection<string, ReminderSchema>} reminders The reminders data
     */
    async clear(message, reminders) {
        const confirmed = await confirmButtons(message, 'delete all of your reminders')
        if (!confirmed) return

        for (const doc of reminders.toJSON()) {
            await this.db.delete(doc)
        }

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            description: 'Your reminders have been deleted.'
        }))
    }
}