const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, docId, modConfirmation } = require('../../utils')
const { moderations } = require('../../mongo/schemas')
const { ModerationSchema } = require('../../mongo/typings')
const { oneLine } = require('common-tags')

/** A command that can be run in a client */
module.exports = class DelModLogCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'delmodlog',
            aliases: ['del-modlog'],
            group: 'mod-logs',
            description: 'Delete a single moderation log.',
            details: oneLine`
                \`modlog id\` has to be a valid mod log id.
                To see all the mod logs in this server use the \`modlogs\` command.
            `,
            format: 'delmodlog [modlog id]',
            examples: [`delmodlog ${docId()}`],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [{
                key: 'modlogId',
                label: 'mod log id',
                prompt: 'What is the id of the mod log you want to delete?',
                type: 'string',
                max: 12
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.modlogId The mod log id
     */
    async run(message, { modlogId }) {
        modlogId = modlogId.toLowerCase()
        const { guildId } = message

        /** @type {ModerationSchema} */
        const modLog = await moderations.findOne({ guild: guildId, _id: modlogId })
        if (!modLog) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That id is either invalid or it does not exist.'
            }))
        }

        const confirm = await modConfirmation(message, 'delete modlog', modlogId)
        if (!confirm) return
        await modLog.deleteOne()

        return await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Deleted mod log with id \`${modlogId}\``
        }))
    }
}