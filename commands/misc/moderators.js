const { oneLine } = require('common-tags')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { isMod, generateEmbed, basicEmbed, pluralize } = require('../../utils')
const { GuildMember, Collection } = require('discord.js')

/** A command that can be run in a client */
module.exports = class ModeratorsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'moderators',
            aliases: ['mods'],
            group: 'misc',
            description: oneLine`
                Displays a list of all moderators (excluding administrators, use the \`admins\`
                command for a list of the server's admins) of this server with their mod roles.
            `,
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
        const mods = members?.filter(m => isMod(m, true) && !m.user.bot)
        if (!mods || mods.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no moderators.'
            }))
        }

        const modsList = mods.map(({ user, roles }) => {
            const rolesList = roles.cache.filter(m => isMod(m, true)).sort((a, b) => b.position - a.position).map(r => r)
            return {
                tag: user.tag,
                roles: rolesList,
                list: rolesList.map(r => r.name).join(', ') || 'None'
            }
        }).sort((a, b) => b.roles[0]?.position - a.roles[0]?.position)

        await generateEmbed(message, modsList, {
            authorName: `There's ${pluralize('moderator', modsList.length)}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            keyTitle: { suffix: 'tag' },
            keysExclude: ['roles']
        })
    }
}