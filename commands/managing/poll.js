/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances, CommandoMessage } = require('../../command-handler/typings')
const { MessageEmbed, TextChannel, Message } = require('discord.js')
const { myMs, channelDetails, timeDetails, getArgument, basicCollector, emojiRegex, validURL } = require('../../utils')
const { stripIndent } = require('common-tags')
const { basicEmbed } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class PollCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'poll',
            group: 'managing',
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
                    prompt: 'How long should the poll last? Or what\'s the message id of the poll you want to end?',
                    type: ['date', 'duration', 'string'],
                    required: false
                }
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'create',
                        description: 'Create a poll.',
                        options: [
                            {
                                type: 'channel',
                                channelTypes: ['guild-text'],
                                name: 'channel',
                                description: 'The channel where to create the poll.',
                                required: true
                            },
                            {
                                type: 'string',
                                name: 'duration',
                                description: 'How long the poll should last.',
                                required: true
                            },
                            {
                                type: 'string',
                                name: 'message',
                                description: 'The message to send with the poll.',
                                required: true
                            },
                            {
                                type: 'string',
                                name: 'emojis',
                                description: 'The emojis for the options of the poll (min. of 2).',
                                required: true
                            }
                        ]
                    },
                    {
                        type: 'subcommand',
                        name: 'end',
                        description: 'End a poll.',
                        options: [
                            {
                                type: 'string',
                                name: 'message-url',
                                description: 'The link/url of the poll to end.',
                                required: true
                            }
                        ]
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'create'|'end'} args.subCommand The sub-command to use
     * @param {TextChannel} args.channel The text channel of the poll to create or end
     * @param {number|Date|string} args.durationOrMsg The duration of the poll to create,
     * or the message of the poll to end
     */
    async run(
        { message, interaction }, { subCommand, channel, durationOrMsg, duration, message: msg, emojis, message_url }
    ) {
        const emojisArr = []
        if (interaction) {
            const { client } = interaction
            const arg = this.argsCollector.args[2]

            if (subCommand === 'create') {
                durationOrMsg = await arg.parse(duration).catch(() => null) || null
                if (!durationOrMsg || typeof durationOrMsg === 'string') {
                    return await interaction.editReply({
                        embeds: [basicEmbed({
                            color: 'RED', emoji: 'cross', description: 'That duration is invalid.'
                        })]
                    })
                }
                if (typeof durationOrMsg === 'number') durationOrMsg += Date.now()
                if (durationOrMsg instanceof Date) durationOrMsg = durationOrMsg.getTime()
                this.now = Date.now()
                const allEmojis = client.emojis.cache
                const match = emojis.match(emojiRegex)?.map(e => e).filter(e => e) || []
                for (const emoji of match) {
                    if (emojisArr.includes(emoji)) continue

                    if (!Number.parseInt(emoji)) emojisArr.push(emoji)
                    if (allEmojis.get(emoji)) emojisArr.push(emoji)
                }
                if (emojisArr.length < 2) {
                    return await interaction.editReply({
                        embeds: [basicEmbed({
                            color: 'RED', emoji: 'cross', description: 'You need to send at least 2 emojis.'
                        })]
                    })
                }
            } else if (!validURL(message_url)) {
                return await interaction.editReply({
                    embeds: [basicEmbed({
                        color: 'RED', emoji: 'cross', description: 'That message url is invalid.'
                    })]
                })
            }
        }

        const { guild } = message || interaction
        subCommand = subCommand.toLowerCase()
        this.db = guild.database.polls

        switch (subCommand) {
            case 'create':
                return await this.create({ message, interaction }, channel, durationOrMsg, msg, emojisArr)
            case 'end':
                return await this.end({ message, interaction }, channel, durationOrMsg, message_url)
        }
    }

    /**
     * The `create` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {TextChannel} channel The text channel of the poll to create
     * @param {number|Date|string} duration The duration of the poll to create
     * @param {string} msg The message to send with the poll
     * @param {string[]} emojis The emojis options of the poll
     */
    async create({ message, interaction }, channel, duration, msg, emojis = []) {
        const { guildId, client } = message || interaction

        if (message) {
            if (!channel) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
                if (cancelled) return
                channel = value
            }

            while (!duration || typeof duration === 'string') {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
                if (cancelled) return
                duration = value
            }
            this.now = Date.now()
            if (typeof duration === 'number') duration += this.now
            if (duration instanceof Date) duration = duration.getTime()

            const pollMsg = await basicCollector({ message }, {
                fieldName: 'What will the message of the poll be?'
            }, { time: myMs('2m') })
            if (!pollMsg) return
            msg = pollMsg.content

            const allEmojis = client.emojis.cache
            while (emojis.length < 2) {
                const emojisMsg = await basicCollector({ message }, {
                    fieldName: 'Now, what emojis should the bot react with in the poll message? Please send **at least 2.**'
                }, { time: myMs('2m') })
                if (!emojisMsg) return

                const match = emojisMsg.content.match(emojiRegex)?.map(e => e).filter(e => e) || []
                for (const emoji of match) {
                    if (emojis.includes(emoji)) continue

                    if (!Number.parseInt(emoji)) emojis.push(emoji)
                    if (allEmojis.get(emoji)) emojis.push(emoji)
                }
            }
        }

        const sent = await channel.send(msg)
        for (const emoji of emojis) await sent.react(emoji)

        await this.db.add({
            guild: guildId,
            channel: channel.id,
            message: sent.id,
            emojis,
            duration: myMs(duration - this.now, { long: true }),
            endsAt: duration
        })

        const embed = basicEmbed({
            color: 'GREEN', emoji: 'check', description: `The poll was successfully created [here](${sent.url}).`
        })
        await interaction?.editReply({ embeds: [embed] })
        await message?.replyEmbed(embed)
    }

    /**
     * The `end` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {TextChannel} channel The text channel of the poll to end
     * @param {Message} msg The message id of the poll to end
     * @param {string} pollURL The URL of the poll to end
     */
    async end({ message, interaction }, channel, msg, pollURL) {
        const { guild } = message || interaction
        const { channels } = guild

        if (interaction) {
            const [, chanId, msgId] = pollURL.match(/(\d+)[/-](\d+)$/)?.map(m => m) || []
            channel = await channels.fetch(chanId).catch(() => null)
            if (!channel) {
                return await interaction.editReply({
                    embeds: [basicEmbed({
                        color: 'RED', emoji: 'cross', description: 'I couldn\'t get the channel from the url.'
                    })]
                })
            }
            msg = await channel.messages.fetch(msgId).catch(() => null)
            if (!msg) {
                return await interaction.editReply({
                    embeds: [basicEmbed({
                        color: 'RED', emoji: 'cross', description: 'I couldn\'t get the message from the url.'
                    })]
                })
            }
        } else {
            channel ??= message.channel
            msg = await channel.messages.fetch(msg).catch(() => null)
            while (!(msg instanceof Message)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
                if (cancelled) return
                msg = await channel.messages.fetch(value).catch(() => null)
            }
        }

        const pollData = await this.db.fetch(
            msg ? { channel: channel.id, message: msg.id } : { channel: channel.id }
        )
        if (!pollData) {
            const embed = basicEmbed({
                color: 'RED', emoji: 'cross', description: 'I couldn\'t find the poll you were looking for.'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message.replyEmbed(embed)
            return
        }

        /** @type {TextChannel} */
        const pollChannel = channel || channels.fetch(pollData.channel).catch(() => null)
        /** @type {Message} */
        const pollMsg = msg || await pollChannel?.messages.fetch(pollData.message)
        if (!pollMsg) {
            const embed = basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That poll message or the channel were deleted.'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        const reactions = pollMsg.reactions.cache.filter(r =>
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
            .setAuthor('The poll has ended!', guild.iconURL({ dynamic: true }), pollMsg.url)
            .setDescription(winner || noVotes || draw)
            .setTimestamp()

        if (!noVotes) {
            pollEmbed.addField(
                'These are the full results:',
                results.map(d => `**>** Choice ${d.emoji} with \`${d.votes}\` votes.`).join('\n')
            )
        }

        await pollChannel.send({ embeds: [pollEmbed] })
        await this.db.delete(pollData)

        const embed = basicEmbed({
            color: 'GREEN', emoji: 'check', description: `[This poll](${pollMsg.url}) has been ended.`
        })
        await interaction?.editReply({ embeds: [embed] })
        await message?.replyEmbed(embed)
    }
}