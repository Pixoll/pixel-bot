/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { basicEmbed } = require('../../utils')
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

        if (interaction) {
            status = interaction.options.getString('status')
        }

        const afkStatus = await db.fetch({ guild: guildId, user: author.id })

        if (afkStatus) {
            if (status.toLowerCase() === 'off') {
                await afkStatus.deleteOne()

                const embed = basicEmbed({
                    color: 'GREEN', description: `Welcome back ${author.toString()}, I removed your AFK status`
                })
                await interaction?.editReply({ embeds: [embed] })
                await message?.replyEmbed(embed)
                return
            }

            await afkStatus.updateOne({ status })

            const embed = basicEmbed({
                color: 'GREEN', emoji: 'check', fieldName: 'I updated your AFK status to:', fieldValue: status
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        if (status.toLowerCase() === 'off') {
            const embed = basicEmbed({
                color: 'RED', emoji: 'cross', description: 'You can\'t set your status as `off`'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        await db.add({
            guild: guildId,
            user: author.id,
            status
        })

        const embed = basicEmbed({
            color: 'GREEN', emoji: 'check', fieldName: 'I set your AFK status as:', fieldValue: status
        })
        await interaction?.editReply({ embeds: [embed] })
        await message?.replyEmbed(embed)
    }
}