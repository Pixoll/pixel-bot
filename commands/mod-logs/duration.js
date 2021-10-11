const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { stripIndent } = require('common-tags')
const { myMs, basicEmbed, timeDetails, docId } = require('../../utils')
const { moderations, active } = require('../../mongo/schemas')
const { ModerationSchema, ActiveSchema } = require('../../mongo/typings')

/** A command that can be run in a client */
module.exports = class DurationCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'duration',
            group: 'mod-logs',
            description: 'Change the duration of a punishment.',
            details: stripIndent`
                \`modlog Id\` has to be a valid mod log id. To see all the mod logs in this server use the \`modlogs\` command.
                ${timeDetails('new duration')}
            `,
            format: 'duration [modlog id] [new duration]',
            examples: [
                `duration ${docId()} 12/30/2022`,
                `duration ${docId()} 30d`
            ],
            userPermissions: ['ADMINISTRATOR'],
            throttling: { usages: 1, duration: 3 },
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
                    key: 'duration',
                    prompt: 'What will be the new duration of the mod log?',
                    type: ['date', 'duration']
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.modlogId The mod log Id
     * @param {number|Date} args.duration The new duration
     */
    async run(message, { modlogId, duration }) {
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
        if (!activeLog) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That punishment has expired.'
            }))
        }

        if (typeof duration === 'number') duration = duration + Date.now()
        if (duration instanceof Date) duration = duration.getTime()

        /** @type {string} */
        const longTime = myMs(duration - Date.now(), { long: true })

        await modLog.updateOne({ duration: longTime })
        await activeLog.updateOne({ duration })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            fieldName: `Updated duration for mod log \`${modlogId}\``, fieldValue: `**New duration:** ${longTime}`
        }))
    }
}