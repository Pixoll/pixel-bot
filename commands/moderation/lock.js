const Command = require('../../command-handler/commands/base')
const { TextChannel } = require('discord.js')
const { basicEmbed, reasonDetails, channelDetails } = require('../../utils')
const { CommandoMessage } = require('../../command-handler/typings')

/** A command that can be run in a client */
module.exports = class LockCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'lock',
            group: 'mod',
            description: 'Locks a channel, revoking the `Send Messages` permission from @everyone.',
            details: `${channelDetails()}\n${reasonDetails('We\'ll be back shortly')}`,
            format: 'lock [channel] <reason>',
            examples: ['lock #chat We\'ll be back shortly'],
            clientPermissions: ['MANAGE_CHANNELS'],
            userPermissions: ['MANAGE_CHANNELS'],
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'What channel do you want to lock?',
                    type: 'text-channel',
                },
                {
                    key: 'reason',
                    prompt: 'What message do you want to send when the channel get\'s locked?',
                    type: 'string',
                    max: 512,
                    default: 'We\'ll be back shortly.'
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {TextChannel} args.channel The channel to lock
     * @param {string} args.reason The message to send when the channel get's locked
     */
    async run(message, { channel, reason }) {
        const { guildId, channelId, guild } = message
        const permissions = channel.permissionOverwrites
        const { everyone } = guild.roles

        const perms = permissions.cache.find(p => p.id === guildId)
        if (perms.deny.has('SEND_MESSAGES')) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: `${channel} is already locked.`
            }))
        }

        await permissions.edit(everyone, { SEND_MESSAGES: false }, { reason, type: 0 })
        await channel.send({
            embeds: [basicEmbed({
                emoji: '\\🔒', fieldName: 'This channel has been locked', fieldValue: reason
            })]
        })

        if (channelId !== channel.id) {
            await message.replyEmbed(basicEmbed({
                color: 'GREEN', emoji: 'check', description: `Locked ${channel}.`
            }))
        }
    }
}