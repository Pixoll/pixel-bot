const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { stripIndent } = require('common-tags')
const { MessageEmbed, User } = require('discord.js')
const { capitalize, basicEmbed, docId } = require('../../utils')
const { moderations } = require('../../mongo/schemas')
const { ModerationSchema } = require('../../mongo/typings')

/** A command that can be run in a client */
module.exports = class ModLogCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'modlog',
            group: 'mod',
            description: 'Show or delete a single moderation log.',
            details: stripIndent`
                The \`view\` sub-command will display the details of a single mod log.
                \`modlog id\` has to be a valid mod log Id. To see all the mod logs in this server use the \`modlogs\` command.
                The \`delete\` sub-command will delete the specified \`modlog id\`.
            `,
            format: stripIndent`
                modlog view [modlog id]
                modlog delete [modlog id]
            `,
            examples: [
                `modlog view ${docId()}`,
                `modlog delete ${docId()}`
            ],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['view', 'delete']
                },
                {
                    key: 'modlogId',
                    label: 'mod log id',
                    prompt: 'What is the Id of the mod log you want to view/delete?',
                    type: 'string',
                    max: 12
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {'view'|'delete'} args.subCommand The sub-command
     * @param {string} args.modlogId The mod log Id
     */
    async run(message, { subCommand, modlogId }) {
        subCommand = subCommand.toLowerCase()
        const { guildId } = message

        /** @type {ModerationSchema} */
        const modLog = await moderations.findOne({ guild: guildId, _id: modlogId })
        if (!modLog) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That id is either invalid or it does not exist.'
            }))
        }

        switch (subCommand) {
            case 'view':
                return await this.view(message, modLog)
            case 'delete':
                return await this.delete(message, modLog)
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {ModerationSchema} modLog The moderation log to view
     */
    async view(message, modLog) {
        const { users } = this.client

        /** @type {User} */
        const user = await users.fetch(modLog.user).catch(() => null)
        /** @type {User} */
        const moderator = await users.fetch(modLog.mod).catch(() => null)
        const duration = modLog.duration ? `**>** **Duration:** ${modLog.duration}` : ''

        const modlogInfo = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`Mod log ${modLog._id}`, user?.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Type:** ${capitalize(modLog.type)}
                **>** **User:** ${user?.tag || 'Unable to fetch user.'}
                **>** **Moderator:** ${moderator?.tag || 'Unable to fetch user.'}
                **>** **Reason:** ${modLog.reason}
                ${duration}
            `)
            .setFooter('Created at')
            .setTimestamp(modLog.createdAt)

        await message.replyEmbed(modlogInfo)
    }

    /**
     * The `delete` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {ModerationSchema} modLog The moderation log to delete
     */
    async delete(message, modLog) {
        await modLog.deleteOne()

        return await message.replyEmbed(basicEmbed({
            color: 'green', emoji: 'check', description: `Deleted mod log with id \`${modLog._id}\``
        }))
    }
}