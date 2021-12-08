/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { stripIndent, oneLine } = require('common-tags')
const { basicEmbed, docId, confirmButtons, replyAll } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class ReasonCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reason',
            group: 'mod-logs',
            description: 'Change the reason of a moderation log.',
            details: stripIndent`
                ${oneLine`
                    \`modlog id\` has to be a valid mod log id.
                    To see all the mod logs in this server use the \`modlogs\` command.
                `}
                \`new reason\` will be the new reason of the moderation log.
            `,
            format: 'reason [modlog id] [new reason]',
            examples: [`reason ${docId()} Post NSFW and being racist`],
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true,
            args: [
                {
                    key: 'modlogId',
                    label: 'mod log id',
                    prompt: 'What is the id of the mod log you want to change the duration?',
                    type: 'string',
                    max: 12
                },
                {
                    key: 'reason',
                    prompt: 'What will be the new reason of the mod log?',
                    type: 'string',
                    max: 512
                }
            ],
            slash: {
                options: [
                    {
                        type: 'string',
                        name: 'modlog-id',
                        description: 'The id of the mod log to update.',
                        required: true
                    },
                    {
                        type: 'string',
                        name: 'reason',
                        description: 'The new reason of the mod log.',
                        required: true
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.modlogId The mod log id
     * @param {string} args.reason The new reason
     */
    async run({ message, interaction }, { modlogId, reason }) {
        if (interaction && reason.length > 512) {
            return await replyAll({ interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'Please keep the reason below or exactly 512 characters.'
            }))
        }

        const { guild } = message || interaction
        const { moderations, active } = guild.database

        const modLog = await moderations.fetch(modlogId)
        if (!modLog) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That id is either invalid or it does not exist.'
            }))
        }

        const activeLog = await active.fetch(modlogId)

        const confirmed = await confirmButtons({ message, interaction }, 'update mod log reason', modlogId, { reason })
        if (!confirmed) return

        await moderations.update(modLog, { reason })
        if (activeLog) await active.update(activeLog, { reason })

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `Updated reason for mod log \`${modlogId}\``,
            fieldValue: `**New reason:** ${reason}`
        }))
    }
}