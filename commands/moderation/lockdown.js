const { Command, CommandoMessage } = require('discord.js-commando')
const { setup } = require('../../utils/mongo/schemas')
const { stripIndent } = require('common-tags')
const { basicEmbed, generateEmbed } = require('../../utils/functions')

module.exports = class lockdown extends Command {
    constructor(client) {
        super(client, {
            name: 'lockdown',
            group: 'mod',
            memberName: 'lockdown',
            description: 'Lock every text channel that was specified when using the `setup` command',
            details: stripIndent`
                \`reason\` is sent when the channels get locked.
                \`reason\` will default to "We'll be back shortly" or "Thanks for waiting" if it's not specified.
            `,
            format: stripIndent`
                lockdown start <reason> - Start the lockdown.
                lockdown end <reason> - End the lockdown.
                lockdown channels - Display the lockdown channels.
                lockdown add [channels] - Add lockdown channels, separated by spaces (max. 30 at once).
                lockdown remove [channels] - Remove lockdown channels, separated by spaces (max. 30 at once).
            `,
            examples: ['lockdown start We\'ll be back shortly.', 'lockdown end', 'lockdown add #chat commands 850477653252243466'],
            clientPermissions: ['MANAGE_CHANNELS'],
            userPermissions: ['ADMINISTRATOR'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['start', 'end', 'channels', 'add', 'remove']
                },
                {
                    key: 'reasonChannels',
                    prompt: 'What is the reason of the lockdown? Or what channels do you want to add or remove? (max. of 30 at a time)',
                    type: 'string',
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
     * @param {string} args.reasonChannels The reason of the lockdown, or the channels to add/remove
     */
    async run(message, { subCommand, reasonChannels }) {
        const { guild } = message
        const channelsCache = guild.channels.cache
        const everyone = message.guild.roles.everyone
        subCommand = subCommand.toLowerCase()

        const data = await setup.findOne({ guild: guild.id })
        if (!data) return message.say(basicEmbed('blue', 'info', 'There\'s no data of this server, please use the `setup` command before using this.'))

        const channelsData = []
        for (const channelID of Array(...data.lockChannels)) {
            const channel = channelsCache.get(channelID)
            if (!channel) continue
            channelsData.push(channel)
        }

        if (['add', 'remove'].includes(subCommand)) {
            if (!reasonChannels) return message.say(basicEmbed('red', 'cross', 'Please specify which channels would you like to add/remove.'))

            const array = reasonChannels.split(/ +/)
            const channels = []
            for (const item of array) {
                const channel = channelsCache.get(item.replace(/[^0-9]/g, '')) || channelsCache.find(({ name }) => name === item.toLowerCase())
                if (!channel || channel.type !== 'text') continue
                channels.push(channel)
            }

            if (subCommand === 'add') {
                const channelsList = channels.filter(channel => !channelsData.includes(channel) && !channel.permissionOverwrites.get(guild.id)?.deny.has('SEND_MESSAGES'))
                if (channelsList.length === 0) return message.say(basicEmbed('red', 'cross', 'The channels you specified are not valid.'))

                await data.updateOne({ $push: { lockChannels: { $each: channelsList.map(({ id }) => id) } } })
                return message.say(basicEmbed('green', 'check', 'Added the following lockdown channels:', channelsList.join(', ')))
            }

            const channelsList = channels.filter(channel => channelsData.includes(channel))
            if (channelsList.length === 0) return message.say(basicEmbed('red', 'cross', 'The channels you specified are not valid.'))

            await data.updateOne({ $pull: { lockChannels: { $in: channelsList.map(({ id }) => id) } } })
            return message.say(basicEmbed('green', 'check', 'Removed the following lockdown channels:', channelsList.join(', ')))
        }

        if (channelsData.length === 0) return message.say(basicEmbed('blue', 'info', 'There are no lockdown channels, please use the `add` sub-command to add some.'))

        if (subCommand === 'channels') {
            return await generateEmbed(message, channelsData, {
                number: 20,
                authorName: `${guild.name}'s lockdown channels`,
                authorIconURL: guild.iconURL({ dynamic: true }),
                useDescription: true
            })
        }

        var amount = 0
        for (const channel of channelsData) {
            const perms = channel.permissionOverwrites.get(guild.id)

            if (subCommand === 'start') {
                if (perms?.deny.has('SEND_MESSAGES')) continue

                const reason = reasonChannels || 'We\'ll be back shortly.'
                await channel.updateOverwrite(everyone, { SEND_MESSAGES: false }, reason)
                await channel.send(basicEmbed('#4c9f4c', '\\🔒', 'This channel has been locked', reason))
                amount++
                continue
            }

            if (!perms?.deny.has('SEND_MESSAGES')) continue

            const reason = reasonChannels || 'Thanks for waiting.'
            await channel.updateOverwrite(everyone, { SEND_MESSAGES: null }, reason)
            await channel.send(basicEmbed('#4c9f4c', '\\🔓', 'This channel has been unlocked', reason))
            amount++
        }

        if (!amount) return message.say(basicEmbed('red', 'cross', 'No changes were made.'))

        if (subCommand === 'start') message.say(basicEmbed('green', 'check', `Locked ${amount} channels.`))
        else message.say(basicEmbed('green', 'check', `Unocked ${amount} channels.`))
    }
}