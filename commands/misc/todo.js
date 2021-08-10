const { Command, CommandoMessage } = require('discord.js-commando')
const { todo: todoDocs } = require('../../utils/mongodb-schemas')
const { generateEmbed, basicEmbed } = require('../../utils/functions')
const { stripIndent } = require('common-tags')

module.exports = class todo extends Command {
    constructor(client) {
        super(client, {
            name: 'todo',
            aliases: ['to-do'],
            group: 'misc',
            memberName: 'todo',
            description: 'View your to-do list, or add/remove an item.',
            format: stripIndent`
                todo - Display your to-do list.
                todo add [item] - Add an item to yout to-do list.
                todo remove [number] - Remove an item from your to-do list.
            `,
            examples: ['todo add Make awesome commands', 'todo remove 2'],
            clientPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            args: [
                {
                    key: 'subCommand',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['add', 'remove'],
                    default: ''
                },
                {
                    key: 'item',
                    prompt: 'What item do you want to add/remove?',
                    type: 'string',
                    max: 512,
                    default: ''
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {string} args.subCommand The sub-command
     * @param {string|number} args.item The item to add/remove
     */
    async run(message, { subCommand, item }) {
        const { author } = message

        // tries to get the to-do list of the user
        const TODO = await todoDocs.findOne({ user: author.id })
        const todoList = TODO ? Array(...TODO.list) : undefined

        if (!subCommand) {
            if (!TODO || todoList.length === 0) return message.say(basicEmbed('blue', 'info', 'Your to-do list empty.'))

            // creates and returns the paged embed containing the to-do list
            return generateEmbed(message, todoList, {
                number: 5,
                authorName: `${author.username}'s to-do list`,
                authorIconURL: author.displayAvatarURL({ dynamic: true }),
                title: 'Item'
            })
        }

        if (subCommand.toLowerCase() === 'add') {
            if (!item) return message.say(basicEmbed('red', 'cross', 'Please specify the item you want to add to your to-do list.'))

            // creates a new doc
            const newDoc = {
                user: author.id,
                list: [item]
            }

            // adds the item to the to-do list
            if (!TODO) await new todoDocs(newDoc).save()
            else await TODO.updateOne({ $push: { list: item } })

            return message.say(basicEmbed('green', 'check', 'Added the following item to your to-do list:', item))
        }

        if (!item) return message.say(basicEmbed('red', 'cross', 'Please specify the number of item you want to remove from your to-do list.'))

        if (!TODO || todoList.length === 0) return message.say(basicEmbed('blue', 'info', 'Your to-do list empty.'))

        if (item <= 0 || item > todoList.length) return message.say(basicEmbed('red', 'cross', 'That\'s not a valid item number inside your to-do list.'))

        // removes the item from the to-do list
        await TODO.updateOne({ $pull: { list: todoList[--item] } })

        message.say(basicEmbed('green', 'check', `Removed item \`${++item}\` from your to-do list.`))
    }
}