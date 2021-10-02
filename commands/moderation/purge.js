const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { User, Collection, Message, ChannelLogsQueryOptions } = require('discord.js')
const { validURL, basicEmbed, userDetails, getArgument } = require('../../utils')
const { stripIndent, oneLine } = require('common-tags'),
    /** @type {number} */
    days14 = require('../../utils').myMs('14d')

/**
 * Bulk deletes the provided messages
 * @param {CommandoMessage} msg The message the command is being run for
 * @param {Collection<string,Message>} messages The messages to delete
 */
async function bulkDelete(msg, messages) {
    if (messages.length === 0) {
        return await msg.replyEmbed(basicEmbed({
            color: 'RED', emoji: 'cross', description: 'I couldn\'t find any messages.'
        }))
    }

    /** @type {Collection<string,Message>} */
    const bulk = await msg.channel.bulkDelete(messages)

    const embed = basicEmbed({
        color: 'GREEN', emoji: 'check', description: `Deleted ${bulk.size} messages.`
    })

    const _msg = await msg.fetch().catch(() => null)

    if (!_msg.deleted) {
        await msg.replyEmbed(embed)
        await msg.delete()
    }
    else {
        await msg.embed(embed)
    }
}

/**
 * Fetches messages in the channel the command is being run in
 * @param {Message} msg The message the command is being run for
 * @param {ChannelLogsQueryOptions} options The filtering options for the fetch
 */
async function fetchMessages(msg, options) {
    /** @type {Collection<string, Message>} */
    const fetch = await msg.channel.messages.fetch(options).catch(() => null)
    const msgs = fetch?.filter(m => {
        const isPinned = m.pinned
        const isOver14 = (Date.now() - m.createdTimestamp) >= days14

        return !isPinned && !isOver14
    })

    return msgs
}

