/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { User, Collection, Message, ChannelLogsQueryOptions } = require('discord.js')
const { validURL, basicEmbed, getArgument, sleep, replyAll } = require('../../utils/functions')
const { stripIndent, oneLine } = require('common-tags')
/* eslint-enable no-unused-vars */

// /** @type {number} */
const days14 = require('../../utils/my-ms')('14d')
const integerOption = [{
    type: 'integer',
    name: 'amount',
    description: 'The amount of messages to delete.',
    required: true
}]

/**
 * Bulk deletes the provided messages
 * @param {CommandInstances} instances The instances the command is being run for
 * @param {Collection<string,Message>} messages The messages to delete
 */
async function bulkDelete({ message, interaction }, messages) {
    if (messages.length === 0) {
        return await replyAll({ message, interaction }, basicEmbed({
            color: 'RED', emoji: 'cross', description: 'I couldn\'t find any messages.'
        }))
    }

    const { channel } = message || interaction
    const ref = message || await interaction.fetchReply()
    messages = messages.filter(msg => msg.id !== ref.id)

    /** @type {Collection<string,Message>} */
    const bulk = await channel.bulkDelete(messages)

    const embed = basicEmbed({
        color: 'GREEN', emoji: 'check', description: `Deleted ${bulk.size} messages.`
    })

    const _msg = await message?.fetch().catch(() => null)
    const toDelete = await replyAll({ message, interaction }, embed)

    if (_msg && !_msg.deleted) await _msg?.delete().catch(() => null)

    await sleep(10)
    await toDelete?.delete().catch(() => null)
}

/**
 * Fetches messages in the channel the command is being run in
 * @param {CommandInstances} instances The instances the command is being run for
 * @param {ChannelLogsQueryOptions} options The filtering options for the fetch
 */
