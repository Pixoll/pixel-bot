"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const lodash_1 = require("lodash");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'What sub-command do you want to use?',
        type: 'string',
        oneOf: ['command', 'group'],
    }, {
        key: 'commandOrGroup',
        label: 'command or group',
        prompt: 'What command or group would you like to toggle?',
        type: ['command', 'group'],
        async validate(value, message, argument) {
            const subCommand = (0, functions_1.getSubCommand)(message);
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
        const lcSubCommand = subCommand.toLowerCase();
        const resolvedCommand = resolveCommand(client, command ?? commandOrGroup);
        const resolvedGroup = resolveGroup(client, group ?? commandOrGroup);
        const db = guild?.database.disabled || this.client.database.disabled;
        const data = await db.fetch(guildId ? {} : { global: true });
        switch (lcSubCommand) {
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
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
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
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
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
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
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
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWxpdHkvdG9nZ2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUdvQjtBQUNwQixtQ0FBb0M7QUFDcEMscURBY3lCO0FBQ3pCLHFEQUE0RTtBQUU1RSxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFlBQVk7UUFDakIsS0FBSyxFQUFFLGFBQWE7UUFDcEIsTUFBTSxFQUFFLHNDQUFzQztRQUM5QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUM7S0FDOUIsRUFBRTtRQUNDLEdBQUcsRUFBRSxnQkFBZ0I7UUFDckIsS0FBSyxFQUFFLGtCQUFrQjtRQUN6QixNQUFNLEVBQUUsaURBQWlEO1FBQ3pELElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUM7UUFDMUIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFhLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUN0RSxNQUFNLFVBQVUsR0FBRyxJQUFBLHlCQUFhLEVBQWEsT0FBTyxDQUFDLENBQUM7WUFDdEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQztZQUNoRixJQUFJLE9BQU8sS0FBSyxJQUFJO2dCQUFFLE9BQU8sT0FBTyxDQUFDO1lBQ3JDLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtnQkFDMUIsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQTRCLENBQUM7Z0JBQzdGLE1BQU0sT0FBTyxHQUFHLE1BQU0sV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFF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