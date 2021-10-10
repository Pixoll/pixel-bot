const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { User } = require('discord.js')
const { generateEmbed, basicEmbed, pluralize, userDetails } = require('../../utils')
const { moderations } = require('../../mongo/schemas')

/** A command that can be run in a client */
module.exports = class InfractionsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'infractions',
            group: 'mod',
            description: 'Displays a list of infractions of a user.',
            details: userDetails,
            format: 'infractions [user]',
            examples: ['infractions Pixoll'],
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [{
                key: 'user',
                prompt: 'What user do you want to get the infractions from?',
                type: 'user'
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to get the infractions from
     */
    async run(message, { user }) {
        const { guildId } = message

        const mods = await moderations.find({ guild: guildId, user: { id: user.id } })
        if (mods.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'That user has no infractions.'
            }))
        }

        const filterMenu = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(`${message.id}:menu`)
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

        await generateEmbed(message, mods, {
            authorName: `${user.username} has ${pluralize('infraction', mods.length)}`,
            authorIconURL: user.displayAvatarURL({ dynamic: true }),
            title: ' |  ID:',
            keyTitle: { prefix: 'type' },
            keysExclude: ['__v', 'updatedAt', 'guild', '_id', 'user'],
            useDocId: true,
            components: [filterMenu]
        })
    }
}