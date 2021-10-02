const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { oneLine } = require('common-tags')
const { User } = require('discord.js')
const { generateEmbed, basicEmbed, pluralize, userDetails } = require('../../utils')
const { moderations } = require('../../mongo/schemas')
const { ModerationSchema } = require('../../mongo/typings')

/** A command that can be run in a client */
module.exports = class ModLogsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mod-logs',
            aliases: ['modlogs'],
            group: 'mod',
            description:
                'Displays all moderator logs of the server of from a specific user, or all if none is specified'
            ,
            details: userDetails,
            format: 'modlogs <user>',
            examples: ['modlogs Pixoll'],
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [{
                key: 'user',
                prompt: 'What user do you want to get the mod logs from?',
                type: 'user',
                required: false
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to get the mod logs from
     */
    async run(message, { user }) {
        const { guild, guildId } = message

        /** @type {ModerationSchema} */
        const query = user ? {
            guild: guildId,
            mod: user.id
        } : {
            guild: guildId
        }

        /** @type {ModerationSchema[]} */
        const modLogs = await moderations.find(query)
        if (modLogs.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no moderation logs.'
            }))
        }

        const avatarURL = user?.displayAvatarURL({ dynamic: true }) || guild.iconURL({ dynamic: true })

        await generateEmbed(message, modLogs, {
            authorName: oneLine`
                ${user ? `${user.username} has` : 'There\'s'}
                ${pluralize('mod log', modLogs.length)}
            `,
            authorIconURL: avatarURL,
            title: ' |  Id:',
            keyTitle: { prefix: 'type' },
            keysExclude: ['updatedAt', 'guild', user ? 'mod' : null],
            useDocId: true
        })
    }
}