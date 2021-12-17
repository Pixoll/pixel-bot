/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { oneLine } = require('common-tags')
const { User, MessageActionRow, MessageSelectMenu } = require('discord.js')
const { generateEmbed, basicEmbed, pluralize, replyAll } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class ModLogsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mod-logs',
            aliases: ['modlogs'],
            group: 'mod-logs',
            description: 'Displays all moderator logs of the server of a specific moderator, or all if none is specified',
            details: '`user` has to be a user\'s username, ID or mention.',
            format: 'modlogs <user>',
            examples: ['modlogs Pixoll'],
            modPermissions: true,
            guildOnly: true,
            args: [{
                key: 'user',
                prompt: 'What moderator do you want to get the mod logs from?',
                type: 'user',
                required: false
            }],
            slash: {
                options: [{
                    type: 'user',
                    name: 'user',
                    description: 'The moderator to check their mod logs.'
                }]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to get the mod logs from
     */
    async run({ message, interaction }, { user }) {
        if (interaction) user &&= user.user ?? user

        const { guild } = message || interaction
        const db = guild.database.moderations

        const modLogs = await db.fetchMany(user ? { modId: user.id } : {})
        if (modLogs.size === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no moderation logs.'
            }))
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

        const avatarURL = user?.displayAvatarURL({ dynamic: true }) || guild.iconURL({ dynamic: true })

        await generateEmbed({ message, interaction }, modLogs.toJSON(), {
            authorName: oneLine`
                ${user ? `${user.username} has` : 'There\'s'}
                ${pluralize('mod log', modLogs.size)}
            `,
            authorIconURL: avatarURL,
            title: ' •  ID:',
            keyTitle: { prefix: 'type' },
            keysExclude: ['updatedAt', 'guild', user ? ('modId', 'modTag') : null],
            useDocId: true,
            components: [filterMenu]
        })
    }
}
