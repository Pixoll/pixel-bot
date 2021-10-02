const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { GuildBan, Collection } = require('discord.js')
const { basicEmbed, generateEmbed, abcOrder, pluralize } = require('../../utils')

/** A command that can be run in a client */
module.exports = class BansCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bans',
            group: 'mod',
            description: 'Displays all the bans of this server, or look for a specific ban.',
            clientPermissions: ['BAN_MEMBERS', 'MANAGE_MESSAGES'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const { guild } = message

        /** @type {Collection<string, GuildBan>} */
        const bans = await guild.bans.fetch().catch(() => null)
        if (!bans || bans.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no bans in this server.'
            }))
        }

        const bansList = bans.map(({ user, reason }) => ({
            tag: user.tag,
            id: user.id,
            reason: reason?.replace(/%20/g, ' ') || 'No reason given.'
        })).sort((a, b) =>
            abcOrder(a.tag.toUpperCase(), b.tag.toUpperCase())
        )

        await generateEmbed(message, bansList, {
            authorName: `${guild.name} has  ${pluralize('ban', bansList.length)}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            keyTitle: { suffix: 'tag' }
        })
    }
}