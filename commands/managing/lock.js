/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { TextChannel } = require('discord.js')
const { basicEmbed, replyAll } = require('../../utils/functions')
const { CommandInstances } = require('../../command-handler/typings')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class LockCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'lock',
            group: 'managing',
            description: 'Locks a channel, revoking the `Send Messages` permission from @everyone.',
            details: stripIndent`
                \`channel\` can be either a channel's name, mention or id.
                If \`reason\` is not specified, it will default as "We\'ll be back shortly".
            `,
            format: 'lock [channel] <reason>',
            examples: ['lock #chat We\'ll be back shortly'],
            clientPermissions: ['MANAGE_CHANNELS'],
            userPermissions: ['MANAGE_CHANNELS'],
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'What channel do you want to lock?',
                    type: 'text-channel'
                },
                {
                    key: 'reason',
                    prompt: 'What message do you want to send when the channel get\'s locked?',
                    type: 'string',
                    max: 512,
                    default: 'We\'ll be back shortly.'
                }
            ],
            slash: {
                options: [
                    {
                        type: 'channel',
                        channelTypes: ['guild-text'],
                        name: 'channel',
                        description: 'The channel to lock.'
                    },
                    {
                        type: 'string',
                        name: 'reason',
                        description: 'Why are you locking the channel.'
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {TextChannel} args.channel The channel to lock
     * @param {string} args.reason The message to send when the channel get's locked
     */
    async run({ message, interaction }, { channel, reason }) {
        if (interaction) {
            channel ??= interaction.channel
            reason ??= 'We\'ll be back shortly.'
            if (reason.length > 512) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'Please keep the reason below or exactly 512 characters.'
                }))
            }
        }

        const { guildId, guild } = message || interaction
        const permissions = channel.permissionOverwrites
        const { everyone } = guild.roles

        const perms = permissions.resolve(guildId)
        if (perms && perms.deny.has('SEND_MESSAGES')) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: `${channel} is already locked.`
            }))
        }

        await permissions.edit(everyone, { SEND_MESSAGES: false }, { reason, type: 0 })
        await channel.send({
            embeds: [basicEmbed({
                emoji: '\\🔒', fieldName: 'This channel has been locked', fieldValue: reason
            })]
        })

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Locked ${channel}.`
        }))
    }
}
