/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { generateEmbed, basicEmbed, getArgument, confirmButtons, replyAll } = require('../../utils/functions')
const { stripIndent } = require('common-tags')
const { TodoSchema } = require('../../schemas/types')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class TodoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'to-do',
            aliases: ['todo'],
            group: 'lists',
            description: 'View your to-do list, or add/remove an item.',
            details: '`items` can be different **positive** numbers, separated by spaces.',
            format: stripIndent`
                todo <view> - Display your to-do list.
                todo add [item] - Add an item to yout to-do list.
                todo remove [item] - Remove an item from your to-do list.
                todo clear - Remove all of the items in your to-do list.
            `,
            examples: [
                'todo add Make awesome commands',
                'todo remove 2'
            ],
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['view', 'add', 'remove', 'clear'],
                    default: 'view'
                },
                {
                    key: 'item',
                    prompt: 'What item do you want to add/remove?',
                    type: 'string',
                    min: 1,
                    max: 512,
                    required: false
                }
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'view',
                        description: 'Display your to-do list.'
                    },
                    {
                        type: 'subcommand',
                        name: 'add',
                        description: 'Add an item to yout to-do list.',
                        options: [{
                            type: 'string',
                            name: 'item',
                            description: 'The item to add to your to-do list.',
                            required: true
                        }]
                    },
                    {
                        type: 'subcommand',
                        name: 'remove',
                        description: 'Remove an item from your to-do list.',
                        options: [{
                            type: 'integer',
                            name: 'item',
                            description: 'The item to remove from your to-do list.',
                            required: true,
                            // minValue: 1
                        }]
                    },
                    {
                        type: 'subcommand',
                        name: 'clear',
                        description: 'Remove all of the items in your to-do list.'
                    }
                ]
            }
        })

        this.db = this.client.database.todo
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'view'|'add'|'remove'|'clear'} args.subCommand The sub-command
     * @param {string|number} args.item The item to add/remove
     */
    async run({ message, interaction }, { subCommand, item }) {
        subCommand = subCommand.toLowerCase()
        const author = message?.author || interaction.user

        const TODO = await this.db.fetch({ user: author.id })

        switch (subCommand) {
            case 'view':
                return await this.view({ message, interaction }, TODO)
            case 'add':
                return await this.add({ message, interaction }, item, TODO)
            case 'remove':
                return await this.remove({ message, interaction }, item, TODO)
            case 'clear':
                return await this.clear({ message, interaction }, TODO)
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {TodoSchema} todoData The existent to-do document
     */
    async view({ message, interaction }, todoData) {
        if (!todoData || !todoData.list || todoData.list.length === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'Your to-do list is empty.'
            }))
        }

        const author = message?.author || interaction.user

        await generateEmbed({ message, interaction }, todoData.list, {
            number: 5,
            authorName: 'Your to-do list',
            authorIconURL: author.displayAvatarURL({ dynamic: true }),
            title: 'Item',
            hasObjects: false,
            toUser: true,
            dmMsg: 'Check your DMs for your to-do list.'
        })
    }

    /**
     * The `add` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {string} item The new item to add
     * @param {TodoSchema} todoData The existent to-do document
     */
    async add({ message, interaction }, item, todoData) {
        if (message && !item) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            item = value
        }

        const author = message?.author || interaction.user
        if (!todoData) await this.db.add({ user: author.id, list: [item] })
        else await this.db.update(todoData, { $push: { list: item } })

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `Added item \`${(todoData?.list.length ?? 0) + 1}\` to your to-do list:`,
            fieldValue: item
        }))
    }

    /**
     * The `remove` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {number} item The item you want to add or remove from the FAQ list
     * @param {TodoSchema} todoData The existent to-do document
     */
    async remove({ message, interaction }, item, todoData) {
        if (message && !item) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            item = Math.abs(parseInt(value || 0) || 0)
        }

        if (!todoData || !todoData.list || todoData.list.length === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'Your to-do list is empty.'
            }))
        }

        if (!todoData.list[--item]) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That\'s not a valid item number inside your to-do list.'
            }))
        }
        await this.db.update(todoData, { $pull: { list: todoData.list[item++] } })

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Removed item \`${item}\` from your to-do list.`
        }))
    }

    /**
     * The `clear` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {TodoSchema} todoData The existent to-do document
     */
    async clear({ message, interaction }, todoData) {
        if (!todoData || !todoData.list || todoData.list.length === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'Your to-do list is empty.'
            }))
        }

        const confirmed = await confirmButtons({ message, interaction }, 'clear your to-do list')
        if (!confirmed) return

        await this.db.delete(todoData)

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', description: 'Your to-do list has been cleared.'
        }))
    }
}
