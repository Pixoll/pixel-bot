/* eslint-disable no-unused-vars */
const { Command, CommandInstances, CommandGroup, DisabledSchema } = require('pixoll-commando');
const { basicEmbed, getArgument, replyAll } = require('../../utils/functions');
const { stripIndent } = require('common-tags');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class ToggleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'toggle',
            group: 'utility',
            description: 'Toggles a command or group on/off.',
            details: '`name` can be either a command\'s name or alias, or a group\'s name.',
            format: stripIndent`
                toggle command [name] - Toggle a command on/off.
                toggle group [name] - Toggle a group on/off.
            `,
            examples: [
                'toggle command ban',
                'toggle group moderation'
            ],
            userPermissions: ['ADMINISTRATOR'],
            guarded: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['command', 'group']
                },
                {
                    key: 'cmdOrGroup',
                    label: 'command or group',
                    prompt: 'What command or group would you like to toggle?',
                    type: ['command', 'group'],
                    required: false
                }
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'command',
                        description: 'Toggle a command on/off.',
                        options: [{
                            type: 'string',
                            name: 'command',
                            description: 'The command to toggle.',
                            required: true
                        }]
                    },
                    {
                        type: 'subcommand',
                        name: 'group',
                        description: 'Toggle a group on/off.',
                        options: [{
                            type: 'string',
                            name: 'group',
                            description: 'The group to toggle.',
                            required: true,
                            choices: [
                                { name: 'ℹ️ Information', value: 'info' },
                                { name: '📋 Listing', value: 'lists' },
                                { name: '💼 Managing', value: 'managing' },
                                { name: '🎲 Miscellaneous', value: 'misc' },
                                { name: '🛡️ Moderation', value: 'mod' },
                                { name: '🗃 Moderation logs', value: 'mod-logs' },
                                { name: '🛠 Utility', value: 'utility' },
                            ]
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
     * @param {'command'|'group'} args.subCommand The sub-command to use
     * @param {Command|CommandGroup} args.cmdOrGroup The command or group to toggle
     */
    async run({ message, interaction }, { subCommand, cmdOrGroup, command, group }) {
        subCommand = subCommand.toLowerCase();

        try {
            command &&= this.client.registry.resolveCommand(command);
            group &&= this.client.registry.resolveGroup(group);
        } catch {
            command = null;
            group = null;
        }

        const { guildId, guild } = message || interaction;
        this.db = guild?.database.disabled || this.client.database.disabled;

        const data = await this.db.fetch(guildId ? {} : { global: true });

        switch (subCommand) {
            case 'command':
                return await this.command({ message, interaction }, cmdOrGroup ?? command, data);
            case 'group':
                return await this._group({ message, interaction }, cmdOrGroup ?? group, data);
        }
    }

    /**
     * The `command` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {Command} command The command to toggle
     * @param {DisabledSchema} data The disabled commands & groups data
     */
    async command({ message, interaction }, command, data) {
        if (message) {
            while (!(command instanceof Command)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1]);
                if (cancelled) return;
                command = value;
            }
        } else if (!command) {
            return await replyAll({ interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That command doesn\'t exist.'
            }));
        }

        if (command.guarded) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED',
                emoji: 'cross',
                description: `The \`${command.name}\` command is guarded, and thus it cannot be disabled.`
            }));
        }

        const { guildId } = message || interaction;

        const isEnabled = command.isEnabledIn(guildId, true);
        const global = guildId ? '' : ' globally';

        command.setEnabledIn(guildId, !isEnabled);

        if (data) {
            await this.db.update(data, isEnabled ?
                { $push: { commands: command.name } } :
                { $pull: { commands: command.name } }
            );
        } else {
            await this.db.add({
                guild: guildId,
                global: !guildId,
                commands: isEnabled ? [command.name] : [],
                groups: []
            });
        }

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `Toggled the \`${command.name}\` command${global}`,
            fieldValue: `**New status:** ${!isEnabled ? 'Enabled' : 'Disabled'}`
        }));
    }

    /**
     * The `group` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {CommandGroup} group The group to toggle
     * @param {DisabledSchema} data The disabled commands & groups data
     */
    async _group({ message, interaction }, group, data) {
        if (message) {
            while (!(group instanceof CommandGroup)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1]);
                if (cancelled) return;
                group = value;
            }
        }

        if (group.guarded) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED',
                emoji: 'cross',
                description: `The \`${group.name}\` group is guarded, and thus it cannot be disabled.`
            }));
        }

        const { guildId } = message || interaction;

        const isEnabled = guildId ? group.isEnabledIn(guildId) : group._globalEnabled;
        const global = guildId ? '' : ' globally';

        if (guildId) group.setEnabledIn(guildId, !isEnabled);
        else group._globalEnabled = !isEnabled;

        if (data) {
            await this.db.update(data, isEnabled ?
                { $push: { groups: group.name } } :
                { $pull: { groups: group.name } }
            );
        } else {
            await this.db.add({
                guild: guildId,
                global: !guildId,
                commands: [],
                groups: !isEnabled ? [group.name] : []
            });
        }

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `Toggled the \`${group.name}\` group${global}`,
            fieldValue: `**New status:** ${!isEnabled ? 'Enabled' : 'Disabled'}`
        }));
    }
};
