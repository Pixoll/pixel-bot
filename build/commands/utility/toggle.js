"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
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
            detailedDescription: '`name` can be either a command\'s name or alias, or a group\'s name.',
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
                ? pixoll_commando_1.Util.capitalize(identifier)
                : groups.get(identifier)?.name ?? pixoll_commando_1.Util.capitalize(identifier),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWxpdHkvdG9nZ2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUdvQjtBQUNwQixxREFnQnlCO0FBQ3pCLHVDQUErRDtBQUUvRCxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFlBQVk7UUFDakIsS0FBSyxFQUFFLGFBQWE7UUFDcEIsTUFBTSxFQUFFLHNDQUFzQztRQUM5QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUM7UUFDM0IsS0FBSyxDQUFDLEtBQWE7WUFDZixPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixDQUFDO0tBQ0osRUFBRTtRQUNDLEdBQUcsRUFBRSxnQkFBZ0I7UUFDckIsS0FBSyxFQUFFLGtCQUFrQjtRQUN6QixNQUFNLEVBQUUsaURBQWlEO1FBQ3pELElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUM7UUFDMUIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBa0I7WUFDbEYsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBQy9DLE1BQU0sVUFBVSxHQUFHLElBQUEscUJBQWEsRUFBYSxPQUFPLENBQUMsQ0FBQztZQUN0RCxNQUFNLE9BQU8sR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDO1lBQ2hGLElBQUksT0FBTyxLQUFLLElBQUk7Z0JBQUUsT0FBTyxPQUFPLENBQUM7WUFDckMsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO2dCQUMxQixNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEs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