/** A command that can be run in a client */
module.exports = class PurgeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'purge',
            group: 'mod',
            description: 'Delete a number of messages from a channel (limit of 100).',
            details: stripIndent`
                \`number\` has be a number from 1 to 100.
                ${userDetails}
                \`msg id\` has to be a message's id that's in the **same channel** as where you use this command.
            `,
            format: stripIndent`
                purge [number] <all> - Deletes all messages.
                purge [number] links - Deletes messages with links.
                purge [number] files - Deletes messages with files.
                purge [number] embeds - Deletes messages with embeds.
                purge [number] users - Deletes messages sent by users.
                purge [number] bots - Deletes messages sent by bots.
                purge [number] user [user] - Deletes messages sent by \`user\`.
                purge [number] before [msg id] - Deletes messages sent before \`msg id\`.
                purge [number] after [msg id] - Deletes messages sent after \`msg id\`.
                purge [number] match [text] - Deletes messages matching \`text\`.
                purge [number] startswith [text] - Deletes messages starting with \`text\`.
                purge [number] endswith [text] - Deletes messages ending with \`text\`.
            `,
            examples: [
                'purge 20',
                'purge 69 bots',
                'purge 100 user Pixoll',
                'purge 20 before 889929422294102026',
                'purge 50 match @everyone'
            ],
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'amount',
                    label: 'number',
                    prompt: 'How many messages do you want to delete?',
                    type: 'integer',
                    min: 1,
                    max: 100
                },
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command would like to use?',
                    oneOf: [
                        'all', 'links', 'files', 'embeds', 'users', 'bots', 'user',
                        'before', 'after', 'match', 'startswith', 'endswith'
                    ],
                    type: 'string',
                    default: 'all'
                },
                {
                    key: 'filter',
                    prompt: oneLine`
                        What filter would like to use? This can be an \`user\`, a
                        \`msg id\` or just \`text\` depending on the sub-command used.
                    `,
                    type: ['user', 'message', 'string'],
                    required: false
                }
            ]
        })
    }

    /**
     * @typedef {'all'|'links'|'files'|'embeds'|'users'|'bots'|
     * 'user'|'match'|'startswith'|'endswith'|'before'|'after'} SubCommand
     */

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {number} args.amount The amount of messages to delete
     * @param {SubCommand} args.subCommand The sub-command to use
     * @param {User|Message|string} args.filter The filter to use for the deleted messages
     */
    async run(message, { amount, subCommand, filter }) {
        subCommand = subCommand.toLowerCase()

        switch (subCommand) {
            case 'all':
                return await this.all(message, amount)
            case 'links':
                return await this.links(message, amount)
            case 'files':
                return await this.files(message, amount)
            case 'embeds':
                return await this.embeds(message, amount)
            case 'users':
                return await this.users(message, amount)
            case 'bots':
                return await this.bots(message, amount)
            case 'user':
                return await this.user(message, amount, filter)
            case 'before':
                return await this.before(message, amount, filter)
            case 'after':
                return await this.after(message, amount, filter)
            case 'match':
                return await this.match(message, amount, filter)
            case 'startswith':
                return await this.startsWith(message, amount, filter)
            case 'endswith':
                return await this.endsWith(message, amount, filter)
        }
    }

    /**
     * The `after` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} amount The amount of messages to delete
     * @param {Message} filter The filter to use for the deleted messages
     */
    async after(message, amount, filter) {
        while (!(filter instanceof Message)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
            if (cancelled) return
            filter = value
        }

        const msgs = await fetchMessages(message, { limit: amount, after: filter.id })
        await bulkDelete(message, msgs)
    }

    /**
     * The `all` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} amount The amount of messages to delete
     */
    async all(message, amount) {
        const msgs = await fetchMessages(message, { limit: amount, before: message.id })
        await bulkDelete(message, msgs)
    }

    /**
     * The `before` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} amount The amount of messages to delete
     * @param {Message} filter The filter to use for the deleted messages
     */
    async before(message, amount, filter) {
        while (!(filter instanceof Message)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
            if (cancelled) return
            filter = value
        }

        const msgs = await fetchMessages(message, { limit: amount, before: filter.id })
        await bulkDelete(message, msgs)
    }

    /**
     * The `bots` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} amount The amount of messages to delete
     */
    async bots(message, amount) {
        const msgs = await fetchMessages(message, { limit: amount, before: message.id })
        const filtered = msgs.filter(msg => msg.author.bot)
        await bulkDelete(message, filtered)
    }

    /**
     * The `embeds` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} amount The amount of messages to delete
     */
    async embeds(message, amount) {
        const msgs = await fetchMessages(message, { limit: amount, before: message.id })
        const filtered = msgs.filter(msg => msg.embeds.length !== 0)
        await bulkDelete(message, filtered)
    }

    /**
     * The `endswith` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} amount The amount of messages to delete
     * @param {User|Message|string} filter The filter to use for the deleted messages
     */
    async endsWith(message, amount, filter) {
        filter = filter?.toString()
        while (!filter) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
            if (cancelled) return
            filter = value
        }

        const msgs = await fetchMessages(message, { limit: amount, before: message.id })
        const filtered = msgs.filter(msg => msg.content.endsWith(filter.toString()))
        await bulkDelete(message, filtered)
    }

    /**
     * The `files` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} amount The amount of messages to delete
     */
    async files(message, amount) {
        const msgs = await fetchMessages(message, { limit: amount, before: message.id })
        const filtered = msgs.filter(msg => msg.attachments.size !== 0)
        await bulkDelete(message, filtered)
    }

    /**
     * The `links` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} amount The amount of messages to delete
     */
    async links(message, amount) {
        const msgs = await fetchMessages(message, { limit: amount, before: message.id })
        const filtered = msgs.filter(msg => {
            for (const str of msg.content.split(/ +/)) {
                if (validURL(str)) return true
            }
        })
        await bulkDelete(message, filtered)
    }

    /**
     * The `match` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} amount The amount of messages to delete
     * @param {User|Message|string} filter The filter to use for the deleted messages
     */
    async match(message, amount, filter) {
        filter = filter?.toString()
        while (!filter) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
            if (cancelled) return
            filter = value
        }

        const msgs = await fetchMessages(message, { limit: amount, before: message.id })
        const filtered = msgs.filter(msg => msg.content.includes(filter.toString()))
        await bulkDelete(message, filtered)
    }

    /**
     * The `startswith` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} amount The amount of messages to delete
     * @param {User|Message|string} filter The filter to use for the deleted messages
     */
    async startsWith(message, amount, filter) {
        filter = filter?.toString()
        while (!filter) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
            if (cancelled) return
            filter = value
        }

        const msgs = await fetchMessages(message, { limit: amount, before: message.id })
        const filtered = msgs.filter(msg => msg.content.startsWith(filter.toString()))
        await bulkDelete(message, filtered)
    }

    /**
     * The `user` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} amount The amount of messages to delete
     * @param {User} filter The filter to use for the deleted messages
     */
    async user(message, amount, filter) {
        while (!(filter instanceof User)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
            if (cancelled) return
            filter = value
        }

        const msgs = await fetchMessages(message, { limit: amount, before: message.id })
        const filtered = msgs.filter(msg => msg.author.id === filter.id)
        await bulkDelete(message, filtered)
    }

    /**
     * The `users` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {number} amount The amount of messages to delete
     */
    async users(message, amount) {
        const msgs = await fetchMessages(message, { limit: amount, before: message.id })
        const filtered = msgs.filter(msg => !msg.author.bot)
        await bulkDelete(message, filtered)
    }
}