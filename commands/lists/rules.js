/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags');
const { Command, CommandInstances } = require('pixoll-commando');
const { generateEmbed, basicEmbed, confirmButtons, replyAll } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class RulesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rules',
            group: 'lists',
            description: 'Displays all the rules of this server. Use the `rule` command to add rules.',
            guildOnly: true,
            format: stripIndent`
                rules <view> - Display the server rules.
                rules clear - Delete all of the server rules (server owner only).
            `,
            args: [{
                key: 'subCommand',
                label: 'sub-command',
                prompt: 'What sub-command do you want to use?',
                type: 'string',
                oneOf: ['view', 'clear'],
                default: 'view',
            }],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'view',
                        description: 'Display the server rules.',
                    },
                    {
                        type: 'subcommand',
                        name: 'clear',
                        description: 'Delete all of the server rules (server owner only).',
                    },
                ],
            },
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'view'|'clear'} args.subCommand The sub-command to use
     */
    async run({ message, interaction }, { subCommand }) {
        subCommand = subCommand.toLowerCase();
        const { guild } = message || interaction;
        this.db = guild.database.rules;

        const data = await this.db.fetch();

        if (!data || data.rules.length === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'BLUE',
                emoji: 'info',
                description: 'The are no saved rules for this server. Use the `rule` command to add rules.',
            }));
        }

        switch (subCommand) {
            case 'view':
                return await this.view({ message, interaction }, data.rules);
            case 'clear':
                return await this.clear({ message, interaction }, data);
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {string[]} rules The rules list
     */
    async view({ message, interaction }, rulesList) {
        const { guild } = message || interaction;

        await generateEmbed({ message, interaction }, rulesList, {
            number: 5,
            authorName: `${guild.name}'s rules`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            title: 'Rule',
            hasObjects: false,
        });
    }

    /**
     * The `clear` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {Collection<string, ReminderSchema>} data The rules data
     */
    async clear({ message, interaction }, data) {
        const { client, guild } = message || interaction;
        const author = message?.author || interaction.user;

        if (!client.isOwner(author) && guild.ownerId !== author.id) {
            return await this.onBlock({ message, interaction }, 'guildOwnerOnly');
        }

        const confirmed = await confirmButtons({ message, interaction }, 'delete all of the server rules');
        if (!confirmed) return;

        await this.db.delete(data);

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: 'All the server rules have been deleted.',
        }));
    }
};
