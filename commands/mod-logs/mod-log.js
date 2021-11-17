/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { stripIndent, oneLine } = require('common-tags')
const { MessageEmbed, User } = require('discord.js')
const { capitalize, basicEmbed, docId } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class ModLogCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'modlog',
            group: 'mod-logs',
            description: 'Display a single moderation log.',
            details: oneLine`
                \`modlog id\` has to be a valid mod log id.
                To see all the mod logs in this server use the \`modlogs\` command.
            `,
            format: 'modlog [modlog id]',
            examples: [`modlog ${docId()}`],
            userPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true,
            args: [{
                key: 'modlogId',
                label: 'mod log id',
                prompt: 'What is the id of the mod log you want to view?',
                type: 'string',
                max: 12
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.modlogId The mod log id
     */
    async run(message, { modlogId }) {
        const { guild } = message
        const db = guild.database.moderations

        const modLog = await db.fetch(modlogId)
        if (!modLog) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That id is either invalid or it does not exist.'
            }))
        }

        const { users } = this.client

        /** @type {User} */
        const user = await users.fetch(modLog.user.id).catch(() => null)
        /** @type {User} */
        const moderator = await users.fetch(modLog.mod.id).catch(() => null)
        const duration = modLog.duration ? `**Duration:** ${modLog.duration}` : ''

        const modlogInfo = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`Mod log ${modLog._id}`, user?.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
                **Type:** ${capitalize(modLog.type)}
                **User:** ${user?.tag || 'Unable to fetch user.'}
                **Moderator:** ${moderator?.tag || 'Unable to fetch user.'}
                **Reason:** ${modLog.reason}
                ${duration}
            `)
            .setFooter('Created at')
            .setTimestamp(modLog.createdAt)

        await message.replyEmbed(modlogInfo)
    }
}