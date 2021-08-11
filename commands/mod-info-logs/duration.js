const { stripIndent } = require('common-tags')
const { Command, CommandoMessage } = require('discord.js-commando')
const { ms } = require('../../utils/custom-ms')
const { basicEmbed } = require('../../utils/functions')
const { moderations, active } = require('../../utils/mongo/schemas')

module.exports = class duration extends Command {
    constructor(client) {
        super(client, {
            name: 'duration',
            group: 'mod',
            memberName: 'duration',
            description: 'Change the duration of a punishment.',
            details: stripIndent`
                \`modlog ID\` has to be a valid moderation log ID. To see all the moderation logs in this server use the \`modlogs\` command.
                \`duration\` uses the command time formatting, for more information use the \`help\` command. \`duration\` has to be at least 1 minute.
            `,
            format: 'duration [modlog ID] [duration]',
            examples: ['duration aa2be4fab2d1 30d'],
            userPermissions: ['ADMINISTRATOR'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'modlogID',
                    prompt: 'What is the ID of the mod log you want to change the duration?',
                    type: 'string',
                    max: 12
                },
                {
                    key: 'duration',
                    prompt: 'What will be the new duration of the mod log?',
                    type: 'string',
                    /** @param {string|number} duration */
                    parse: (duration) => formatTime(duration),
                    /** @param {string|number} duration */
                    validate: (duration) => !!formatTime(duration) && formatTime(duration) >= 60 * 1000,
                    error: 'You either didn\'t use the correct format, or the duration is less that 1 minute. Please provide a valid duration.'
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
    * @param {CommandoMessage} message The message
    * @param {object} args The arguments
    * @param {string} args.modlogID The mod log ID
    * @param {number} args.duration The new duration
    */
    async run(message, { modlogID, duration }) {
        const modLog = await moderations.findOne({ guild: message.guild.id, _id: modlogID })
        if (!modLog) return message.say(basicEmbed('red', 'cross', 'That ID is either invalid or it does not exist.'))

        const activeLog = await active.findOne({ guild: message.guild.id, _id: modlogID })
        if (!activeLog) return message.say(basicEmbed('red', 'cross', 'That punishment has expired.'))

        const longTime = ms(duration, { long: true })

        await modLog.updateOne({ duration: longTime })
        await activeLog.updateOne({ duration: Date.parse(activeLog.createdAt) + duration })

        message.say(basicEmbed('green', 'check', `Updated duration for mod log \`${modlogID}\``, `**New duration:** ${longTime}`))
    }
}