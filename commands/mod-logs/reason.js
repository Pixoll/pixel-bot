const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { stripIndent } = require('common-tags')
const { basicEmbed, docId, confirmButtons } = require('../../utils')

/** A command that can be run in a client */
module.exports = class ReasonCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reason',
            group: 'mod-logs',
            description: 'Change the reason of a moderation log.',
            details: stripIndent`
                \`modlog Id\` has to be a valid mod log Id. To see all the mod logs in this server use the \`modlogs\` command.
                \`new reason\` will be the new reason of the moderation log.
            `,
            format: 'reason [modlog Id] [new reason]',
            examples: [`reason ${docId()} Post NSFW and being racist`],
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true,
            args: [
                {
                    key: 'modlogId',
                    label: 'mod log id',
                    prompt: 'What is the Id of the mod log you want to change the duration?',
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

    /**
    * @param {CommandoMessage} message The message the command is being run for
    * @param {object} args The arguments for the command
    * @param {string} args.modlogId The mod log Id
    * @param {number} args.reason The new reason
    */
    async run(message, { modlogId, reason }) {
        const { guild } = message
        const { moderations, active } = guild.database

        const modLog = await moderations.fetch(modlogId)
        if (!modLog) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That id is either invalid or it does not exist.'
            }))
        }

        const activeLog = await active.fetch(modlogId)

        const confirm = await confirmButtons(message, 'update modlog reason', modlogId, { reason })
        if (!confirm) return

        await moderations.update(modLog, { reason })
        if (activeLog) await active.update(activeLog, { reason })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            fieldName: `Updated reason for mod log \`${modlogId}\``, fieldValue: `**New reason:** ${reason}`
        }))
    }
}