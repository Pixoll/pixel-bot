/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { stripIndent, oneLine } = require('common-tags')
const { basicEmbed, docId, confirmButtons, replyAll } = require('../../utils/functions')
const ms = require('../../utils/ms')
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
                \`new duration\` uses the bot's time formatting, for more information use the \`help\` command.
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
                        name: 'duration',
                        description: 'The new duration or expire date of the mod log.',
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
     * @param {number|Date} args.duration The new duration
     */
    async run({ message, interaction }, { modlogId, duration }) {
        if (interaction) {
            const arg = this.argsCollector.args[1]
            duration = await arg.parse(duration).catch(() => null) || null
            if (!duration) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'The duration you specified is invalid.'
                }))
            }
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
        if (!activeLog) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That punishment has expired.'
            }))
        }

        if (typeof duration === 'number') duration = duration + Date.now()
        if (duration instanceof Date) duration = duration.getTime()

        /** @type {string} */
        const longTime = ms(duration - Date.now(), { long: true })

        const confirmed = await confirmButtons(
            { message, interaction }, 'update mod log duration', modlogId, { duration: longTime }
        )
        if (!confirmed) return

        await moderations.update(modLog, { duration: longTime })
        await active.update(activeLog, { duration })

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `Updated duration for mod log \`${modlogId}\``,
            fieldValue: `**New duration:** ${longTime}`
        }))
    }
}