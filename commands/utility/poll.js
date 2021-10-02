const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { MessageEmbed, TextChannel, Message } = require('discord.js')
const { myMs, channelDetails, timeDetails, getArgument, basicCollector, emojiRegex } = require('../../utils')
const { polls } = require('../../mongo/schemas')
const { stripIndent } = require('common-tags')
const { basicEmbed } = require('../../utils')
const { PollSchema } = require('../../mongo/typings')

/** A command that can be run in a client */
module.exports = class PollCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'poll',
            group: 'utility',
            description: 'Create or end a poll.',
            details: stripIndent`
                ${channelDetails()}\n${timeDetails('duration')}
                \`msg id\` has to be a message's id that's in the **same channel** that you specified.
            `,
            format: stripIndent`
                poll create [channel] [duration] - Create a poll in that channel.
                poll end <channel> <msg id> - End the oldest poll in that channel.
            `,
            examples: [
                'poll create polls 12h',
                'poll end #polls',
                'poll end polls 890317796221792336'
            ],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'Do you want to create or end a poll?',
                    type: 'string',
                    oneOf: ['create', 'end']
                },
                {
                    key: 'channel',
                    prompt: 'On what channel do you want to create/end the poll?',
                    type: 'text-channel',
                    required: false
                },
                {
                    key: 'durationOrMsg',
                    label: 'duration or message',
                    prompt: 'How long should the mute last? Or what\'s the message id of the poll you want to end?',
                    type: ['date', 'timestamp', 'duration', 'string'],
                    required: false
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {'create'|'end'} args.subCommand The sub-command to use
     * @param {TextChannel} args.channel The text channel of the poll to create or end
     * @param {number|Date|string} args.durationOrMsg The duration of the poll to create,
     * or the message of the poll to end
     */
    async run(message, { subCommand, channel, durationOrMsg }) {
        subCommand = subCommand.toLowerCase()

        switch (subCommand) {
            case 'create':
                return await this.create(message, channel, durationOrMsg)
            case 'end':
                return await this.end(message, channel, durationOrMsg)
        }
    }

    /**
     * The `create` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {TextChannel} channel The text channel of the poll to create
     * @param {number|Date|string} duration The duration of the poll to create
     */
    async create(message, channel, duration) {
        while (typeof duration === 'string') {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            duration = value
        }

        if (typeof duration === 'number') duration = duration + Date.now()
        if (duration instanceof Date) duration = duration.getTime()

        const { guildId, client } = message

        const pollMsg = await basicCollector(message, {
            fieldName: 'What will the message of the poll be?'
        }, { time: myMs('2m') })
        if (!pollMsg) return

        const allEmojis = client.emojis.cache
        const emojis = []
        while (emojis.length < 2) {
            const emojisMsg = await basicCollector(message, {
                fieldName: 'Now, what emojis should the bot react with in the poll message?'
            }, { time: myMs('2m') })
            if (!emojisMsg) return

            const match = emojisMsg.content.match(emojiRegex)?.map(e => e).filter(e => e) || []
            for (const emoji of match) {
                if (emojis.includes(emoji)) continue

                if (!Number.parseInt(emoji)) emojis.push(emoji)
                if (allEmojis.get(emoji)) emojis.push(emoji)
            }
        }

        const sent = await channel.send(pollMsg.content)
        for (const emoji of emojis) await sent.react(emoji)

        /** @type {PollSchema} */
        const newDoc = {
            guild: guildId,
            channel: channel.id,
            message: sent.id,
            emojis,
            duration: myMs(duration, { long: true }),
            endsAt: duration
        }

        await new polls(newDoc).save()

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: `The poll was successfully created in ${channel}.`
        }))
    }

    /**
     * The `end` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {TextChannel} channel The text channel of the poll to end
     * @param {string} _msg The message id of the poll to end
     */
    async end(message, channel, _msg) {
        if (!channel) channel = message.channel

        if (_msg) {
            while (!(_msg instanceof Message)) {
                const msg = await channel.messages.fetch(_msg)
                _msg = msg
            }
        }

        const { guild, guildId } = message
        const { channels } = guild

        /** @type {PollSchema} */
        const query = _msg ? {
            guild: guildId,
            channel: channel.id,
            message: _msg.id
        } : {
            guild: guildId,
            channel: channel.id
        }

        /** @type {PollSchema} */
        const pollData = await polls.findOne(query)
        if (!pollData) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'I couldn\'t find the poll you were looking for.'
            }))
        }

        /** @type {TextChannel} */
        const pollChannel = channels.resolve(pollData.channel)
        /** @type {Message} */
        const msg = _msg || await pollChannel?.messages.fetch(pollData.message)
        if (!msg) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That poll message or the channel were deleted.'
            }))
        }

        const reactions = msg.reactions.cache.filter(r =>
            pollData.emojis.includes(r.emoji.id || r.emoji.name)
        )

        const results = []
        for (const [, reaction] of reactions) {
            const votes = reaction.count - 1
            const emoji = reaction.emoji.toString()
            results.push({ votes, emoji })
        }

        const winners = results.sort((a, b) => b.votes - a.votes).filter((d, i, arr) => arr[0].votes === d.votes)

        const winner = winners.length === 1 ?
            `The winner was the choice ${winners[0].emoji} with a total of \`${winners[0].votes}\` votes!` : null

        const draw = winners.length > 1 ?
            `It seems like there was a draw between these choices: ${winners.map(d => d.emoji).join(', ')}` : null

        const noVotes = results.filter(d => d.votes === 0).length === results.length ?
            'It seems like no one voted on this poll...' : null

        const pollEmbed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor('The poll has ended!', guild.iconURL({ dynamic: true }), msg.url)
            .setDescription(winner || noVotes || draw)
            .setTimestamp()

        if (!noVotes) pollEmbed.addField(
            'These are the full results:',
            results.map(d => `**>** Choice ${d.emoji} with \`${d.votes}\` votes.`).join('\n')
        )

        await pollChannel.send({ embeds: [pollEmbed] })
        await pollData.deleteOne()
    }
}