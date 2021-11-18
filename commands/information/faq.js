/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const { Collection } = require('discord.js')
const { stripIndent } = require('common-tags')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { generateEmbed, basicEmbed, basicCollector, getArgument, myMs, confirmButtons } = require('../../utils')
const { FaqSchema } = require('../../schemas/types')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class FaqCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'faq',
            group: 'info',
            description: 'Displays the frequently asked questions (FAQ) related to the bot\'s functionality and support.',
            details: '`items` can be different **positive** numbers, separated by spaces.',
            format: stripIndent`
                faq <view> - Display the FAQ list.
                faq add - Add a new entry to the FAQ list (bot's owner only).
                faq remove [items] - Remove entries from the FAQ list (bot's owner only).
                faq clear - Remove every entry in the FAQ list (bot's owner only).
            `,
            examples: [
                'faq remove 2',
                'faq remove 3 8 1'
            ],
            guarded: true,
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
                    key: 'items',
                    prompt: 'What items do you want to remove from the FAQ list?',
                    type: 'integer',
                    min: 1,
                    required: false
                }
            ]
        })

        this.db = this.client.database.faq
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {'add'|'remove'|'view'|'clear'} args.subCommand The sub-command to use
     * @param {number[]} args.items The items you want to add or remove from the FAQ list
     */
    async run(message, { subCommand, items }) {
        subCommand = subCommand.toLowerCase()
        const faqData = await this.db.fetchMany()

        switch (subCommand) {
            case 'view':
                return await this.view(message, faqData)
            case 'add':
                return await this.add(message)
            case 'remove':
                return await this.remove(message, items, faqData)
            case 'clear':
                return await this.clear(message, faqData)
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Collection<string, FaqSchema>} faqData The faq data
     */
    async view(message, faqData) {
        if (faqData.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'The FAQ list is empty.'
            }))
        }

        await generateEmbed(message, faqData.toJSON(), {
            number: 5,
            authorName: 'Frequently asked questions',
            authorIconURL: this.client.user.displayAvatarURL({ dynamic: true }),
            keys: ['answer'],
            keyTitle: { suffix: 'question' },
            numbered: true
        })
    }

    /**
     * The `add` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async add(message) {
        if (!this.client.isOwner(message)) {
            return await this.onBlock(message, 'ownerOnly')
        }

        const question = await basicCollector(message, {
            fieldName: 'What question do you want to answer?'
        }, { time: myMs('2m') })
        if (!question) return

        const answer = await basicCollector(message, {
            fieldName: 'Now, what would be it\'s answer?'
        }, { time: myMs('2m') })
        if (!answer) return

        await this.db.add({
            question: question.content,
            answer: answer.content
        })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: 'The new entry has been added to the FAQ list.'
        }))
    }

    /**
     * The `remove` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number[]} items The items you want to remove from the FAQ list
     * @param {Collection<string, FaqSchema>} faqData The faq data
     */
    async remove(message, items, faqData) {
        if (!this.client.isOwner(message)) {
            return await this.onBlock(message, 'ownerOnly')
        }

        if (!items) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            items = value
        }

        if (faqData.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'The FAQ list is empty.'
            }))
        }

        const deleted = []
        for (const item of items) {
            const doc = faqData.first(item).pop()
            if (!doc) continue
            await this.db.delete(doc)
            faqData.set(`${doc._id}`, false)
            deleted.push(item)
        }

        if (deleted.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'None of the items are valid inside the FAQ list.'
            }))
        }

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: `Removed entries ${deleted.map(d => `\`${d}\``).join(', ')} from the FAQ list.`
        }))
    }

    /**
     * The `clear` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Collection<string, FaqSchema>} faqData The faq data
     */
    async clear(message, faqData) {
        if (faqData.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'The FAQ list is empty.'
            }))
        }

        const confirmed = await confirmButtons(message, 'clear the FAQ list')
        if (!confirmed) return

        for (const doc of faqData.toJSON()) {
            await this.db.delete(doc)
        }

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: 'The FAQ list has been cleared.'
        }))
    }
}