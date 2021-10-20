const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed } = require('../../utils')
const { stripIndent } = require('common-tags')

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
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [{
                key: 'status',
                prompt: 'What is the status you want to set? Responf with `off` to remove it (if existent).',
                type: 'string',
                max: 512
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.status The status to set or `off`
     */
    async run(message, { status }) {
        const { author, guildId, guild } = message
        const db = guild.database.afk

        const afkStatus = await db.fetch({ guild: guildId, user: author.id }, true)

        if (afkStatus) {
            if (status.toLowerCase() === 'off') {
                await afkStatus.deleteOne()

                return await message.replyEmbed(basicEmbed({
                    color: 'GREEN', description: `Welcome back ${author.toString()}, I removed your AFK status`
                }))
            }

            await afkStatus.updateOne({ status })

            return await message.replyEmbed(basicEmbed({
                color: 'GREEN', emoji: 'check',
                fieldName: 'I updated your AFK status to:', fieldValue: status
            }))
        }

        if (status.toLowerCase() === 'off') {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'You can\'t set your status as `off`'
            }))
        }

        await db.add({
            guild: guildId,
            user: author.id,
            status
        })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            fieldName: 'I set your AFK status as:', fieldValue: status
        }))
    }
}