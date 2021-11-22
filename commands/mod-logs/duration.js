/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { stripIndent, oneLine } = require('common-tags')
const { myMs, basicEmbed, timeDetails, docId, confirmButtons } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class DurationCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'duration',
            group: 'mod-logs',
            description: 'Change the duration of a punishment.',
            details: stripIndent`
                ${oneLine`
                    \`modlog id\` has to be a valid mod log id.
                    To see all the mod logs in this server use the \`modlogs\` command.
                `}
                ${timeDetails('new duration')}
            `,
            format: 'duration [modlog id] [new duration]',
            examples: [
                `duration ${docId()} 12/30/2022`,
                `duration ${docId()} 30d`
            ],
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
                    key: 'duration',
                    prompt: 'What will be the new duration of the mod log?',
                    type: ['date', 'duration']
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.modlogId The mod log id
     * @param {number|Date} args.duration The new duration
     */
    async run({ message }, { modlogId, duration }) {
        const { guild } = message
        const { moderations, active } = guild.database

        const modLog = await moderations.fetch(modlogId)
        if (!modLog) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That id is either invalid or it does not exist.'
            }))
        }

        const activeLog = await active.fetch(modlogId)
        if (!activeLog) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That punishment has expired.'
            }))
        }

        if (typeof duration === 'number') duration = duration + Date.now()
        if (duration instanceof Date) duration = duration.getTime()

        /** @type {string} */
        const longTime = myMs(duration - Date.now(), { long: true })

        const confirm = await confirmButtons({ message }, 'update modlog duration', modlogId, { duration: longTime })
        if (!confirm) return
        await moderations.update(modLog, { duration: longTime })
        await active.update(activeLog, { duration })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `Updated duration for mod log \`${modlogId}\``,
            fieldValue: `**New duration:** ${longTime}`
        }))
    }
}