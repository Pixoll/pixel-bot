/* eslint-disable no-unused-vars */
const { oneLine } = require('common-tags')
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { isMod, generateEmbed, basicEmbed, pluralize } = require('../../utils')
/* eslint-enable no-unused-vars */

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
            guildOnly: true,
            slash: {
                description: 'Displays a list of all moderators of this server with their mod roles.'
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const { guild } = message || interaction

        const members = guild.members.cache
        const mods = members?.filter(m => isMod(m, true) && !m.user.bot)
        if (!mods || mods.size === 0) {
            const embed = basicEmbed({
                color: 'BLUE',
                emoji: 'info',
                description: 'There are no moderators, try running the `admins` command instead.'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        const modsList = mods.sort((a, b) => b.roles.highest.position - a.roles.highest.position)
            .map(mbr => ({
                tag: mbr.user.tag,
                list: mbr.roles.cache.filter(m => isMod(m, true)).sort((a, b) => b.position - a.position)
                    .map(r => r.name).join(', ') || 'None'
            }))

        await generateEmbed({ message, interaction }, modsList, {
            authorName: `There's ${pluralize('moderator', modsList.length)}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            keyTitle: { suffix: 'tag' }
        })
    }
}