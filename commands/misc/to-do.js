const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { generateEmbed, basicEmbed, getArgument } = require('../../utils')
const { todo } = require('../../mongo/schemas')
const { stripIndent } = require('common-tags')
const { TodoSchema } = require('../../mongo/typings')

/** A command that can be run in a client */
module.exports = class TodoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'todo',
            aliases: ['to-do'],
            group: 'misc',
            description: 'View your to-do list, or add/remove an item.',
            format: stripIndent`
                todo <view> - Display your to-do list.
                todo add [item] - Add an item to yout to-do list.
                todo remove [number] - Remove an item from your to-do list.
            `,
            examples: [
                'todo add Make awesome commands',
                'todo remove 2'
            ],
            throttling: { usages: 1, duration: 3 },
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['view', 'add', 'remove'],
                    default: 'view'
                },
                {
                    key: 'item',
                    prompt: 'What item do you want to add/remove?',
                    type: 'string',
                    max: 512,
                    required: false
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {'view'|'add'|'remove'} args.subCommand The sub-command
     * @param {string} args.item The item to add/remove
     */
    async run(message, { subCommand, item }) {
        subCommand = subCommand.toLowerCase()
        const { id } = message.author

        /** @type {TodoSchema} */
        const TODO = await todo.findOne({ user: id })
        const todoList = TODO ? Array(...TODO.list) : null

        switch (subCommand) {
            case 'view':
                return await this.view(message, todoList)
            case 'add':
                return await this.add(message, item, TODO)
            case 'remove':
                return await this.remove(message, item, todoList, TODO)
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {string[]} todoList The to-do list
     */
    async view(message, todoList) {
        if (!todoList || todoList.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'Your to-do list is empty.'
            }))
        }

        const { author } = message

        await generateEmbed(message, todoList, {
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

        /** @type {TodoSchema} */
        const newDoc = {
            user: message.author.id,
            list: [item]
        }

        if (!todoData) await new todo(newDoc).save()
        else await todoData.updateOne({ $push: { list: item } })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            fieldName: 'Added the following item to your to-do list:', fieldValue: item
        }))
    }

    /**
     * The `remove` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} item The item you want to add or remove from the FAQ list
     * @param {string[]} todoList The to-do list
     * @param {TodoSchema} todoData The existent to-do document
     */
    async remove(message, item, todoList, todoData) {
        if (!item) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            item = Math.abs(Number.parseInt(value || 0) || 0)
        }

        if (!todoData || todoList.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'Your to-do list is empty.'
            }))
        }

        if (item > todoList.length) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That\'s not a valid item number inside your to-do list.'
            }))
        }

        item--
        await todoData.updateOne({ $pull: { list: todoList[item] } })
        item++

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Removed item \`${item}\` from your to-do list.`
        }))
    }
}