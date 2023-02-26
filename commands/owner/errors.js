/* eslint-disable no-unused-vars */
const { MessageActionRow, MessageSelectMenu, Collection } = require('discord.js');
const { Command, CommandInstances, CommandoMessage, ErrorSchema } = require('pixoll-commando');
const { basicEmbed, generateEmbed, getArgument } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class ErrorsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'errors',
            aliases: ['bugs'],
            group: 'owner',
            description: 'Displays all the errors that have happened in the bot.',
            ownerOnly: true,
            dmOnly: true,
            args: [
                {
                    key: 'subCommand',
                    prompt: 'Do you want to filter or remove an error/bug?',
                    type: 'string',
                    oneOf: ['view', 'remove'],
                    default: 'view',
                },
                {
                    key: 'errorId',
                    label: 'error ID',
                    prompt: 'What specific error do you want to remove?',
                    type: 'string',
                    required: false,
                },
            ],
        });

        this.db = this.client.database.errors;
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'view'|'remove'} args.subCommand The sub-command
     * @param {string} args.errorId The ID of the error to remove
     */
    async run({ message }, { subCommand, errorId }) {
        subCommand = subCommand.toLowerCase();
        const errors = await this.db.fetchMany();
        if (errors.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There have been no errors or bugs lately.',
            }));
        }

        switch (subCommand) {
            case 'view':
                return await this.view(message, errors);
            case 'remove':
                return await this.remove(message, errorId);
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Collection<string, ErrorSchema>} errors The errors collection
     */
    async view(message, errors) {
        const errorsList = errors.map(val => {
            const whatCommand = val.command ? ` at '${val.command}' command` : '';

            return {
                _id: val._id,
                type: val.type,
                message: val.name + whatCommand + (val.message ? (': ' + '``' + val.message + '``') : ''),
                createdAt: val.createdAt,
                files: val.files,
            };
        });

        const filterMenu = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(`${message.id}:menu`)
                .setMaxValues(1).setMinValues(1)
                .setPlaceholder('Filter...')
                .setOptions([
                    { label: 'All', value: 'all' },
                    { label: 'Command error', value: 'Command error' },
                    { label: 'Client error', value: 'Client error' },
                    { label: 'Unhandled rejection', value: 'Unhandled rejection' },
                    { label: 'Uncaught exception', value: 'Uncaught exception' },
                    { label: 'Uncaught exception monitor', value: 'Uncaught exception monitor' },
                    { label: 'Process warning', value: 'Process warning' },
                ])
        );

        await generateEmbed({ message }, errorsList, {
            number: 3,
            authorName: 'Errors and bugs list',
            authorIconURL: this.client.user.displayAvatarURL({ dynamic: true }),
            title: ' •  ID:',
            keyTitle: { prefix: 'type' },
            keysExclude: ['type', '_id'],
            useDocId: true,
            components: [filterMenu],
        });
    }

    /**
     * The `remove` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {string} errorId The ID of the error to remove
     */
    async remove(message, errorId) {
        if (message && !errorId) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1]);
            if (cancelled) return;
            errorId = value;
        }

        const doc = await this.db.fetch(errorId);
        if (!doc) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'I couldn\'t find the error you were looking for.',
            }));
        }
        await this.db.delete(doc);

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Error with ID \`${doc._id}\` has been successfully removed.`,
        }));
    }
};
