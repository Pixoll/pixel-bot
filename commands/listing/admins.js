const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { generateEmbed, basicEmbed, pluralize } = require('../../utils')

/** A command that can be run in a client */
module.exports = class AdministratorsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'administrators',
            aliases: ['admins'],
            group: 'lists',
            description: 'Displays a list of all administrators of the server with their admin roles.',
            guildOnly: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const { guild } = message
        const members = guild.members.cache

        const admins = members.filter(m => m.permissions.has('ADMINISTRATOR') && !m.user.bot)
        if (!admins || admins.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no administrators.'
            }))
        }

        const adminsList = admins.sort((a, b) => b.roles.highest.position - a.roles.highest.position)
            .map(mbr => ({
                tag: mbr.user.tag,
                list: mbr.roles.cache.filter(r => r.permissions.has('ADMINISTRATOR'))
                    .sort((a, b) => b.position - a.position).map(r => r.name).join(', ') || 'None'
            }))

        await generateEmbed(message, adminsList, {
            authorName: `There's ${pluralize('administrator', adminsList.length)}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            keyTitle: { suffix: 'tag' }
        })
    }
}