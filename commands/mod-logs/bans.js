/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { GuildBan, Collection, GuildAuditLogs } = require('discord.js')
const { basicEmbed, generateEmbed, abcOrder, pluralize } = require('../../utils')
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
            const embed = basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no bans in this server.'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
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

        await generateEmbed({ message, interaction }, bansList.sort((a, b) =>
            abcOrder(a.tag.toUpperCase(), b.tag.toUpperCase())
        ), {
            authorName: `${guild.name} has  ${pluralize('ban', bansList.length)}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            keyTitle: { suffix: 'tag' }
        })
    }
}