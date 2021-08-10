const { Command, CommandoMessage } = require('discord.js-commando')
const { TextChannel } = require('discord.js')
const { basicEmbed } = require('../../utils/functions')
const { stripIndent } = require('common-tags')

module.exports = class lock extends Command {
    constructor(client) {
        super(client, {
            name: 'lock',
            group: 'mod',
            memberName: 'lock',
            description: 'Locks a channel, revoking the `Send Messages` permission from @everyone.',
            details: stripIndent`
                \`channel\` can be either a text channel's name, mention or ID.
                \`reason\` will default to "We'll be back shortly" if it's not specified.
            `,
            format: stripIndent`
                lock <reason> - Lock the current channel.
                lock [channel] <reason> - Lock a specific channel.
            `,
            examples: ['lock We\'ll be back shortly.', 'lock #chat We\'ll be back shortly.'],
            clientPermissions: ['MANAGE_CHANNELS'],
            userPermissions: ['MANAGE_CHANNELS'],
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'What channel do you want to lock?',
                    type: 'text-channel|string',
                    default: 'We\'ll be back shortly.'
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

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {TextChannel|string} args.channel The channel to lock
     * @param {string} args.reason The message to send when the channel get's locked
     */
    async run(message, { channel, reason }) {
        if (typeof channel === 'string') {
            reason = `${channel} ${reason}`
            channel = message.channel
        }

        const perms = channel.permissionOverwrites.find(perm => perm.id === message.guild.id)
        if (perms.deny.has('SEND_MESSAGES')) return message.say(basicEmbed('red', 'cross', `${channel} is already locked.`))

        await channel.updateOverwrite(channel.guild.roles.everyone, { SEND_MESSAGES: false }, reason)
        await channel.send(basicEmbed('#4c9f4c', '\\🔒', 'This channel has been locked', reason))

        if (message.channel.id !== channel.id) await message.say(basicEmbed('green', 'check', `Locked ${channel}.`))
    }
}