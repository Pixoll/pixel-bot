"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const lodash_1 = require("lodash");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'What sub-command do you want to use?',
        type: 'string',
        oneOf: ['command', 'group'],
        parse(value) {
            return value.toLowerCase();
        },
    }, {
        key: 'commandOrGroup',
        label: 'command or group',
        prompt: 'What command or group would you like to toggle?',
        type: ['command', 'group'],
        async validate(value, message, argument) {
            if (typeof value === 'undefined')
                return false;
            const subCommand = (0, utils_1.getSubCommand)(message);
            const isValid = await argument.type?.validate(value, message, argument) ?? true;
            if (isValid !== true)
                return isValid;
            if (subCommand === 'command') {
                const commandType = argument.client.registry.types.get('command');
                const command = await commandType.parse(value, message, argument);
                return !(command?.hidden || command?.ownerOnly);
            }
            const groupType = argument.client.registry.types.get('group');
            const group = await groupType.parse(value, message, argument);
            return group?.id !== 'owner';
        },
    }];
class ToggleCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'toggle',
            group: 'utility',
            description: 'Toggles a command or group on/off.',
            details: '`name` can be either a command\'s name or alias, or a group\'s name.',
            format: (0, common_tags_1.stripIndent) `
                toggle command [name] - Toggle a command on/off.
                toggle group [name] - Toggle a group on/off.
            `,
            examples: [
                'toggle command ban',
                'toggle group moderation',
            ],
            userPermissions: ['Administrator'],
            guarded: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'command',
                    description: 'Toggle a command on/off.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'command',
                            description: 'What command would you like to toggle?',
                            required: true,
                            autocomplete: true,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'group',
                    description: 'Toggle a group on/off.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'group',
                            description: 'What group would you like to toggle?',
                            required: true,
                            autocomplete: true,
                        }],
                }],
        });
    }
    async run(context, { subCommand, commandOrGroup, command, group }) {
        const { client, guildId, guild } = context;
        const resolvedCommand = resolveCommand(client, command ?? commandOrGroup);
        const resolvedGroup = resolveGroup(client, group ?? commandOrGroup);
        const db = guild?.database.disabled || this.client.database.disabled;
        const data = await db.fetch(guildId ? {} : { global: true });
        switch (subCommand) {
            case 'command':
                return await this.runCommand(context, resolvedCommand, db, data);
            case 'group':
                return await this.runGroup(context, resolvedGroup, db, data);
        }
    }
    /**
     * The `command` sub-command
     */
    async runCommand(context, command, db, data) {
        if (!command)
            return;
        if (command.guarded) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: `The \`${command.name}\` command is guarded, and thus it cannot be disabled.`,
            }));
            return;
        }
        const { guildId } = context;
        const isEnabled = command.isEnabledIn(guildId, true);
        const global = guildId ? '' : ' globally';
        command.setEnabledIn(guildId, !isEnabled);
        if (data) {
            await db.update(data, isEnabled
                ? { $push: { commands: command.name } }
                : { $pull: { commands: command.name } });
        }
        else {
            await db.add({
                guild: guildId ?? undefined,
                global: !guildId,
                commands: isEnabled ? [command.name] : [],
                groups: [],
            });
        }
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `Toggled the \`${command.name}\` command${global}`,
            fieldValue: `**New status:** ${!isEnabled ? 'Enabled' : 'Disabled'}`,
        }));
    }
    /**
     * The `group` sub-command
     */
    async runGroup(context, group, db, data) {
        if (!group)
            return;
        if (group.guarded) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: `The \`${group.name}\` group is guarded, and thus it cannot be disabled.`,
            }));
            return;
        }
        const { guildId } = context;
        const isEnabled = group.isEnabledIn(guildId);
        const global = guildId ? '' : ' globally';
        group.setEnabledIn(guildId, !isEnabled);
        if (data) {
            await db.update(data, isEnabled
                ? { $push: { groups: group.name } }
                : { $pull: { groups: group.name } });
        }
        else {
            await db.add({
                guild: guildId ?? undefined,
                global: !guildId,
                commands: [],
                groups: !isEnabled ? [group.name] : [],
            });
        }
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `Toggled the \`${group.name}\` group${global}`,
            fieldValue: `**New status:** ${!isEnabled ? 'Enabled' : 'Disabled'}`,
        }));
    }
    async runAutocomplete(interaction) {
        const { client, options } = interaction;
        const { commands, groups } = client.registry;
        const subCommand = options.getSubcommand().toLowerCase();
        const query = options.getFocused().toLowerCase();
        const isCommand = subCommand === 'command';
        const rawMatches = isCommand
            ? commands.filter(commandFilter(query)).map(command => command.name)
            : groups.filter(groupFilter(query)).map(group => group.id);
        const matches = rawMatches
            .slice(0, 25)
            .sort()
            .map(identifier => ({
            name: isCommand
                ? (0, lodash_1.capitalize)(identifier)
                : groups.get(identifier)?.name ?? (0, lodash_1.capitalize)(identifier),
            value: identifier,
        }));
        await interaction.respond(matches);
    }
}
exports.default = ToggleCommand;
function commandFilter(query) {
    return (command) => {
        if (command.hidden || command.ownerOnly)
            return false;
        return command.name.includes(query)
            || command.aliases.some(alias => alias.includes(query));
    };
}
function groupFilter(query) {
    return (group) => group.id !== 'owner' && (group.id.includes(query)
        || group.name.includes(query));
}
function resolveCommand(client, command) {
    if (!command || command instanceof pixoll_commando_1.CommandGroup)
        return null;
    return client.registry.resolveCommand(command);
}
function resolveGroup(client, group) {
    if (!group || group instanceof pixoll_commando_1.Command)
        return null;
    return client.registry.resolveGroup(group);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWxpdHkvdG9nZ2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUdvQjtBQUNwQixtQ0FBb0M7QUFDcEMscURBY3lCO0FBQ3pCLHVDQUFrRTtBQUVsRSxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFlBQVk7UUFDakIsS0FBSyxFQUFFLGFBQWE7UUFDcEIsTUFBTSxFQUFFLHNDQUFzQztRQUM5QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUM7UUFDM0IsS0FBSyxDQUFDLEtBQWE7WUFDZixPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixDQUFDO0tBQ0osRUFBRTtRQUNDLEdBQUcsRUFBRSxnQkFBZ0I7UUFDckIsS0FBSyxFQUFFLGtCQUFrQjtRQUN6QixNQUFNLEVBQUUsaURBQWlEO1FBQ3pELElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUM7UUFDMUIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBa0I7WUFDbEYsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBQy9DLE1BQU0sVUFBVSxHQUFHLElBQUEscUJBQWEsRUFBYSxPQUFPLENBQUMsQ0FBQztZQUN0RCxNQUFNLE9BQU8sR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDO1lBQ2hGLElBQUksT0FBTyxLQUFLLElBQUk7Z0JBQUUsT0FBTyxPQUFPLENBQUM7WUFDckMsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO2dCQUMxQixNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsTUFB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