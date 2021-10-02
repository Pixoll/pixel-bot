const { stripIndent } = require('common-tags')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { generateEmbed, basicEmbed, basicCollector, getArgument, myMs } = require('../../utils')
const { faq } = require('../../mongo/schemas')
const { FaqSchema } = require('../../mongo/typings')

/** A command that can be run in a client */
module.exports = class FaqCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'faq',
            group: 'info',
            description: 'Displays the frequently asked questions (FAQ) related to the bot\'s functionality and support.',
            format: stripIndent`
                faq <view> - Display the FAQ list.
                faq add - Add a new question to the FAQ list (bot's owner only).
                faq remove [item] - Remove a question from the FAQ list (bot's owner only).
            `,
            guarded: true,
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
                    prompt: 'What item do you want to remove from the FAQ list?',
                    type: 'integer',
                    min: 1,
                    required: false
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {'add'|'remove'|'view'} args.subCommand The sub-command
     * @param {number} args.item The item you want to add or remove from the FAQ list
     */
    async run(message, { subCommand, item }) {
        subCommand = subCommand.toLowerCase()
        const FAQ = await faq.find({})

        switch (subCommand) {
            case 'view':
                return await this.view(message, FAQ)
            case 'add':
                return await this.add(message)
            case 'remove':
                return await this.remove(message, item, FAQ)
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {FaqSchema[]} faqData The faq data
     */
    async view(message, faqData) {
        if (faqData.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'The FAQ list is empty.'
            }))
        }

        await generateEmbed(message, faqData, {
            number: 5,
            authorName: 'Frequently asked questions',
            authorIconURL: this.client.user.displayAvatarURL({ dynamic: true }),
            keys: ['answer'],
            keyTitle: { suffix: 'question' }
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

        const answer = await basicCollector(question, {
            fieldName: 'Now, what would be it\'s answer?'
        }, { time: myMs('2m') })
        if (!answer) return

        /** @type {FaqSchema} */
        const newDoc = {
            question: question.content,
            answer: answer.content
        }

        await new faq(newDoc).save()

        await answer.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: 'The new question has been added to the FAQ list.'
        }))
    }

    /**
     * The `remove` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} item The item you want to remove from the FAQ list
     * @param {FaqSchema[]} faqData The faq data
     */
    async remove(message, item, faqData) {
        if (!this.client.isOwner(message)) {
            return await this.onBlock(message, 'ownerOnly')
        }

        if (!item) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            item = value
        }

        if (faqData.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'The FAQ list is empty.'
            }))
        }

        if (item > faqData.length) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That\'s not a valid item number inside the FAQ list.'
            }))
        }

        item--
        await faqData[item].deleteOne()
        item++

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Removed question \`${item}\` from the FAQ list.`
        }))
    }
}