const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { Invite, Collection } = require('discord.js')
const { generateEmbed, basicEmbed, pluralize } = require('../../utils')

/** A command that can be run in a client */
module.exports = class InvitesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'invites',
            group: 'lists',
            description: 'Displays a list of all the invites of this server, ordered by most to least used.',
            clientPermissions: ['MANAGE_GUILD'],
            guildOnly: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const { guild } = message

        /** @type {Collection<string, Invite>} */
        const invites = await guild.invites.fetch().catch(() => null)
        if (!invites || invites.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no invites in this server.'
            }))
        }

        const invitesList = invites.map(inv => ({
            uses: inv.uses,
            inviter: inv.inviter.tag,
            channel: inv.channel.toString(),
            link: inv.url,
            code: inv.code
        })).sort((a, b) => b.uses - a.uses)

        await generateEmbed(message, invitesList, {
            authorName: `There's ${pluralize('invite', invitesList.length)}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            keyTitle: { suffix: 'link' }
        })
    }
}