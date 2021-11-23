/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { basicEmbed, docId, confirmButtons } = require('../../utils')
const { oneLine } = require('common-tags')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class DelModLogCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'del-mod-log',
            aliases: ['del-modlog', 'delmodlog'],
            group: 'mod-logs',
            description: 'Delete a single moderation log.',
            details: oneLine`
                \`modlog id\` has to be a valid mod log id.
                To see all the mod logs in this server use the \`modlogs\` command.
            `,
            format: 'delmodlog [modlog id]',
            examples: [`delmodlog ${docId()}`],
            userPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true,
            args: [{
                key: 'modlogId',
                label: 'mod log id',
                prompt: 'What is the id of the mod log you want to delete?',
                type: 'string',
                max: 12
            }],
            deprecated: true,
            replacing: 'mod-log'
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.modlogId The mod log id
     */
    async run({ message }, { modlogId }) {
        const { guild } = message
        const db = guild.database.moderations

        const modLog = await db.fetch(modlogId)
        if (!modLog) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That id is either invalid or it does not exist.'
            }))
        }

        const confirm = await confirmButtons({ message }, 'delete modlog', modlogId)
        if (!confirm) return
        await db.delete(modLog)

        return await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Deleted mod log with id \`${modlogId}\``
        }))
    }
}