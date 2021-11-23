/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { User, MessageActionRow, MessageSelectMenu } = require('discord.js')
const { generateEmbed, basicEmbed, pluralize, userDetails } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class InfractionsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'infractions',
            group: 'mod-logs',
            description: 'Displays a list of infractions of a user.',
            details: userDetails,
            format: 'infractions [user]',
            examples: ['infractions Pixoll'],
            userPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true,
            args: [{
                key: 'user',
                prompt: 'What user do you want to get the infractions from?',
                type: 'user'
            }],
            slash: {
                options: [{
                    type: 'user',
                    name: 'user',
                    description: 'The user to check their infractions.',
                    required: true
                }]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to get the infractions from
     */
    async run({ message, interaction }, { user }) {
        if (interaction) user = user.user ?? user

        const { guild } = message || interaction
        const db = guild.database.moderations

        const mods = await db.fetchMany({ userId: user.id })
        if (mods.size === 0) {
            const embed = basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'That user has no infractions.'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        const intMsg = await interaction?.fetchReply()

        const filterMenu = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(`${(message || intMsg).id}:menu`)
                .setMaxValues(1).setMinValues(1)
                .setPlaceholder('Filter...')
                .setOptions([
                    { label: 'All', value: 'all', emoji: '🎲' },
                    { label: 'Bans', value: 'ban', emoji: '822644311140204554' },
                    { label: 'Soft bans', value: 'soft-ban', emoji: '🔨' },
                    { label: 'Temp bans', value: 'temp-ban', emoji: '⏲' },
                    { label: 'Kicks', value: 'kick', emoji: '🥾' },
                    { label: 'Mutes', value: 'mute', emoji: '🔇' },
                    { label: 'Warns', value: 'warn', emoji: '⚠' },
                ])
        )

        await generateEmbed({ message, interaction }, mods.toJSON(), {
            authorName: `${user.username} has ${pluralize('infraction', mods.size)}`,
            authorIconURL: user.displayAvatarURL({ dynamic: true }),
            title: ' |  ID:',
            keyTitle: { prefix: 'type' },
            keysExclude: ['__v', 'updatedAt', 'guild', '_id', 'user'],
            useDocId: true,
            components: [filterMenu]
        })
    }
}