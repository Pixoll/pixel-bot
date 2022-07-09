/* eslint-disable no-unused-vars */
const { Command, CommandInstances, ModerationSchema } = require('pixoll-commando');
const { stripIndent, oneLine } = require('common-tags');
const { MessageEmbed, User } = require('discord.js');
const { basicEmbed, docId, confirmButtons, timestamp, replyAll } = require('../../utils/functions');
const { capitalize } = require('lodash');
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
                \`modlog ID\` has to be a valid mod log ID.
                To see all the mod logs in this server use the \`modlogs\` command.
            `,
            format: stripIndent`
                modlog view [modlog ID] - Display a mod log's information.
                modlog delete [modlog ID] - Delete a mod log (admins only).
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
                    label: 'modlog ID',
                    prompt: 'What is the ID of the mod log you want to view?',
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
                            description: 'The ID of the mod log to display.',
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
                            description: 'The ID of the mod log to delete.',
                            required: true
                        }]
                    }
                ]
            }
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'view'|'delete'} args.subCommand The sub-command to use
     * @param {string} args.modlogId The mod log ID
     */
    async run({ message, interaction }, { subCommand, modlogId }) {
        subCommand = subCommand.toLowerCase();
        const { guild } = message || interaction;
        this.db = guild.database.moderations;

        const modLog = await this.db.fetch(modlogId);
        if (!modLog) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That ID is either invalid or it does not exist.'
            }));
        }

        switch (subCommand) {
            case 'view':
                return await this.view({ message, interaction }, modLog);
            case 'delete':
                return await this.delete({ message, interaction }, modLog);
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {ModerationSchema} modlog The modlog to view
     */
    async view({ message, interaction }, modlog) {
        const { users } = this.client;

        /** @type {User} */
        const user = await users.fetch(modlog.userId).catch(() => null);
        /** @type {User} */
        const moderator = await users.fetch(modlog.modId).catch(() => null);
        const duration = modlog.duration ? `**Duration:** ${modlog.duration}` : '';

        const modlogInfo = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `Mod log ${modlog._id}`, iconURL: user?.displayAvatarURL({ dynamic: true })
            })
            .setDescription(stripIndent`
                **Type:** ${capitalize(modlog.type)}
                **User:** ${`${user.toString()} ${user?.tag}` || 'Unable to fetch user.'}
                **Moderator:** ${`${moderator.toString()} ${moderator?.tag}` || 'Unable to fetch user.'}
                **Reason:** ${modlog.reason}
                ${duration}
                **Date:** ${timestamp(modlog.createdAt)}
            `)
            .setTimestamp();

        await replyAll({ message, interaction }, modlogInfo);
    }

    /**
     * The `delete` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {ModerationSchema} modlog The modlog to delete
     */
    async delete({ message, interaction }, modlog) {
        const { client, member } = message || interaction;
        const user = message?.author || interaction.user;
        if (!client.isOwner(user) || member.permissions.has('ADMINISTRATOR')) {
            return await this.onBlock({ message, interaction }, 'userPermissions', { missing: ['ADMINISTRATOR'] });
        }

        const confirmed = await confirmButtons({ message, interaction }, 'delete mod log', modlog._id, modlog);
        if (!confirmed) return;

        const activeDB = this.db.guild.database.active;
        const activeLog = await activeDB.fetch(`\`${modlog._id}\``);

        if (activeLog) await activeDB.delete(activeLog);
        await this.db.delete(modlog);

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Deleted mod log with ID \`${modlog._id}\``
        }));
    }
};
