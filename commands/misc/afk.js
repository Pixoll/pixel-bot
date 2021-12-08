/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { basicEmbed, replyAll } = require('../../utils/functions')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class AfkCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'afk',
            group: 'misc',
            description: 'Set an AFK status to display when you are mentioned.',
            details: 'Set `status` as `off` to remove your AFK status.',
            format: stripIndent`
                afk [status] - Set your status.
                afk off - Remove your status.
            `,
            examples: [
                'afk Coding',
                'afk off'
            ],
            guildOnly: true,
            args: [{
                key: 'status',
                prompt: 'What is the status you want to set? Respond with `off` to remove it (if existent).',
                type: 'string',
                max: 512
            }],
            slash: {
                options: [{
                    type: 'string',
                    name: 'status',
                    description: 'What is the status you want to set? Respond with `off` to remove it (if existent).',
                    required: true
                }]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.status The status to set or `off`
     */
    async run({ message, interaction }, { status }) {
        const { guildId, guild } = message || interaction
        const author = message?.author || interaction.user
        const db = guild.database.afk

        const afkStatus = await db.fetch({ guild: guildId, user: author.id })

        if (afkStatus) {
            if (status.toLowerCase() === 'off') {
                await afkStatus.deleteOne()
                return await replyAll({ message, interaction }, basicEmbed({
                    color: 'GREEN', description: `Welcome back ${author.toString()}, I removed your AFK status`
                }))
            }

            await afkStatus.updateOne({ status })
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'GREEN', emoji: 'check', fieldName: 'I updated your AFK status to:', fieldValue: status
            }))
        }

        if (status.toLowerCase() === 'off') {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'You can\'t set your status as `off`'
            }))
        }

        await db.add({
            guild: guildId,
            user: author.id,
            status
        })

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', fieldName: 'I set your AFK status as:', fieldValue: status
        }))
    }
}