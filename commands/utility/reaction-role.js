const { Command, CommandoMessage } = require('discord.js-commando')
const { MessageEmbed, TextChannel, Role } = require('discord.js')
const { formatDate, basicEmbed } = require('../../utils/functions')
const { reactionRoles } = require('../../utils/mongodb-schemas')
const { stripIndent } = require('common-tags')

/**
 * looks for a message inside the provided channel
 * @param {string} msg the message to look for
 * @param {CommandoMessage} message the command message
 * @returns {Promise<CommandoMessage>}
 */
async function getMessage(msg, message) {
    const channels = message.guild.channels.cache

    const target = message.parseArgs().split(/ +/)[1]
    const channel = channels.get(target.replace(/[^0-9]/g, '')) || channels.find(({ name }) => name === target.toLowerCase())

    const reactionMessage = await channel.messages.fetch(msg).catch(() => null)
    return reactionMessage
}

/**
 * gets all the roles separated by commas
 * @param {string} string the string containing the roles
 * @param {CommandoMessage} message the command message
 * @returns {Role[]}
 */
function getRoles(string, message) {
    const isOwner = message.guild.ownerID === message.author.id
    const highestMember = message.member.roles.highest.position
    const highestBot = message.guild.members.cache.get(message.client.user.id).roles.highest.position
    const array = string.toLowerCase().split(/\s*,\s*/)

    const rolesList = []
    for (const str of array) {
        const role = message.guild.roles.cache.get(str.replace(/[^0-9]/g, '')) || message.guild.roles.cache.find(({ name }) => name.toLowerCase() === str)
        if (role) rolesList.push(role)
    }

    /** @param {number} position */
    function filter(position) {
        if (isOwner) return position < highestBot
        return position < highestMember && position < highestBot
    }
    return rolesList.filter(({ position }) => filter(position))
}

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

module.exports = class reactionrole extends Command {
    constructor(client) {
        super(client, {
            name: 'reactionrole',
            aliases: ['rrole'],
            group: 'utility',
            memberName: 'reactionrole',
            description: 'Create or remove reaction roles.',
            details: stripIndent`
                \`channel\` can be a text channel's name, ID or mention.
                \`message\` has to be a valid message ID inside \`channel\`.
                You'll be asked for the roles you wish to assign, and the emojis the bot should react with to that message.
                Those emojis work as toggable buttons for the specified roles.
            `,
            format: stripIndent`
                reactionrole create [channel] [message] - Create reaction roles.
                reactionrole remove [channel] [message] - Remove reaction roles.
            `,
            examples: ['reactionrole remove #self-roles', 'reactionrole remove #self-roles 826935004936142918'],
            clientPermissions: ['ADD_REACTIONS'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    prompt: 'Do you want to create or remove the reaction roles?',
                    type: 'string',
                    oneOf: ['create', 'remove']
                },
                {
                    key: 'channel',
                    prompt: 'On what channel do you want to create or remove the reaction roles?',
                    type: 'text-channel'
                },
                {
                    key: 'msg',
                    prompt: 'On what message do you want to create or remove the reaction roles?',
                    type: 'string',
                    /** @param {string} msg @param {CommandoMessage} message */
                    parse: async (msg, message) => await getMessage(msg, message),
                    /** @param {string} msg @param {CommandoMessage} message */
                    validate: async (msg, message) => await getMessage(msg, message),
                    error: 'You provided an invalid message. Please try again.'
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
     * @param {TextChannel} args.channel The text channel of the reaction messages
     * @param {CommandoMessage} args.msg The message of the reaction messages
     */
    async run(message, { subCommand, channel, msg }) {
        const { guild, author } = message
        const channels = guild.channels.cache
        const allEmojis = this.client.emojis.cache.map(({ id }) => id)

        const data = await reactionRoles.findOne({ guild: guild.id, channel: channel.id, message: msg.id })

        if (subCommand.toLowerCase() === 'create') {
            const questions = [
                'What are the roles that you want to assign? Please send them separated by commas. Type `cancel` to at any time to cancel creation.',
                'Now, what emojis should the bot react with in the message? These will be applied to the roles you specified in the same exact order.'
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

                const roles = getRoles(content, message).map(({ name }) => name)

                if (counter === 1 && roles.length === 0) {
                    message.say(basicEmbed('red', 'cross', 'Make sure the roles you sent can be given to other users.'))
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

                const [roleString, emojiString] = collected.map(({ content }) => content)
                const roles = getRoles(roleString, message).map(({ id }) => id)
                const emojis = findEmojis(emojiString, allEmojis)

                if (emojis.length !== roles.length) return message.say(basicEmbed('red', 'cross', 'Make sure you send the same amount of emojis as the roles.'))

                for (const emoji of emojis) await msg.react(emoji)

                const newDoc = {
                    guild: guild.id,
                    channel: channel.id,
                    message: msg.id,
                    roles: roles,
                    emojis: emojis
                }

                if (data) await data.updateOne(newDoc)
                else await new reactionRoles(newDoc).save()

                message.say(basicEmbed('green', 'check', `The reaction roles were successfully created at [this message](${msg.url}).`))
            })

            return
        }

        if (!data) return message.say(basicEmbed('red', 'cross', 'I couldn\'t find the reaction roles you were looking for.'))

        message.say(basicEmbed('green', 'check', `The reaction roles of [this message](${msg.url}) were successfully removed.`))

        await data.deleteOne()
    }
}