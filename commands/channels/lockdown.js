const Command = require('../../command-handler/commands/base')
const { stripIndent } = require('common-tags')
const { basicEmbed, generateEmbed, pluralize, getArgument, channelDetails } = require('../../utils')
const { CommandoMessage, DatabaseManager } = require('../../command-handler/typings')
const { SetupSchema } = require('../../schemas/types')
const { TextChannel } = require('discord.js')

/** A command that can be run in a client */
module.exports = class LockdownCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'lockdown',
            group: 'channels',
            description: 'Lock every text channel that was specified when using the `setup` command',
            details: channelDetails('text-channels', true),
            format: stripIndent`
                lockdown start - Start the lockdown.
                lockdown end - End the lockdown.
                lockdown channels - Display the lockdown channels.
                lockdown add [text-channels] - Add lockdown channels (max. 30 at once).
                lockdown remove [text-channels] - Remove lockdown channels (max. 30 at once).
            `,
            examples: [
                'lockdown add #chat commands 850477653252243466',
                'lockdown remove #commands 800224125444292608',
            ],
            clientPermissions: ['MANAGE_CHANNELS'],
            userPermissions: ['ADMINISTRATOR'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['start', 'end', 'channels', 'add', 'remove']
                },
                {
                    key: 'channels',
                    prompt: 'What channels do you want to add or remove? (max. 30 at once)',
                    type: 'string',
                    validate: async (val, msg, arg) => {
                        const sc = msg.parseArgs().split(/ +/)[0].toLowerCase()
                        if (!['add', 'remove'].includes(sc)) return true
                        const type = msg.client.registry.types.get('text-channel')
                        const array = val.split(/ +/).slice(0, 30)
                        const valid = []
                        for (const str of array) {
                            valid.push(await type.validate(str, msg, arg))
                        }
                        const wrong = valid.filter(b => b !== true)
                        return wrong[0] === undefined
                    },
                    parse: async (val, msg) => {
                        const type = msg.client.registry.types.get('text-channel')
                        const array = val.split(/ +/).slice(0, 30)
                        const valid = []
                        for (const str of array) {
                            valid.push(await type.parse(str, msg))
                        }
                        return valid
                    },
                    required: false,
                    error: 'At least one of the channels you specified was invalid, please try again.'
                }
            ]
        })

        /** @type {DatabaseManager<SetupSchema>} */
        this.db = null
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {'start'|'end'|'channels'|'add'|'remove'} args.subCommand The sub-command
     * @param {string} args.channels The reason of the lockdown, or the channels to add/remove
     */
    async run(message, { subCommand, channels }) {
        const { guild } = message
        this.db = guild.database.setup
        const _channels = guild.channels.cache
        subCommand = subCommand.toLowerCase()

        const data = await this.db.fetch()

        const savedChannels = []
        if (data) {
            for (const channelId of [...data.lockChannels]) {
                /** @type {TextChannel} */
                const channel = _channels.get(channelId)
                if (!channel) continue
                savedChannels.push(channel)
            }
        }

        switch (subCommand) {
            case 'start':
                return await this.start(message, savedChannels)
            case 'end':
                return await this.end(message, savedChannels)
            case 'channels':
                return await this.channels(message, savedChannels)
            case 'add':
                return await this.add(message, data, savedChannels.map(c => c.id), channels)
            case 'remove':
                return await this.remove(message, data, savedChannels.map(c => c.id), channels)
        }
    }

    /**
     * The `start` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {TextChannel[]} savedChannels The saved lockdown channels of the server
     */
    async start(message, savedChannels) {
        if (savedChannels.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.'
            }))
        }

        const { guild, guildId } = message
        const { everyone } = guild.roles

        const toDelete = await message.replyEmbed(basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Locking all lockdown channels...'
        }))

        let amount = 0
        for (const channel of savedChannels) {
            const permsManager = channel.permissionOverwrites
            const perms = permsManager.cache.get(guildId)
            if (perms?.deny.has('SEND_MESSAGES')) continue

            await permsManager.edit(everyone, { SEND_MESSAGES: false }, { reason: 'Lockdown started.', type: 0 })
            await channel.send({
                embeds: [basicEmbed({
                    emoji: '\\🔒', fieldName: 'This channel has been locked',
                    fieldValue: 'A lockdown has been started.'
                })]
            })
            amount++
        }

        await toDelete.delete()
        await message.channel.sendTyping().catch(() => null)

        if (amount === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', description: 'No changes were made.'
            }))
        }

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            description: `Locked ${amount}/${savedChannels.length} lockdown channels.`
        }))
    }

    /**
     * The `end` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {TextChannel[]} savedChannels The saved lockdown channels of the server
     */
    async end(message, savedChannels) {
        if (savedChannels.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.'
            }))
        }

        const { guild, guildId } = message
        const { everyone } = guild.roles

        let amount = 0
        for (const channel of savedChannels) {
            const permsManager = channel.permissionOverwrites
            const perms = permsManager.cache.get(guildId)
            if (!perms?.deny.has('SEND_MESSAGES')) continue

            await permsManager.edit(everyone, { SEND_MESSAGES: null }, { reason: 'Lockdown ended.', type: 0 })
            await channel.send({
                embeds: [basicEmbed({
                    emoji: '\\🔓', fieldName: 'This channel has been unlocked',
                    fieldValue: 'The lockdown has ended.'
                })]
            })
            amount++
        }

        if (amount === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', description: 'No changes were made.'
            }))
        }

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            description: `Unocked ${amount}/${savedChannels.length} lockdown channels.`
        }))
    }

    /**
     * The `channels` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {TextChannel[]} channelsData The channels data for the server
     */
    async channels(message, channelsData) {
        if (channelsData.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.'
            }))
        }

        await generateEmbed(message, channelsData, {
            number: 20,
            authorName: `There's ${pluralize('lockdown channel', channelsData.length)}`,
            authorIconURL: message.guild.iconURL({ dynamic: true }),
            useDescription: true
        })
    }

    /**
     * The `add` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {SetupSchema} data The setup data
     * @param {string[]} savedChannels The ids of the saved channels of the server
     * @param {TextChannel[]} channels The lockdown channels to add
     */
    async add(message, data, savedChannels, channels) {
        if (!channels) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            channels = value
        }

        const channelsList = channels.filter(c => !savedChannels.includes(c.id))
        if (channelsList.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'The channels you specified have already been added.'
            }))
        }

        const { guildId } = message
        if (!data) await this.db.add({
            guild: guildId,
            lockChannels: channelsList.map(c => c.id)
        })
        else await this.db.update(data, {
            $push: { lockChannels: { $each: channelsList.map(c => c.id) } }
        })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            fieldName: 'The following lockdown channels have been added:', fieldValue: channelsList.join(', ')
        }))
    }

    /**
     * The `remove` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {SetupSchema} data The setup data
     * @param {string[]} savedChannels The ids of the saved channels of the server
     * @param {TextChannel[]} channels The lockdown channels to remove
     */
    async remove(message, data, savedChannels, channels) {
        if (savedChannels.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info',
                description: 'There are no lockdown channels, please use the `add` sub-command to add some.'
            }))
        }

        if (!channels) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            channels = value
        }

        const channelsList = channels.filter(c => savedChannels.includes(c.id))
        if (channelsList.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'The channels you specified have not been added.'
            }))
        }

        await this.db.update(data, {
            $pull: { lockChannels: { $in: channelsList.map(c => c.id) } }
        })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            fieldName: 'The following lockdown channels have been removed:', fieldValue: channelsList.join(', ')
        }))
    }
}