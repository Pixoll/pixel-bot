const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { generateEmbed, basicEmbed, pluralize } = require('../../utils')
const { GuildMember, Collection } = require('discord.js')

/** A command that can be run in a client */
module.exports = class AdministratorsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'administrators',
            aliases: ['admins'],
            group: 'misc',
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

        /** @type {Collection<string, GuildMember>} */
        const members = await guild.members.fetch().catch(() => null)
        const admins = members?.filter(m => m.permissions.has('ADMINISTRATOR') && !m.user.bot)
        if (!admins || admins.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no administrators.'
            }))
        }

        const adminsList = admins.map(({ user, roles }) => {
            const rolesList = roles.cache.filter(r => r.permissions.has('ADMINISTRATOR'))
                .sort((a, b) => b.position - a.position).map(r => r)
            return {
                tag: user.tag,
                roles: rolesList,
                list: rolesList.map(r => r.name).join(', ') || 'None'
            }
        }).sort((a, b) => b.roles[0]?.position - a.roles[0]?.position)

        await generateEmbed(message, adminsList, {
            authorName: `There's ${pluralize('admin', adminsList.length)}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            keyTitle: { suffix: 'tag' },
            keysExclude: ['roles']
        })
    }
}