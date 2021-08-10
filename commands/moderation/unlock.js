const { Command, CommandoMessage } = require('discord.js-commando')
const { MessageEmbed, TextChannel } = require('discord.js')
const { cmdInfo, basicEmbed } = require('../../utils/functions')
const { stripIndent } = require('common-tags')

module.exports = class unlock extends Command {
    constructor(client) {
        super(client, {
            name: 'unlock',
            group: 'mod',
            memberName: 'unlock',
            description: 'Unlock a channel, granting the `Send Messages` permission from @everyone.',
            details: stripIndent`
                \`channel\` can be either a text channel's name, mention or ID.
                \`reason\` will default to "Thanks for waiting" if it's not specified.
            `,
            format: stripIndent`
                unlock <reason> - Unlock the current channel.
                unlock [channel] <reason> - Unlock a specific channel.
            `,
            examples: ['unlock Thanks for waiting.', 'unlock #chat Thanks for waiting.'],
            clientPermissions: ['MANAGE_CHANNELS'],
            userPermissions: ['MANAGE_CHANNELS'],
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'What channel do you want to unlock?',
                    type: 'text-channel',
                    default: 'Thanks for waiting.'
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

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {TextChannel} args.channel The channel to lock
     * @param {string} args.reason The message to send when the channel get's locked
     */
    async run(message, { channel, reason }) {
        if (typeof channel === 'string') {
            reason = `${channel} ${reason}`
            channel = message.channel
        }

        const perms = channel.permissionOverwrites.find(perm => perm.id === message.guild.id)
        if (!perms.deny.has('SEND_MESSAGES')) return message.say(basicEmbed('red', 'cross', `${channel} is already unlocked.`))

        await channel.updateOverwrite(channel.guild.roles.everyone, { SEND_MESSAGES: null }, reason)
        await channel.send(basicEmbed('#4c9f4c', '\\🔓', 'This channel has been unlocked', reason))

        if (message.channel.id !== channel.id) await message.say(basicEmbed('green', 'check', `Unlocked ${channel}.`))
    }
}