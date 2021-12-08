/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { GuildBan, Collection, GuildAuditLogs } = require('discord.js')
const { basicEmbed, generateEmbed, abcOrder, replyAll } = require('../../utils/functions')
const { pluralize } = require('../../utils/format')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class BansCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bans',
            group: 'mod-logs',
            description: 'Displays all the bans of the server.',
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true,
            slash: true
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const { guild } = message || interaction

        /** @type {Collection<string, GuildBan>} */
        const bans = await guild.bans.fetch().catch(() => null)
        if (!bans || bans.size === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no bans in this server.'
            }))
        }

        /** @type {GuildAuditLogs} */
        const _banLogs = await guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD' }).catch(() => null)
        const banLogs = _banLogs?.entries.toJSON() || []

        const bansList = []
        for (const [, { user, reason }] of bans) {
            const banLog = banLogs.find(log => log.target.id === user.id)
            const exec = banLog?.executor
            const mod = exec ? {
                mod: { id: exec.id, tag: exec.tag }
            } : {}

            bansList.push({
                tag: user.tag,
                id: user.id,
                ...mod,
                reason: reason?.replace(/%20/g, ' ') || 'No reason given.'
            })
        }

        const sorted = bansList.sort((a, b) => abcOrder(a.tag.toUpperCase(), b.tag.toUpperCase()))

        await generateEmbed({ message, interaction }, sorted, {
            authorName: `${guild.name} has  ${pluralize('ban', bansList.length)}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            keyTitle: { suffix: 'tag' }
        })
    }
}