const { stripIndent } = require('common-tags')
const { Command, CommandoMessage } = require('discord.js-commando')
const { basicEmbed } = require('../../utils/functions')
const { moderations, active } = require('../../utils/mongodb-schemas')

module.exports = class reason extends Command {
    constructor(client) {
        super(client, {
            name: 'reason',
            group: 'mod',
            memberName: 'reason',
            description: 'Change the reason of a moderation log.',
            details: stripIndent`
                \`modlog ID\` has to be a valid moderation log ID. To see all the moderation logs in this server use the \`modlogs\` command.
                \`new reason\` will be the new reason of the moderation log.
            `,
            format: 'reason [modlog ID] [new reason]',
            examples: ['reason aa2be4fab2d1 Post NSFW and being racist'],
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
                    key: 'reason',
                    prompt: 'What will be the new reason of the mod log?',
                    type: 'string',
                    max: 512
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
    * @param {number} args.reason The new reason
    */
    async run(message, { modlogID, reason }) {
        const modLog = await moderations.findOne({ guild: message.guild.id, _id: modlogID })
        if (!modLog) return message.say(basicEmbed('red', 'cross', 'That ID is either invalid or it does not exist.'))

        const activeLog = await active.findOne({ guild: message.guild.id, _id: modlogID })

        await modLog.updateOne({ reason: reason })
        await activeLog?.updateOne({ reason: reason })

        message.say(basicEmbed('green', 'check', `Updated reason for mod log \`${modlogID}\``, `**New reason:** ${reason}`))
    }
}