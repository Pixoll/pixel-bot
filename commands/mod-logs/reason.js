const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { stripIndent } = require('common-tags')
const { basicEmbed, docId } = require('../../utils')
const { moderations, active } = require('../../mongo/schemas')
const { ModerationSchema, ActiveSchema } = require('../../mongo/typings')

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
            throttling: { usages: 1, duration: 3 },
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
        const { guildId } = message

        /** @type {ModerationSchema} */
        const query = {
            guild: guildId,
            _id: modlogId
        }

        /** @type {ModerationSchema} */
        const modLog = await moderations.findOne(query)
        if (!modLog) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That id is either invalid or it does not exist.'
            }))
        }

        /** @type {ActiveSchema} */
        const activeLog = await active.findOne(query)

        await modLog.updateOne({ reason })
        await activeLog?.updateOne({ reason })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            fieldName: `Updated reason for mod log \`${modlogId}\``, fieldValue: `**New reason:** ${reason}`
        }))
    }
}