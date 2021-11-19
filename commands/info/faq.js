/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const { Collection } = require('discord.js')
const { stripIndent } = require('common-tags')
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
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
            format: stripIndent`
                faq <view> - Display the FAQ list.
                faq add - Add a new entry to the FAQ list (bot's owner only).
                faq remove [item] - Remove entries from the FAQ list (bot's owner only).
                faq clear - Remove every entry in the FAQ list (bot's owner only).
            `,
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
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'view',
                        description: 'Display the FAQ list.'
                    },
                    {
                        type: 'subcommand',
                        name: 'add',
                        description: 'Add a new entry to the FAQ list (bot\'s owner only).',
                        options: [
                            {
                                type: 'string',
                                name: 'question',
                                description: 'The question to add to the FAQ list.',
                                required: true
                            },
                            {
                                type: 'string',
                                name: 'answer',
                                description: 'The question\'s answer.',
                                required: true
                            }
                        ]
                    },
                    {
                        type: 'subcommand',
                        name: 'remove',
                        description: 'Remove entries from the FAQ list (bot\'s owner only).',
                        options: [{
                            type: 'integer',
                            name: 'item',
                            description: 'The item to remove from the FAQ list.',
                            required: true,
                            minValue: 1
                        }]
                    },
                    {
                        type: 'subcommand',
                        name: 'clear',
                        description: 'Remove every entry in the FAQ list (bot\'s owner only).'
                    },
                ]
            }
        })

        this.db = this.client.database.faq
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'add'|'remove'|'view'|'clear'} args.subCommand The sub-command to use
     * @param {number} args.item The item you want to add or remove from the FAQ list
     */
    async run({ message, interaction }, { subCommand, item }) {
        let question, answer
        if (interaction) {
            const { options } = interaction
            subCommand = options.getSubcommand()
            if (subCommand === 'remove') item = options.getInteger('item')
            if (subCommand === 'add') {
                question = options.getString('question')
                answer = options.getString('answer')
            }
        }

        subCommand = subCommand.toLowerCase()
        const faqData = await this.db.fetchMany()

        switch (subCommand) {
            case 'view':
                return await this.view({ message, interaction }, faqData)
            case 'add':
                return await this.add({ message, interaction }, question, answer)
            case 'remove':
                return await this.remove({ message, interaction }, item, faqData)
            case 'clear':
                return await this.clear({ message, interaction }, faqData)
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {Collection<string, FaqSchema>} faqData The faq data
     */
    async view({ message, interaction }, faqData) {
        if (faqData.size === 0) {
            const embed = basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'The FAQ list is empty.'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        await generateEmbed({ message, interaction }, faqData.toJSON(), {
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
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {?string} question The question to add
     * @param {?string} answer The question's answer
     */
    async add({ message, interaction }, question, answer) {
        if (!this.client.isOwner(message || interaction.user)) {
            return await this.onBlock({ message, interaction }, 'ownerOnly')
        }

        if (!question) {
            const questionMsg = await basicCollector({ message, interaction }, {
                fieldName: 'What question do you want to answer?'
            }, { time: myMs('2m') })
            if (!questionMsg) return
            question = questionMsg.content
        }

        if (!answer) {
            const answerMsg = await basicCollector({ message, interaction }, {
                fieldName: 'Now, what would be it\'s answer?'
            }, { time: myMs('2m') })
            if (!answerMsg) return
            answer = answerMsg.content
        }

        await this.db.add({ question, answer })

        const embed = basicEmbed({
            color: 'GREEN', emoji: 'check', description: 'The new entry has been added to the FAQ list.'
        })
        await interaction?.editReply({ embeds: [embed] })
        await message?.replyEmbed(embed)
    }

    /**
     * The `remove` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {number} item The item you want to remove from the FAQ list
     * @param {Collection<string, FaqSchema>} faqData The faq data
     */
    async remove({ message, interaction }, item, faqData) {
        if (!this.client.isOwner(message || interaction.user)) {
            return await this.onBlock({ message, interaction }, 'ownerOnly')
        }

        if (message && !item) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            item = value
        }

        if (faqData.size === 0) {
            const embed = basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'The FAQ list is empty.'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        const doc = faqData.first(item).pop()
        if (!doc) {
            const embed = basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That item is not valid inside the FAQ list.'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        await this.db.delete(doc)

        const embed = basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: `Removed entry ${item} from the FAQ list.`
        })
        await interaction?.editReply({ embeds: [embed] })
        await message?.replyEmbed(embed)
    }

    /**
     * The `clear` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {Collection<string, FaqSchema>} faqData The faq data
     */
    async clear({ message, interaction }, faqData) {
        if (!this.client.isOwner(message || interaction.user)) {
            return await this.onBlock({ message, interaction }, 'ownerOnly')
        }

        if (faqData.size === 0) {
            const embed = basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'The FAQ list is empty.'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        const confirmed = await confirmButtons({ message, interaction }, 'clear the FAQ list')
        if (!confirmed) return

        for (const doc of faqData.toJSON()) {
            await this.db.delete(doc)
        }

        const embed = basicEmbed({
            color: 'GREEN', emoji: 'check', description: 'The FAQ list has been cleared.'
        })
        await interaction?.editReply({ embeds: [embed] })
        await message?.replyEmbed(embed)
    }
}