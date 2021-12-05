/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { MessageEmbed, User, Collection } = require('discord.js')
const { stripIndent } = require('common-tags')
const { getDayDiff, code, replyAll } = require('../../utils')
const { ModerationSchema } = require('../../schemas/types')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class ModStatsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mod-stats',
            aliases: ['modstats'],
            group: 'mod-logs',
            description: 'Displays your moderation statistics or for a moderator or admin.',
            details: stripIndent`
                If \`user\` is not specified, I will show your own moderation statistics.
                \`user\` can be a user's username, id or mention.
            `,
            format: 'modstats <user>',
            examples: ['modstats Pixoll'],
            modPermissions: true,
            guildOnly: true,
            args: [{
                key: 'user',
                prompt: 'What moderator do you want to get the statistics from?',
                type: 'user',
                required: false
            }],
            slash: {
                options: [{
                    type: 'user',
                    name: 'user',
                    description: 'The moderator to check their stats.'
                }]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to get the mod stats from
     */
    async run({ message, interaction }, { user }) {
        if (interaction) user = user?.user ?? user

        const { guild } = message || interaction
        const author = message?.author || interaction.user
        const db = guild.database.moderations
        user ??= author

        const stats = await db.fetchMany({ modId: user.id })

        const pad = 10
        const header = 'Type'.padEnd(pad, ' ') + '7 days'.padEnd(pad, ' ') + '30 days'.padEnd(pad, ' ') + 'All time'

        const mutes = this.getStats(stats, 'mute', 'Mutes', pad)
        const bans = this.getStats(stats, ['ban', 'temp-ban'], 'Bans', pad)
        const kicks = this.getStats(stats, 'kick', 'Kicks', pad)
        const warns = this.getStats(stats, 'warn', 'Warns', pad)
        const total = this.getStats(stats, ['mute', 'ban', 'temp-ban', 'kick', 'warn'], 'Total', pad)

        const table = code(`${header}\n\n${mutes}\n${bans}\n${kicks}\n${warns}\n${total}`)

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${user.username}'s moderation statistics`, user.displayAvatarURL({ dynamic: true }))
            .setDescription(table)
            .setFooter(`User id: ${user.id}`)
            .setTimestamp()

        await replyAll({ message, interaction }, embed)
    }

    /**
     * Filters the stats by type
     * @param {Collection<string, ModerationSchema>} stats The stats to filter
     * @param {string|string[]} filter The type of the punishment
     * @param {string} row The name of the row
     * @param {number} pad The padding for the content
     */
    getStats(stats, filter, row, pad) {
        if (typeof filter === 'string') filter = [filter]

        const seven = stats.filter(m => filter.includes(m.type) && getDayDiff(m.createdAt) <= 7).size.toString()
        const thirty = stats.filter(m => filter.includes(m.type) && getDayDiff(m.createdAt) <= 30).size.toString()
        const all = stats.filter(m => filter.includes(m.type)).size.toString()

        return row.padEnd(pad, ' ') + seven.padEnd(pad, ' ') + thirty.padEnd(pad, ' ') + all
    }
}