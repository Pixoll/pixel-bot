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
            details: '`name` can be either a command\'s name or alias, or a group\'s name.',
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
            .setColor('#4c9f4c')
            .setAuthor({
            name: `${name}'s disabled commands and groups`, iconURL: avatar,
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
            .setColor('#4c9f4c')
            .setAuthor({
            name: `${global} of command: ${command.name}`, iconURL: avatar,
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
            .setColor('#4c9f4c')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvdXRpbGl0eS9kaWFnbm9zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FJb0I7QUFDcEIsbUNBQW9DO0FBQ3BDLHFEQWF5QjtBQUN6Qix1Q0FBc0Q7QUFFdEQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQztRQUNsQyxPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsZ0JBQWdCO1FBQ3JCLEtBQUssRUFBRSxrQkFBa0I7UUFDekIsTUFBTSxFQUFFLG1EQUFtRDtRQUMzRCxJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDO1FBQzFCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxDQUFDLENBQVUsRUFBRSxPQUF3QjtZQUN4QyxNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RSxPQUFPLFVBQVUsS0FBSyxLQUFLLENBQUM7UUFDaEMsQ0FBQztRQUNELEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBeUIsRUFBRSxPQUF3QixFQUFFLFFBQWtCO1lBQ2xGLE1BQU0sVUFBVSxHQUFHLElBQUEscUJBQWEsRUFBYSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZFLElBQUksVUFBVSxL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