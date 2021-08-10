const { Command, CommandoMessage } = require('discord.js-commando')
const { MessageEmbed, TextChannel } = require('discord.js')
const { ms } = require('../../utils/custom-ms')
const { polls } = require('../../utils/mongodb-schemas')
const { stripIndent } = require('common-tags')
const { formatTime, basicEmbed } = require('../../utils/functions')

const emojiRegex = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}\u{200d}]*/ug

/**
 * looks for valid emojis in the provided string
 * @param {string} string the string to look emojis in
 * @param {string[]} emojis all the available GuildEmojis
 * @returns {string[]}
 */
function findEmojis(string, emojis) {
    return string.split(/ +/).map(str => {
        const guildEmoji = emojis.find(emoji => emoji === str.substr(-19, 18))

        if (!guildEmoji && !str.replace(emojiRegex, '')) return str
        return guildEmoji
    }).filter(e => e)
}

module.exports = class poll extends Command {
    constructor(client) {
        super(client, {
            name: 'poll',
            group: 'utility',
            memberName: 'poll',
            description: 'Create or end a poll.',
            details: stripIndent`
                \`channel\` can be a text channel's name, ID or mention.
                \`duration\` uses the command time formatting, for more information use the \`help\` command, and has to be at least 1 minute.
                You'll be asked for the message to use for the poll, and the emojis the bot should react with to that message.
            `,
            format: stripIndent`
                poll create [channel] [duration] - Create a poll.
                poll end <channel> - End the oldest poll.
            `,
            examples: ['poll create polls 12h', 'poll end #polls'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    prompt: 'Do you want to create or end a poll?',
                    type: 'string',
                    oneOf: ['create', 'end']
                },
                {
                    key: 'channel',
                    prompt: 'On what channel do you want to end a poll?',
                    type: 'text-channel',
                    default: ''
                },
                {
                    key: 'duration',
                    prompt: 'What is the duration of the new poll?',
                    type: 'string',
                    default: '',
                    /** @param {string|number} time */
                    parse: (time) => formatTime(time),
                    /** @param {string|number} time @param {CommandoMessage} message */
                    validate: (time, message) => {
                        const subCommand = message.parseArgs().split(/ +/).shift().toLowerCase()
                        if (subCommand === 'end') return true
                        return !!formatTime(time) && formatTime(time) >= 60 * 1000
                    },
                    error: 'You either didn\'t use the correct format, or the duration is less that 1 minute. Please provide a valid duration.'
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {string} args.subCommand The sub-command to use
     * @param {TextChannel} args.channel The text channel of the poll
     * @param {number} args.duration The duration of the poll
     */
    async run(message, { subCommand, channel, duration }) {
        const { guild, author } = message
        const channels = guild.channels.cache
        const allEmojis = this.client.emojis.cache.map(({ id }) => id)

        if (subCommand.toLowerCase() === 'create') {
            if (!channel) return message.say(basicEmbed('red', 'cross', 'Please specify a text channel where to create the poll.'))
            if (!duration) return message.say(basicEmbed('red', 'cross', 'Please specify the duration of the poll.'))

            const longTime = ms(duration, { long: true })

            const questions = [
                'What will the message of the poll be? Type `cancel` to at any time to cancel creation.',
                'Now, what emojis should the bot react with in the poll message?'
            ]

            // creates the collector
            const collector = message.channel.createMessageCollector(msg => msg.author.id === author.id, {
                max: questions.length,
                time: 300000
            })
            var answered, counter = 0

            // sends the first question
            message.reply(questions[counter++])

            collector.on('collect', /** @param {CommandoMessage} msg */ async ({ content }) => {
                // checks if the collector has been cancelled
                if (content.toLowerCase() === 'cancel') {
                    message.reply('The poll creation has been cancelled.')
                    return answered = true, collector.stop()
                }

                if (counter === 1 && content.length > 2000) {
                    message.say(basicEmbed('red', 'cross', 'Make sure the message is not longer than 2000 characters.'))
                    return answered = true, collector.stop()
                }
                if (counter === 2) {
                    const emojis = findEmojis(content, allEmojis)

                    if (emojis.length < 2) {
                        message.say(basicEmbed('red', 'cross', 'Make sure you send at least 2 emojis separated by a space.'))
                        return answered = true, collector.stop()
                    }
                }

                // sends the next question
                if (counter < questions.length) message.reply(questions[counter++])
            })

            collector.on('end', async collected => {
                if (answered) return
                if (collected.size < questions.length) {
                    return message.say(basicEmbed('red', 'cross', 'You didn\'t answer in time or there was an error while creating your new question.'))
                }

                const [pollMessage, emojiString] = collected.map(({ content }) => content)
                const emojis = findEmojis(emojiString, allEmojis)

                const msg = await channel.send(pollMessage)
                for (const emoji of emojis) await msg.react(emoji)

                const newDoc = {
                    guild: guild.id,
                    channel: channel.id,
                    message: msg.id,
                    emojis: emojis,
                    duration: longTime,
                    endsAt: Date.now() + duration
                }

                await new polls(newDoc).save()

                message.say(basicEmbed('green', 'check', `The poll was successfully created and is starting in ${channel}.`))
            })

            return
        }

        const pollData = await polls.findOne({ guild: guild.id, channel: channel?.id || message.channel.id })
        if (!pollData) return message.say(basicEmbed('red', 'cross', 'I couldn\'t find the poll you were looking for.'))

        const pollChannel = channels.get(pollData.channel)
        const msg = await pollChannel?.messages.fetch(pollData.message, true, true)
        if (!msg) return message.say(basicEmbed('red', 'cross', 'That poll or the channel were it was, was deleted.'))

        const reactions = msg.reactions.cache.map(r => r).filter(({ emoji }) => pollData.emojis.includes(emoji.id || emoji.name))

        var results = []
        for (const reaction of reactions) {
            const votes = reaction.count - 1
            const emoji = reaction.emoji.toString()
            results.push({ votes, emoji })
        }

        const winners = results.sort((a, b) => b.votes - a.votes).filter(({ votes }, i, arr) => arr[0].votes === votes)

        const winner = winners.length === 1 ? `The winner was the choice ${winners[0].emoji} with a total of \`${winners[0].votes}\` votes!` : ''
        const draw = winners.length > 1 ? `It seems like there was a draw between these choices: ${winners.map(({ emoji }) => emoji).join(', ')}` : ''
        const noVotes = results.filter(({ votes }) => votes === 0).length === results.length ? 'It seems like no one voted on this poll...' : ''

        const pollEmbed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${guild.name}'s polls`, guild.iconURL({ dynamic: true }))
            .setTitle('The poll has ended!')
            .setURL(msg.url)
            .setDescription(winner || noVotes || draw)
            .setTimestamp()

        if (!noVotes) pollEmbed.addField('These are the full results:', results.map(({ emoji, votes }) => `**>** Choice ${emoji} with \`${votes}\` votes`))

        pollChannel.send(pollEmbed)

        await pollData.deleteOne()
    }
}