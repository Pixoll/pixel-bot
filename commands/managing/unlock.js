/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { TextChannel } = require('discord.js')
const { basicEmbed, channelDetails, reasonDetails } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class UnlockCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unlock',
            group: 'managing',
            description: 'Unlock a channel, granting the `Send Messages` permission from @everyone.',
            details: `${channelDetails()}\n${reasonDetails('Thanks for waiting')}`,
            format: 'lock [channel] <reason>',
            examples: ['unlock #chat Thanks for waiting'],
            clientPermissions: ['MANAGE_CHANNELS'],
            userPermissions: ['MANAGE_CHANNELS'],
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'What channel do you want to unlock?',
                    type: 'text-channel'
                },
                {
                    key: 'reason',
                    prompt: 'What message do you want to send when the channel get\'s unlocked?',
                    type: 'string',
                    max: 512,
                    default: 'Thanks for waiting.'
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {TextChannel} args.channel The channel to lock
     * @param {string} args.reason The message to send when the channel get's locked
     */
    async run({ message }, { channel, reason }) {
        const { guildId, channelId, guild } = message
        const permissions = channel.permissionOverwrites
        const { everyone } = guild.roles

        const perms = permissions.cache.find(p => p.id === guildId)
        if (!perms.deny.has('SEND_MESSAGES')) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: `${channel} is already unlocked.`
            }))
        }

        await permissions.edit(everyone, { SEND_MESSAGES: null }, { reason, type: 0 })
        await channel.send({
            embeds: [basicEmbed({
                emoji: '\\🔓', fieldName: 'This channel has been unlocked', fieldValue: reason
            })]
        })

        if (channelId !== channel.id) {
            await message.replyEmbed(basicEmbed({
                color: 'GREEN', emoji: 'check', description: `Unlocked ${channel}.`
            }))
        }
    }
}