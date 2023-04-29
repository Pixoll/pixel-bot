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
        oneOf: ['all', 'command', 'group'],
        default: 'all',
        parse(value) {
            return value.toLowerCase();
        },
    }, {
        key: 'commandOrGroup',
        label: 'command or group',
        prompt: 'What command or group would you like to diagnose?',
        type: ['command', 'group'],
        required: false,
        isEmpty(_, message) {
            const subCommand = (0, utils_1.getSubCommand)(message, args[0].default);
            return subCommand === 'all';
        },
        async validate(value, message, argument) {
            const subCommand = (0, utils_1.getSubCommand)(message, args[0].default);
            if (subCommand === 'all')
                return true;
            if (typeof value === 'undefined')
                return false;
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
class DiagnoseCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'diagnose',
            group: 'utility',
            description: 'Diagnose any command or group to determine if they are disabled or not.',
            detailedDescription: '`name` can be either a command\'s name or alias, or a group\'s name.',
            format: (0, common_tags_1.stripIndent) `
                diagnose <all> - Check the status of all commands and groups.
                diagnose command [name] - Check the status of a single command.
                diagnose group [name] - Check the status of a single group.
            `,
            examples: [
                'diagnose command ban',
                'diagnose group moderation',
            ],
            userPermissions: ['Administrator'],
            guarded: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'all',
                    description: 'Check the status of all commands and groups.',
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'command',
                    description: 'Check the status of a single command.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'command',
                            description: 'What command would you like to diagnose?',
                            required: true,
                            autocomplete: true,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'group',
                    description: 'Check the status of a single group.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'group',
                            description: 'What group would you like to diagnose?',
                            required: true,
                            autocomplete: true,
                        }],
                }],
        });
    }
    async run(context, { subCommand, commandOrGroup, command, group }) {
        const { client } = this;
        const resolvedCommand = resolveCommand(client, commandOrGroup ?? command);
        const resolvedGroup = resolveGroup(client, commandOrGroup ?? group);
        switch (subCommand) {
            case 'all':
                return await this.runAll(context);
            case 'command':
                return await this.runCommand(context, resolvedCommand);
            case 'group':
                return await this.runGroup(context, resolvedGroup);
        }
    }
    /**
     * The `all` sub-command
     */
    async runAll(context) {
        const { guild, client } = context;
        const { user, registry } = client;
        const { commands, groups } = registry;
        const commandsList = commands.filter(cmd => {
            if (guild)
                return !cmd.isEnabledIn(guild, true);
            return !cmd.isEnabledIn(null);
        }).map(c => `\`${c.name}\``).sort().join(', ') || 'There are no disabled commands';
        const groupsList = groups.filter(grp => {
            if (guild)
                return !grp.isEnabledIn(guild);
            return !grp.isEnabledIn(null);
        }).map(g => `\`${g.name}\``).sort().join(', ') || 'There are no disabled groups';
        const name = guild?.name || user.username;
        const avatar = guild?.iconURL({ forceStatic: false }) || user.displayAvatarURL({ forceStatic: false });
        const diagnose = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `${name}'s disabled commands and groups`,
            iconURL: avatar,
        })
            .addFields({
            name: 'Commands',
            value: commandsList,
        }, {
            name: 'Groups',
            value: groupsList,
        })
            .setTimestamp();
        await (0, utils_1.reply)(context, diagnose);
    }
    /**
     * The `command` sub-command
     */
    async runCommand(context, command) {
        if (!command)
            return;
        const { guild, client } = context;
        const isEnabled = guild ? command.isEnabledIn(guild, true) : command.isEnabledIn(null);
        const global = guild ? 'Status' : 'Global status';
        const avatar = guild?.iconURL({ forceStatic: false }) || client.user.displayAvatarURL({ forceStatic: false });
        const diagnose = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `${global} of command: ${command.name}`,
            iconURL: avatar,
        })
            .addFields({
            name: 'Status',
            value: isEnabled ? 'Enabled' : 'Disabled',
            inline: true,
        }, {
            name: 'Guarded',
            value: command.guarded ? 'Yes' : 'No',
            inline: true,
        })
            .setTimestamp();
        if (context.inGuild()) {
            const { channel, guild } = context;
            const { me } = guild.members;
            const permissions = me && command.clientPermissions
                ? me.permissionsIn(channel.id).missing(command.clientPermissions)
                : null;
            const missing = permissions?.map(str => `\`${pixoll_commando_1.Util.permissions[str]}\``).join(', ') || 'None';
            diagnose.addFields({
                name: 'Missing permissions',
                value: missing,
            });
        }
        await (0, utils_1.reply)(context, diagnose);
    }
    /**
     * The `group` sub-command
     */
    async runGroup(context, group) {
        if (!group)
            return;
        const { guild, client } = context;
        const isEnabled = group.isEnabledIn(guild);
        const global = guild ? 'Status' : 'Global status';
        const avatar = guild?.iconURL({ forceStatic: false })
            || client.user.displayAvatarURL({ forceStatic: false });
        const diagnose = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `${global} of group: ${group.name}`,
            iconURL: avatar,
        })
            .addFields({
            name: 'Status',
            value: isEnabled ? 'Enabled' : 'Disabled',
            inline: true,
        }, {
            name: 'Guarded',
            value: group.guarded ? 'Yes' : 'No',
            inline: true,
        })
            .setTimestamp();
        await (0, utils_1.reply)(context, diagnose);
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
exports.default = DiagnoseCommand;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvdXRpbGl0eS9kaWFnbm9zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FJb0I7QUFDcEIscURBYXlCO0FBQ3pCLHVDQUErRDtBQUUvRCxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFlBQVk7UUFDakIsS0FBSyxFQUFFLGFBQWE7UUFDcEIsTUFBTSxFQUFFLHNDQUFzQztRQUM5QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDO1FBQ2xDLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxDQUFDLEtBQWE7WUFDZixPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixDQUFDO0tBQ0osRUFBRTtRQUNDLEdBQUcsRUFBRSxnQkFBZ0I7UUFDckIsS0FBSyxFQUFFLGtCQUFrQjtRQUN6QixNQUFNLEVBQUUsbURBQW1EO1FBQzNELElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUM7UUFDMUIsUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLENBQUMsQ0FBVSxFQUFFLE9BQXdCO1lBQ3hDLE1BQU0sVUFBVSxHQUFHLElBQUEscUJBQWEsRUFBYSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sVUFBVSxLQUFLLEtBQUssQ0FBQztRQUNoQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUF5QixFQUFFLE9BQXdCLEVBQUUsUUFBa0I7WUFDbEYsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkUsSUFBSSxVQUFVLEtBQUssS0FBSztnQkFB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