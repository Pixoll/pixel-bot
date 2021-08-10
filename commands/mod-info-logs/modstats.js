const { Command, CommandoMessage } = require('discord.js-commando')
const { MessageEmbed, User } = require('discord.js')
const { getDayDiff, capitalize } = require('../../utils/functions')
const { moderations } = require('../../utils/mongodb-schemas')
const { stripIndent } = require('common-tags')

/**
 * filters the stats by type
 * @param {array} stats the stats
 * @param {string[]} filter the type of the punishment
 * @param {string} row the name of the row
 * @param {number} pad the padding for the content
 */
function getStats(stats, filter, row, pad) {
    const seven = stats.filter(({ type, createdAt }) => filter.includes(type) && getDayDiff(createdAt) <= 7).length.toString()
    const thirty = stats.filter(({ type, createdAt }) => filter.includes(type) && getDayDiff(createdAt) <= 30).length.toString()
    const all = stats.filter(({ type }) => filter.includes(type)).length.toString()

    return row.padEnd(pad, ' ') + seven.padEnd(pad, ' ') + thirty.padEnd(pad, ' ') + all
}

/**
 * creates an embed with the user's mod starts
 * @param {array} stats the data to look up into
 * @param {User} user the user to get the mod starts from
 */
function modStatsEmbed(stats, user) {
    const pad = 10

    const header = 'Type'.padEnd(pad, ' ') + '7 days'.padEnd(pad, ' ') + '30 days'.padEnd(pad, ' ') + 'All time'

    const mutes = getStats(stats, ['mute'], 'Mutes', pad)
    const bans = getStats(stats, ['ban', 'temp-ban'], 'Bans', pad)
    const kicks = getStats(stats, ['kick'], 'Kicks', pad)
    const warns = getStats(stats, ['warn'], 'Warns', pad)
    const total = getStats(stats, ['mute', 'ban', 'temp-ban', 'kick', 'warn'], 'Total', pad)

    const table = '```' + `${header}\n\n${mutes}\n${bans}\n${kicks}\n${warns}\n${total}` + '```'

    const modStats = new MessageEmbed()
        .setColor('#4c9f4c')
        .setAuthor(`${user.username}'s moderation statistics`, user.displayAvatarURL({ dynamic: true }))
        .setDescription(table)
        .setFooter(`User ID: ${user.id}`)
        .setTimestamp()

    return modStats
}

module.exports = class modstats extends Command {
    constructor(client) {
        super(client, {
            name: 'modstats',
            group: 'mod',
            memberName: 'modstats',
            description: 'Displays moderation statistics for a moderator or admin.',
            details: stripIndent`
                If \`user\` is not specified, I will show your own moderation statistics.
                \`user\` can be a user's username, ID or mention.
            `,
            format: 'modstats <user>',
            examples: ['modstats Pixoll'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [{
                key: 'user',
                prompt: 'What user do you want to get the statistics from?',
                type: 'user',
                default: ''
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {User} args.user The user to get the mod stats from
     */
    async run(message, { user }) {
        const { guild, author } = message

        const modStats = await moderations.find({ guild: guild.id, mod: user?.id || author.id })

        if (!user) message.say(modStatsEmbed(modStats, author))
        else message.say(modStatsEmbed(modStats, user))
    }
}