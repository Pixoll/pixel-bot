/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { stripIndent, oneLine } = require('common-tags')
const { MessageEmbed, User } = require('discord.js')
const { capitalize, basicEmbed, docId, confirmButtons, timestamp, replyAll } = require('../../utils/functions')
const { ModerationSchema } = require('../../schemas/types')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class ModLogCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mod-log',
            aliases: ['modlog'],
            group: 'mod-logs',
            description: 'Display or delete a single moderation log.',
            details: oneLine`
                \`modlog id\` has to be a valid mod log id.
                To see all the mod logs in this server use the \`modlogs\` command.
            `,
            format: stripIndent`
                modlog view [modlog id] - Display a mod log's information.
                modlog delete [modlog id] - Delete a mod log (admins only).
            `,
            examples: [`modlog ${docId()}`],
            modPermissions: true,
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
                    prompt: 'What is the id of the mod log you want to view?',
                    type: 'string',
                    max: 12
                }
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'view',
                        description: 'Display a mod log\'s information.',
                        options: [{
                            type: 'string',
                            name: 'modlog-id',
                            description: 'The id of the mod log to display.',
                            required: true
                        }]
                    },
                    {
                        type: 'subcommand',
                        name: 'delete',
                        description: 'Delete a mod log.',
                        options: [{
                            type: 'string',
                            name: 'modlog-id',
                            description: 'The id of the mod log to delete.',
                            required: true
                        }]
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'view'|'delete'} args.subCommand The sub-command to use
     * @param {string} args.modlogId The mod log id
     */
    async run({ message, interaction }, { subCommand, modlogId }) {
        subCommand = subCommand.toLowerCase()
        const { guild } = message || interaction
        this.db = guild.database.moderations

        const modLog = await this.db.fetch(modlogId)
        if (!modLog) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That id is either invalid or it does not exist.'
            }))
        }

        switch (subCommand) {
            case 'view':
                return await this.view({ message, interaction }, modLog)
            case 'delete':
                return await this.delete({ message, interaction }, modLog)
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {ModerationSchema} modlog The modlog to view
     */
    async view({ message, interaction }, modlog) {
        const { users } = this.client

        /** @type {User} */
        const user = await users.fetch(modlog.userId).catch(() => null)
        /** @type {User} */
        const moderator = await users.fetch(modlog.modId).catch(() => null)
        const duration = modlog.duration ? `**Duration:** ${modlog.duration}` : ''

        const modlogInfo = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`Mod log ${modlog._id}`, user?.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
                **Type:** ${capitalize(modlog.type)}
                **User:** ${`${user.toString()} ${user?.tag}` || 'Unable to fetch user.'}
                **Moderator:** ${`${moderator.toString()} ${moderator?.tag}` || 'Unable to fetch user.'}
                **Reason:** ${modlog.reason}
                ${duration}
                **Date:** ${timestamp(modlog.createdAt)}
            `)
            .setTimestamp()

        await replyAll({ message, interaction }, modlogInfo)
    }

    /**
     * The `delete` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {ModerationSchema} modlog The modlog to delete
     */
    async delete({ message, interaction }, modlog) {
        const { client, member } = message || interaction
        const user = message?.author || interaction.user
        if (!client.isOwner(user) || member.permissions.has('ADMINISTRATOR')) {
            return await this.onBlock({ message, interaction }, 'userPermissions', { missing: ['ADMINISTRATOR'] })
        }

        const confirmed = await confirmButtons({ message, interaction }, 'delete mod log', modlog._id, modlog)
        if (!confirmed) return

        const activeDB = this.db.guild.database.active
        const activeLog = await activeDB.fetch(`\`${modlog._id}\``)

        if (activeLog) await activeDB.delete(activeLog)
        await this.db.delete(modlog)

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Deleted mod log with id \`${modlog._id}\``
        }))
    }
}