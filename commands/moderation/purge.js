const { Command, CommandoMessage } = require('discord.js-commando')
const { User, Collection, Message } = require('discord.js')
const { validURL, basicEmbed } = require('../../utils/functions')
const { stripIndent } = require('common-tags')
const { ms } = require('../../utils/custom-ms')

/**
 * filters the messages according to the specfied filter
 * @param {CommandoMessage[]} messages the messages to filter
 * @param {string} subCommand the type of subCommand
 * @param {string|User} filter the special filter
 */
function filterMessages(messages, subCommand, filter) {
    if (subCommand === 'links') return messages.filter(({ content, embeds }) => validURL(content) || embeds.filter(({ type }) => ['article', 'link'].includes(type)))
    if (subCommand === 'files') return messages.filter(({ attachments }) => attachments.size >= 1)
    if (subCommand === 'embeds') return messages.filter(({ embeds }) => embeds.length >= 1)
    if (subCommand === 'humans') return messages.filter(({ author }) => !author.bot)
    if (subCommand === 'bots') return messages.filter(({ author }) => author.bot)

    if (subCommand === 'match') return messages.filter(({ content }) => content.includes(filter.toString()))
    if (subCommand === 'startswith') return messages.filter(({ content }) => content.startsWith(filter.toString()))
    if (subCommand === 'endswith') return messages.filter(({ content }) => content.endsWith(filter.toString()))

    if (typeof filter === 'string') return
    if (subCommand === 'user') return messages.filter(({ author }) => author.id === filter.id)
}

/**
 * bulk deletes the provided messages
 * @param {CommandoMessage} message the command message
 * @param {CommandoMessage[]} messages the messages to delete
 */
async function bulkDelete(message, messages) {
    if (messages.length === 0) return message.say(basicEmbed('red', 'cross', 'I couldn\'t find any messages.'))

    await message.delete().catch(() => null)
    const bulk = await message.channel.bulkDelete(messages)
    return message.say(basicEmbed('green', 'check', `Deleted ${bulk.size} messages.`)).then(msg => msg.delete({ timeout: 5000 }).catch(() => null))
}

/**
 * filters the fetched messages
 * @param {Message} msg the message to filter
 */
function msgFilter(msg) {
    const isPinned = msg.pinned
    const ageStr = ms(Date.now() - msg.createdTimestamp)
    const isOver14 = ms(ageStr) >= ms('14d')

    return !isPinned && !isOver14
}

module.exports = class purge extends Command {
    constructor(client) {
        super(client, {
            name: 'purge',
            group: 'mod',
            memberName: 'purge',
            description: 'Delete a number of messages from a channel (limit of 100).',
            details: stripIndent`
                \`number\` has be a number from 1 to 100.
                \`user\` can be a user's username, ID or mention.
            `,
            format: stripIndent`
                purge [number] - Deletes all messages.
                purge links [number] - Deletes messages with links.
                purge files [number] - Deletes messages with files.
                purge embeds [number] - Deletes messages with embeds.
                purge users [number] - Deletes messages sent by users.
                purge bots [number] - Deletes messages sent by bots.
                purge user [user] [number] - Deletes messages sent by \`user\`.
                purge match [text] [number] - Deletes messages matching \`text\`.
                purge startswith [text] [number] - Deletes messages starting with \`text\`.
                purge endswith [text] [number] - Deletes messages ending with \`text\`.
            `,
            examples: ['purge 20', 'purge bots 69', 'purge user Pixoll 100', 'purge match Pixoll sucks 50'],
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    prompt: 'How many messages do you want to delete? or what sub-command would like to use?',
                    type: 'integer|string'
                },
                {
                    key: 'filter',
                    prompt: 'How many messages do you want to delete? or what filter would like to use?',
                    type: 'user|integer|string',
                    default: ''
                },
                {
                    key: 'number',
                    prompt: 'How many messages do you want to delete?',
                    type: 'integer',
                    default: '',
                    min: 1,
                    max: 100
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {number|string} args.subCommand The member to change/remove their nick
     * @param {User|number|string} args.filter The new nickname
     * @param {number} args.number The new nickname
     */
    async run(message, { subCommand, filter, number }) {
        // gets the last 100 messages
        /** @type {Collection<string, Message>} */
        const fetch = await message.channel.messages.fetch({ limit: 100, before: message.id }, false, true).catch(() => null)
        const messages = fetch.filter(msgFilter).map(msg => msg)

        if (typeof subCommand === 'number') {
            if (subCommand < 1 || subCommand > 100) return message.say(basicEmbed('red', 'cross', 'Please enter a number from 1 to 100.'))
            const toDelete = messages.slice(0, subCommand)
            return await bulkDelete(message, toDelete)
        }

        subCommand = subCommand.toLowerCase()
        const subCommands = ['links', 'files', 'embeds', 'users', 'bots', 'user', 'match', 'startswith', 'endswith']
        if (!subCommands.includes(subCommand)) return message.say(basicEmbed('red', 'cross', 'That sub-command does not exist.'))

        if (!filter) return message.say(basicEmbed('red', 'cross', 'You didn\'t specify the number of messages to delete, or the filter to use.'))

        if (['links', 'files', 'embeds', 'humans', 'bots'].includes(subCommand) && typeof filter === 'number') {
            if (filter < 1 || filter > 100) return message.say(basicEmbed('red', 'cross', 'Please enter a number from 1 to 100.'))
            const toDelete = filterMessages(messages, subCommand).slice(0, filter)
            return await bulkDelete(message, toDelete)
        }

        if (!number) return message.say(basicEmbed('red', 'cross', 'You didn\'t specify the number of messages to delete.'))

        if (typeof filter === 'number') filter = filter.toString()

        const toDelete = filterMessages(messages, subCommand, filter)?.slice(0, number)
        if (!toDelete) return message.say(basicEmbed('red', 'cross', 'That user does not exist.'))
        await bulkDelete(message, toDelete)
    }
}