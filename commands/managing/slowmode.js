/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { myMs, channelDetails, timeDetails } = require('../../utils')
const { basicEmbed } = require('../../utils')
const { stripIndent } = require('common-tags')
const { TextChannel } = require('discord.js')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class SlowmodeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'slowmode',
            aliases: ['ratelimit'],
            group: 'managing',
            description: 'Enable, change or disable slowmode/rate limit on a channel.',
            details: stripIndent`
                ${channelDetails()}\n${timeDetails('time')}
                Setting \`time\` as \`0\` or \`off\` will disable the slowmode on the specified channel.
            `,
            format: 'slowmode [channel] [time]',
            examples: [
                'slowmode #main-chat 3s',
                'slowmode commands off'
            ],
            clientPermissions: ['MANAGE_CHANNELS'],
            userPermissions: ['MANAGE_CHANNELS'],
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'In what channel do you want to change the rate limit?',
                    type: ['text-channel', 'thread-channel']
                },
                {
                    key: 'ratelimit',
                    prompt: 'What will be the channel\'s new rate limit?',
                    type: ['duration', 'string'],
                    oneOf: ['off']
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {TextChannel} args.channel The channel to change the rate limit
     * @param {number|'off'} args.ratelimit The new rate limit
     */
    async run({ message }, { channel, ratelimit }) {
        ratelimit = typeof ratelimit === 'string' ? 0 : Math.trunc(ratelimit / 1000)

        if (channel.rateLimitPerUser === ratelimit) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'The slowmode is already set to that value.'
            }))
        }

        await channel.setRateLimitPerUser(ratelimit)

        if (ratelimit === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'GREEN', emoji: 'check', description: `Disabled slowmode in ${channel.toString()}`
            }))
        }

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `Changed slowmode in #${channel.name}`,
            fieldValue: `**New rate limit:** ${myMs(ratelimit * 1000, { long: true, showAnd: true })}`
        }))
    }
}