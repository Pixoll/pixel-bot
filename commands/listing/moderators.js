const { oneLine } = require('common-tags')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { isMod, generateEmbed, basicEmbed, pluralize } = require('../../utils')

/** A command that can be run in a client */
module.exports = class ModeratorsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'moderators',
            aliases: ['mods'],
            group: 'lists',
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

        const members = guild.members.cache
        const mods = members?.filter(m => isMod(m, true) && !m.user.bot)
        if (!mods || mods.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info',
                description: 'There are no moderators, try running the `admins` command instead.'
            }))
        }

        const modsList = mods.sort((a, b) => b.roles.highest.position - a.roles.highest.position)
            .map(mbr => ({
                tag: mbr.user.tag,
                list: mbr.roles.cache.filter(m => isMod(m, true)).sort((a, b) => b.position - a.position)
                    .map(r => r.name).join(', ') || 'None'
            }))

        await generateEmbed(message, modsList, {
            authorName: `There's ${pluralize('moderator', modsList.length)}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            keyTitle: { suffix: 'tag' }
        })
    }
}