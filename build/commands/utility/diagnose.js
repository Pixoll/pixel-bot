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
        await (0, utils_1.replyAll)(context, diagnose);
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
                ? me.permissionsIn(channel).missing(command.clientPermissions)
                : null;
            const missing = permissions?.map(str => `\`${pixoll_commando_1.Util.permissions[str]}\``).join(', ') || 'None';
            diagnose.addFields({
                name: 'Missing permissions',
                value: missing,
            });
        }
        await (0, utils_1.replyAll)(context, diagnose);
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
        await (0, utils_1.replyAll)(context, diagnose);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvdXRpbGl0eS9kaWFnbm9zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FJb0I7QUFDcEIsbUNBQW9DO0FBQ3BDLHFEQWF5QjtBQUN6Qix1Q0FBa0U7QUFFbEUsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQztRQUNsQyxPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsZ0JBQWdCO1FBQ3JCLEtBQUssRUFBRSxrQkFBa0I7UUFDekIsTUFBTSxFQUFFLG1EQUFtRDtRQUMzRCxJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDO1FBQzFCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxDQUFDLENBQVUsRUFBRSxPQUF3QjtZQUN4QyxNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RSxPQUFPLFVBQVUsS0FBSyxLQUFLLENBQUM7UUFDaEMsQ0FBQztRQUNELEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBeUIsRUFBRSxPQUF3QixFQUFFLFFBQWtCO1lBQ2xGLE1BQU0sVUFBVSxHQUFHLElBQUEscUJBQWEsRUFBYSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZFLElBQUksVUFBVSxL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