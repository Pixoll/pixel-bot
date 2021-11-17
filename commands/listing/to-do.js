/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { generateEmbed, basicEmbed, getArgument, confirmButtons } = require('../../utils')
const { stripIndent } = require('common-tags')
const { TodoSchema } = require('../../schemas/types')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class TodoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'todo',
            aliases: ['to-do'],
            group: 'lists',
            description: 'View your to-do list, or add/remove an item.',
            details: '`items` can be different **positive** numbers, separated by spaces.',
            format: stripIndent`
                todo <view> - Display your to-do list.
                todo add [item] - Add an item to yout to-do list.
                todo remove [items] - Remove items from your to-do list.
                todo clear - Remove all of the items in your to-do list.
            `,
            examples: [
                'todo add Make awesome commands',
                'todo remove 2',
                'todo remove 1 4',
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
                    max: 512,
                    validate: (val, msg) => {
                        const sc = msg.parseArgs().split(/ +/)[0].toLowerCase()
                        if (sc !== 'remove') return true
                        const array = [...new Set(val.split(/ +/).map(Number).filter(n => isNaN(n) || n < 1))]
                        return array.length !== 0
                    },
                    parse: (val, msg) => {
                        const sc = msg.parseArgs().split(/ +/)[0].toLowerCase()
                        if (sc !== 'remove') return val
                        return [...new Set(val.split(/ +/).map(Number).sort())]
                    },
                    required: false
                }
            ]
        })

        this.db = this.client.database.todo
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {'view'|'add'|'remove'|'clear'} args.subCommand The sub-command
     * @param {string|number[]} args.item The item to add/remove
     */
    async run(message, { subCommand, item }) {
        subCommand = subCommand.toLowerCase()
        const { id } = message.author

        const TODO = await this.db.fetch({ user: id })

        switch (subCommand) {
            case 'view':
                return await this.view(message, TODO)
            case 'add':
                return await this.add(message, item, TODO)
            case 'remove':
                return await this.remove(message, item, TODO)
            case 'clear':
                return await this.clear(message, TODO)
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {TodoSchema} todoData The existent to-do document
     */
    async view(message, todoData) {
        if (!todoData || !todoData.list || todoData.list.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'Your to-do list is empty.'
            }))
        }

        const { author } = message

        await generateEmbed(message, todoData.list, {
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
     * @param {CommandoMessage} message The message the command is being run for
     * @param {string} item The new item to add
     * @param {TodoSchema} todoData The existent to-do document
     */
    async add(message, item, todoData) {
        if (!item) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            item = value
        }

        if (!todoData) await this.db.add({ user: message.author.id, list: [item] })
        else await this.db.update(todoData, { $push: { list: item } })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: 'Added the following item to your to-do list:',
            fieldValue: item
        }))
    }

    /**
     * The `remove` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} item The item you want to add or remove from the FAQ list
     * @param {TodoSchema} todoData The existent to-do document
     */
    async remove(message, item, todoData) {
        if (!item) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            item = Math.abs(Number.parseInt(value || 0) || 0)
        }

        if (!todoData || !todoData.list || todoData.list.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'Your to-do list is empty.'
            }))
        }

        if (!todoData.list[--item]) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That\'s not a valid item number inside your to-do list.'
            }))
        }
        await this.db.update(todoData, { $pull: { list: todoData.list[item++] } })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Removed item \`${item}\` from your to-do list.`
        }))
    }

    /**
     * The `clear` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {TodoSchema} todoData The existent to-do document
     */
    async clear(message, todoData) {
        if (!todoData || !todoData.list || todoData.list.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'Your to-do list is empty.'
            }))
        }

        const confirmed = await confirmButtons(message, 'clear your to-do list')
        if (!confirmed) return

        await this.db.delete(todoData)

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: 'Your to-do list has been cleared.'
        }))
    }
}