async function fetchMessages({ message, interaction }, options) {
    /** @type {Collection<string, Message>} */
    const fetch = await (message || interaction).channel.messages.fetch(options).catch(() => null)
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
                \`user\` has to be a user's username, id or mention.
                \`msg id\` has to be a message's id that's in the **same channel** as where you use this command.
            `,
            format: stripIndent`
                purge [number] <all> - Delete all messages.
                purge [number] links - Delete messages with links/urls.
                purge [number] files - Delete messages with files.
                purge [number] embeds - Delete messages with embeds.
                purge [number] users - Delete messages sent by users.
                purge [number] bots - Delete messages sent by bots.
                purge [number] user [user] - Delete messages sent by \`user\`.
                purge [number] before [msg id] - Delete messages sent before \`msg id\`.
                purge [number] after [msg id] - Delete messages sent after \`msg id\`.
                purge [number] match [text] - Delete messages matching \`text\`.
                purge [number] starts-with [text] - Delete messages starting with \`text\`.
                purge [number] ends-with [text] - Delete messages ending with \`text\`.
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
                        'before', 'after', 'match', 'starts-with', 'ends-with'
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
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'all',
                        description: 'Delete all messages.',
                        options: integerOption
                    },
                    {
                        type: 'subcommand',
                        name: 'links',
                        description: 'Delete messages with links/urls.',
                        options: integerOption
                    },
                    {
                        type: 'subcommand',
                        name: 'files',
                        description: 'Delete messages with files.',
                        options: integerOption
                    },
                    {
                        type: 'subcommand',
                        name: 'embeds',
                        description: 'Delete messages with embeds.',
                        options: integerOption
                    },
                    {
                        type: 'subcommand',
                        name: 'users',
                        description: 'Delete messages sent by users.',
                        options: integerOption
                    },
                    {
                        type: 'subcommand',
                        name: 'bots',
                        description: 'Delete messages sent by bots.',
                        options: integerOption
                    },
                    {
                        type: 'subcommand',
                        name: 'user',
                        description: 'Delete messages sent by a specific user.',
                        options: [
                            {
                                type: 'user',
                                name: 'user',
                                description: 'The user who sent the messages.',
                                required: true
                            },
                            ...integerOption
                        ]
                    },
                    {
                        type: 'subcommand',
                        name: 'before',
                        description: 'Delete messages sent before a specific message.',
                        options: [
                            {
                                type: 'string',
                                name: 'message-id',
                                description: 'The id of the message.',
                                required: true
                            },
                            ...integerOption
                        ]
                    },
                    {
                        type: 'subcommand',
                        name: 'after',
                        description: 'Delete messages sent after a specific message.',
                        options: [
                            {
                                type: 'string',
                                name: 'message-id',
                                description: 'The id of the message.',
                                required: true
                            },
                            ...integerOption
                        ]
                    },
                    {
                        type: 'subcommand',
                        name: 'match',
                        description: 'Delete messages matching a certain text.',
                        options: [
                            {
                                type: 'string',
                                name: 'text',
                                description: 'The text to match.',
                                required: true
                            },
                            ...integerOption
                        ]
                    },
                    {
                        type: 'subcommand',
                        name: 'starts-with',
                        description: 'Delete messages starting with a certain text.',
                        options: [
                            {
                                type: 'string',
                                name: 'text',
                                description: 'The text to match.',
                                required: true
                            },
                            ...integerOption
                        ]
                    },
                    {
                        type: 'subcommand',
                        name: 'ends-with',
                        description: 'Delete messages ending with a certain text.',
                        options: [
                            {
                                type: 'string',
                                name: 'text',
                                description: 'The text to match.',
                                required: true
                            },
                            ...integerOption
                        ]
                    }
                ]
            }
        })
    }

    /**
     * @typedef {'all'|'links'|'files'|'embeds'|'users'|'bots'|
     * 'user'|'match'|'starts-with'|'ends-with'|'before'|'after'} SubCommand
     */

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {number} args.amount The amount of messages to delete
     * @param {SubCommand} args.subCommand The sub-command to use
     * @param {User|Message|string} args.filter The filter to use for the deleted messages
     */
    async run({ message, interaction }, { amount, subCommand, filter, user, messageId, text }) {
        subCommand = subCommand.toLowerCase()

        if (interaction) {
            amount = Math.abs(amount > 100 ? 100 : amount)
            switch (subCommand) {
                case 'user':
                    filter = user.user ?? user
                    break
                case 'before':
                case 'after':
                    filter = await interaction.channel.messages.fetch(messageId).catch(() => null)
                    if (!filter) {
                        return await replyAll({ interaction }, basicEmbed({
                            color: 'RED', emoji: 'cross', description: 'The message id is invalid.'
                        }))
                    }
                    break
                case 'match':
                case 'starts-with':
                case 'ends-with':
                    filter = text
            }
        }

        switch (subCommand) {
            case 'all':
                return await this.all({ message, interaction }, amount)
            case 'links':
                return await this.links({ message, interaction }, amount)
            case 'files':
                return await this.files({ message, interaction }, amount)
            case 'embeds':
                return await this.embeds({ message, interaction }, amount)
            case 'users':
                return await this.users({ message, interaction }, amount)
            case 'bots':
                return await this.bots({ message, interaction }, amount)
            case 'user':
                return await this.user({ message, interaction }, amount, filter)
            case 'before':
                return await this.before({ message, interaction }, amount, filter)
            case 'after':
                return await this.after({ message, interaction }, amount, filter)
            case 'match':
                return await this.match({ message, interaction }, amount, filter)
            case 'starts-with':
                return await this.startsWith({ message, interaction }, amount, filter)
            case 'ends-with':
                return await this.endsWith({ message, interaction }, amount, filter)
        }
    }

    /**
     * The `after` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {number} amount The amount of messages to delete
     * @param {Message} filter The filter to use for the deleted messages
     */
    async after({ message, interaction }, amount, filter) {
        if (message) {
            while (!(filter instanceof Message)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
                if (cancelled) return
                filter = value
            }
        }

        const msgs = await fetchMessages({ message, interaction }, { limit: amount, after: filter.id })
        await bulkDelete({ message, interaction }, msgs)
    }

    /**
     * The `all` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {number} amount The amount of messages to delete
     */
    async all({ message, interaction }, amount) {
        const msgs = await fetchMessages({ message, interaction }, { limit: amount })
        await bulkDelete({ message, interaction }, msgs)
    }

    /**
     * The `before` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {number} amount The amount of messages to delete
     * @param {Message} filter The filter to use for the deleted messages
     */
    async before({ message, interaction }, amount, filter) {
        if (message) {
            while (!(filter instanceof Message)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
                if (cancelled) return
                filter = value
            }
        }

        const msgs = await fetchMessages({ message, interaction }, { limit: amount, before: filter.id })
        await bulkDelete({ message, interaction }, msgs)
    }

    /**
     * The `bots` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {number} amount The amount of messages to delete
     */
    async bots({ message, interaction }, amount) {
        const msgs = await fetchMessages({ message, interaction }, { limit: amount })
        const filtered = msgs.filter(msg => msg.author.bot)
        await bulkDelete({ message, interaction }, filtered)
    }

    /**
     * The `embeds` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {number} amount The amount of messages to delete
     */
    async embeds({ message, interaction }, amount) {
        const msgs = await fetchMessages({ message, interaction }, { limit: amount })
        const filtered = msgs.filter(msg => msg.embeds.length !== 0)
        await bulkDelete({ message, interaction }, filtered)
    }

    /**
     * The `endswith` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {number} amount The amount of messages to delete
     * @param {User|Message|string} filter The filter to use for the deleted messages
     */
    async endsWith({ message, interaction }, amount, filter) {
        if (message && !filter) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
            if (cancelled) return
            filter = value
        }
        filter = filter.toString()

        const msgs = await fetchMessages({ message, interaction }, { limit: amount })
        const filtered = msgs.filter(msg => msg.content.toLowerCase().endsWith(filter))
        await bulkDelete({ message, interaction }, filtered)
    }

    /**
     * The `files` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {number} amount The amount of messages to delete
     */
    async files({ message, interaction }, amount) {
        const msgs = await fetchMessages({ message, interaction }, { limit: amount })
        const filtered = msgs.filter(msg => msg.attachments.size !== 0)
        await bulkDelete({ message, interaction }, filtered)
    }

    /**
     * The `links` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {number} amount The amount of messages to delete
     */
    async links({ message, interaction }, amount) {
        const msgs = await fetchMessages({ message, interaction }, { limit: amount })
        const filtered = msgs.filter(msg => {
            for (const str of msg.content?.split(/ +/)) {
                if (validURL(str)) return true
            }
            return false
        })
        await bulkDelete({ message, interaction }, filtered)
    }

    /**
     * The `match` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {number} amount The amount of messages to delete
     * @param {User|Message|string} filter The filter to use for the deleted messages
     */
    async match({ message, interaction }, amount, filter) {
        if (message && !filter) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
            if (cancelled) return
            filter = value
        }
        filter = filter.toString()

        const msgs = await fetchMessages({ message, interaction }, { limit: amount })
        const filtered = msgs.filter(msg => msg.content.includes(filter.toString()))
        await bulkDelete({ message, interaction }, filtered)
    }

    /**
     * The `startswith` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {number} amount The amount of messages to delete
     * @param {User|Message|string} filter The filter to use for the deleted messages
     */
    async startsWith({ message, interaction }, amount, filter) {
        if (message && !filter) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
            if (cancelled) return
            filter = value
        }
        filter = filter.toString()

        const msgs = await fetchMessages({ message, interaction }, { limit: amount })
        const filtered = msgs.filter(msg => msg.content.startsWith(filter.toString()))
        await bulkDelete({ message, interaction }, filtered)
    }

    /**
     * The `user` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {number} amount The amount of messages to delete
     * @param {User} filter The filter to use for the deleted messages
     */
    async user({ message, interaction }, amount, filter) {
        if (message) {
            while (!(filter instanceof User)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
                if (cancelled) return
                filter = value
            }
        }

        const msgs = await fetchMessages({ message, interaction }, { limit: amount })
        const filtered = msgs.filter(msg => msg.author.id === filter.id)
        await bulkDelete({ message, interaction }, filtered)
    }

    /**
     * The `users` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {number} amount The amount of messages to delete
     */
    async users({ message, interaction }, amount) {
        const msgs = await fetchMessages({ message, interaction }, { limit: amount })
        const filtered = msgs.filter(msg => !msg.author.bot)
        await bulkDelete({ message, interaction }, filtered)
    }
}
