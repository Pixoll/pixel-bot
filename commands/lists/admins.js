/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { generateEmbed, basicEmbed, pluralize } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class AdminisCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'admins',
            aliases: ['administrators'],
            group: 'lists',
            description: 'Displays a list of all administrators of the server with their admin roles.',
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
        const members = guild.members.cache

        const admins = members.filter(m => m.permissions.has('ADMINISTRATOR') && !m.user.bot)
        if (!admins || admins.size === 0) {
            const embed = basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no administrators.'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        const adminsList = admins.sort((a, b) => b.roles.highest.position - a.roles.highest.position)
            .map(mbr => ({
                tag: mbr.user.tag,
                list: mbr.roles.cache.filter(r => r.permissions.has('ADMINISTRATOR'))
                    .sort((a, b) => b.position - a.position).map(r => r.name).join(', ') || 'None'
            }))

        await generateEmbed({ message, interaction }, adminsList, {
            authorName: `There's ${pluralize('administrator', adminsList.length)}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            keyTitle: { suffix: 'tag' }
        })
    }
}