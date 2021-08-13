const { stripIndent } = require('common-tags')
const { Command, CommandoMessage } = require('discord.js-commando')
const { generateEmbed, basicEmbed } = require('../../utils/functions')
const { faq: faqDocs } = require('../../utils/mongo/schemas')

module.exports = class faq extends Command {
    constructor(client) {
        super(client, {
            name: 'faq',
            group: 'info',
            memberName: 'faq',
            description: 'Displays the frequently asked questions (FAQ) related to my functionality and support.',
            format: stripIndent`
                faq - Display the FAQ list.
                faq add - Add a new question to the FAQ list (bot's owner only).
                faq remove [item] - Remove a question from the FAQ list (bot's owner only).
            `,
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
                    prompt: 'What item do you want to remove from the FAQ list?',
                    type: 'integer',
                    min: 1,
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
     * @param {number} args.item The item you want to add or remove from the FAQ list
     */
    async run(message, { subCommand, item }) {
        const { author, channel } = message

        // gets the FAQ document from mongodb
        const FAQ = await faqDocs.find({})

        if (!subCommand) {
            if (FAQ.length === 0) {
                return message.say(basicEmbed('blue', 'info', 'The FAQ list is empty.'))
            }

            // creates and returns the paged embed containing the FAQ list
            return await generateEmbed(message, FAQ, {
                number: 5,
                authorName: 'Frequently asked questions',
                authorIconURL: this.client.user.displayAvatarURL({ dynamic: true }),
                keys: ['answer'],
                keyTitle: { suffix: 'question' }
            }, true)
        }

        // checks if the user using the command is a bot owner
        if (!this.client.isOwner(author)) {
            this.client.emit('commandBlock', message, 'permission')
            return
        }

        if (subCommand.toLowerCase() === 'add') {
            const questions = [
                'What question do you want to answer? Type `cancel` to at any time to cancel creation.',
                'Now, what would be it\'s answer?'
            ]

            // creates the collector
            const collector = channel.createMessageCollector(msg => msg.author.id === message.author.id, {
                max: questions.length,
                time: 300000
            })
            var answered, counter = 0

            // sends the first question
            message.reply(questions[counter++])

            collector.on('collect', /** @param {CommandoMessage} msg */ async ({ content }) => {
                // checks if the collector has been cancelled
                if (content.toLowerCase() === 'cancel') {
                    message.reply('The new question creation has been cancelled.')
                    return answered = true, collector.stop()
                }

                // checks if the question is over 128 characters and if the answer is over 512 characters
                if (counter === 1 && content.length > 128) {
                    message.say(basicEmbed('red', 'cross', 'Make sure the question is not longer than 128 characters.'))
                    return answered = true, collector.stop()
                }
                if (counter === 2 && content.length > 512) {
                    message.say(basicEmbed('red', 'cross', 'Make sure the answer is not longer than 512 characters.'))
                    return answered = true, collector.stop()
                }

                // sends the next question
                if (counter < questions.length) message.reply(questions[counter++])
            })

            collector.on('end', async collected => {
                if (answered) return
                if (collected.size < questions.length) {
                    return message.say(basicEmbed('red', 'cross', 'You didn\'t answer in time or there was an error while creating your new question.'))
                }

                const [question, answer] = collected.map(({ content }) => content)

                // creates the new document that will be saved into the FAQ list
                const newDoc = { question, answer }

                // adds the new item to the FAQ list
                await new faqDocs(newDoc).save()

                message.say(basicEmbed('green', 'check', 'The new question has been added to the FAQ list.'))
            })

            return
        }

        if (!item) return message.say(basicEmbed('red', 'cross', 'Please specify the number of item you want to remove from the FAQ list.'))

        if (!FAQ || FAQ.length === 0) return message.say(basicEmbed('blue', 'info', 'The FAQ list is empty.'))

        if (item <= 0 || item > FAQ.length) return message.say(basicEmbed('red', 'cross', 'That\'s not a valid item number inside the FAQ list.'))

        // removes the item from the FAQ list
        await FAQ[--item].deleteOne()

        message.say(basicEmbed('green', 'check', `Removed item \`${++item}\` from the FAQ list.`))
    }
}