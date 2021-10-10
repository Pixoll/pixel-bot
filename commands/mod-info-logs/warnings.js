const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { User } = require('discord.js')
const { oneLine } = require('common-tags')
const { generateEmbed, basicEmbed, pluralize, userDetails } = require('../../utils')
const { moderations } = require('../../mongo/schemas')
const { ModerationSchema } = require('../../mongo/typings')

/** A command that can be run in a client */
module.exports = class WarningsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'warnings',
            aliases: ['warns'],
            group: 'mod',
            description: 'Displays warnings of a specific user, or all warnings on this server.',
            details: userDetails,
            format: 'warnings <user>',
            examples: ['warnings Pixoll'],
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            deprecated: true,
            replacing: 'modlogs',
            args: [{
                key: 'user',
                prompt: 'What user do you want to get the warnings from?',
                type: 'user',
                required: false
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to get the warnings from
     */
    async run(message, { user }) {
        const { guild, guildId } = message

        /** @type {ModerationSchema} */
        const query = user ? {
            type: 'warn',
            guild: guildId,
            mod: { id: user.id }
        } : {
            type: 'warn',
            guild: guildId
        }

        /** @type {ModerationSchema[]} */
        const warns = await moderations.find(query)
        if (warns.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no warnings.'
            }))
        }

        const avatarURL = user?.displayAvatarURL({ dynamic: true }) || guild.iconURL({ dynamic: true })

        await generateEmbed(message, warns, {
            authorName: oneLine`
                ${user ? `${user.username} has` : 'There\'s'}
                ${pluralize('warning', warns.length)}
            `,
            authorIconURL: avatarURL,
            title: 'Id:',
            keysExclude: ['updatedAt', 'guild', 'type', user ? 'user' : null],
            useDocId: true
        })
    }
}