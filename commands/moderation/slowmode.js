const { Command, CommandoMessage } = require('discord.js-commando')
const { ms } = require('../../utils/custom-ms')
const { formatTime, basicEmbed } = require('../../utils/functions')
const { stripIndent } = require('common-tags')
const { TextChannel } = require('discord.js')

module.exports = class slowmode extends Command {
    constructor(client) {
        super(client, {
            name: 'slowmode',
            aliases: ['ratelimit'],
            group: 'mod',
            memberName: 'slowmode',
            description: 'Enable, change or disable slowmode/rate limit on a channel.',
            details: stripIndent`
                \`channel\` can be a text channel's name, ID or mention.
                \`time\` uses the command time formatting, for more information use the \`help\` command.
                Using \`off\` or setting \`time\` as 0 will disable the slowmode on the specified channel.
            `,
            format: stripIndent`
                slowmode [time] <channel>
                slowmode off <channel>
            `,
            examples: ['slowmode 3s #main-chat', 'slowmode off'],
            clientPermissions: ['MANAGE_CHANNELS'],
            userPermissions: ['MANAGE_CHANNELS'],
            guildOnly: true,
            args: [
                {
                    key: 'ratelimit',
                    prompt: 'What will be the channel\'s new rate limit?',
                    type: 'string',
                    /** @param {string|number} time */
                    parse: (time) => formatTime(time) / 1000,
                    /** @param {string|number} time @param {CommandoMessage} message */
                    validate: (time, message) => {
                        const arg = message.parseArgs().split(/ +/).shift().toLowerCase()
                        if (arg === 'off' || arg == 0) return true
                        return !!formatTime(time) && formatTime(time) / 1000 <= 21600
                    },
                    error: 'You either didn\'t use the correct format, or you didn\'t type `off`. Please provide a valid rate limit.'
                },
                {
                    key: 'channel',
                    prompt: 'In what channel do you want to change the rate limit?',
                    type: 'text-channel',
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
     * @param {number} args.ratelimit The new rate limit
     * @param {TextChannel} args.channel The channel to change the rate limit
     */
    async run(message, { ratelimit, channel }) {
        const target = channel || message.channel

        if (target.rateLimitPerUser === ratelimit) return message.say(basicEmbed('red', 'cross', 'The slowmode is already set to that value.'))

        await target.setRateLimitPerUser(ratelimit)

        const longTime = ms(ratelimit * 1000, { long: true })

        if (ratelimit === 0) return message.say(basicEmbed('green', 'check', `Disabled slowmode in #${target.name}`))
        message.say(basicEmbed('green', 'check', `Changed slowmode in #${target.name}`, `**New rate limit:** ${longTime}`))
    }
}