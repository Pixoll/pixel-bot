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
            const subCommand = (0, functions_1.getSubCommand)(message, args[0].default);
            return subCommand === 'all';
        },
        async validate(value, message, argument) {
            const subCommand = (0, functions_1.getSubCommand)(message, args[0].default);
            if (subCommand === 'all')
                return true;
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
        await (0, functions_1.replyAll)(context, diagnose);
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
        await (0, functions_1.replyAll)(context, diagnose);
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
        await (0, functions_1.replyAll)(context, diagnose);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvdXRpbGl0eS9kaWFnbm9zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FJb0I7QUFDcEIsbUNBQW9DO0FBQ3BDLHFEQWF5QjtBQUN6QixxREFBZ0U7QUFFaEUsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQztRQUNsQyxPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsZ0JBQWdCO1FBQ3JCLEtBQUssRUFBRSxrQkFBa0I7UUFDekIsTUFBTSxFQUFFLG1EQUFtRDtRQUMzRCxJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDO1FBQzFCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxDQUFDLENBQVMsRUFBRSxPQUF3QjtZQUN2QyxNQUFNLFVBQVUsR0FBRyxJQUFBLHlCQUFhLEVBQWEsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RSxPQUFPLFVBQVUsS0FBSyxLQUFLLENBQUM7UUFDaEMsQ0FBQztRQUNELEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBYSxFQUFFLE9BQXdCLEVBQUUsUUFBa0I7WUFDdEUsTUFBTSxVQUFVLEdBQUcsSUFBQSx5QkFBYSxFQUFhLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkUsSUFBSSxVQUFVLEtBQUssS0FBSztnQkFBRSxPQUFPLElBQUksQ0FBQztZQUN0QyxNQUFNLE9BQU8sR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDO1lBQ2hGLElBQUksT0FBTyxLQUFLLElBQUk7Z0JBQUUsT0FBTyxPQUFPLENBQUM7WUFDckMsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO2dCQUMxQixNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBNEIsQ0FBQztnQkFDN0YsTUFBTSxPQUFPLEdBQUcsTUFBTSxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBK0IsQ0FBQyxDQUFDO2dCQUN6RixPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxJQUFJLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQzthQUNuRDtZQUNELE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUEwQixDQUFDO1lBQ3ZGLE1BQU0sS0FBSyxHQUFHLE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQTZCLENBQUMsQ0FBQztZQUNuRixPQUFPLEtBQUssRUFBRSxFQUFFLEtBQUssT0FBTyxDQUFDO1FBQ2pDLENBQUM7S0FDSixDQUFVLENBQUM7QUFTWixNQUFxQixlQUFnQixTQUFRLHlCQUF5QjtJQUNsRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLFNBQVM7WUFDaEIsV0FBVyxFQUFFLHlFQUF5RTtZQUN0RixPQUFPLEVBQUUsc0VBQXNFO1lBQy9FLE1BQU0sRUFBRSxJQUFBLHlCQUFXLEVBQUE7Ozs7YUFJbEI7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sc0JBQXNCO2dCQUN0QiwyQkFBMkI7YUFDOUI7WUFDRCxlQUFlLEVBQUUsQ0FBQyxlQUFlLENBQUM7WUFDbEMsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJO1NBQ1AsRUFBRTtZQUNDLE9BQU8sRUFBRSxDQUFDO29CQUNOLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVO29CQUM3QyxJQUFJLEVBQUUsS0FBSztvQkFDWCxXQUFXLEVBQUUsOENBQThDO2lCQUM5RCxFQUFFO29CQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVO29CQUM3QyxJQUFJLEVBQUUsU0FBUztvQkFDZixXQUFXLEVBQUUsdUNBQXVDO29CQUNwRCxPQUFPLEVBQUUsQ0FBQzs0QkFDTixJQUFJLEVBQUUseUNBQTRCLENBQUMsTUFBTTs0QkFDekMsSUFBSSxFQUFFLFNBQVM7NEJBQ2YsV0FBVyxFQUFFLDBDQUEwQzs0QkFDdkQsUUFBUSxFQUFFLElBQUk7NEJBQ2QsWUFBWSxFQUFFLElBQUk7eUJBQ3JCLENBQUM7aUJBQ0wsRUFBRTtvQkFDQyxJQUFJLEVBQUUseUNBQTRCLENBQUMsVUFBVTtvQkFDN0MsSUFBSSxFQUFFLE9BQU87b0JBQ2IsV0FBVyxFQUFFLHFDQUFxQztvQkFDbEQsT0FBTyxFQUFFLENBQUM7NEJBQ04sSUFBSSxFQUFFLHlDQUE0QixDQUFDLE1BQU07NEJBQ3pDLElBQUksRUFBRSxPQUFPOzRCQUNiLFdBQVcsRUFBRSx3Q0FBd0M7NEJBQ3JELFFBQVEsRUFBRSxJQUFJOzRCQUNkLFlBQVksRUFBRSxJQUFJO3lCQUNyQixDQUFDO2lCQUNMLENBQUM7U0FDTCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFjO1FBQ2hHLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDeEIsTUFBTSxlQUFlLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxjQUFjLElBQUksT0FBTyxDQUFDLENBQUM7UUFDMUUsTUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxjQUFjLElBQUksS0FBSyxDQUFDLENBQUM7UUFFcEUsUUFBUSxVQUFVLEVBQUU7WUFDaEIsS0FBSyxLQUFLO2dCQUNOLE9BQU8sTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RDLEtBQUssU0FBUztnQkFDVixPQUFPLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDM0QsS0FBSyxPQUFPO2dCQUNSLE9BQU8sTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztTQUMxRDtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNPLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBdUI7UUFDMUMsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDbEMsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDbEMsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUM7UUFFdEMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN2QyxJQUFJLEtBQUs7Z0JBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFnQyxDQUFDO1FBRW5GLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDbkMsSUFBSSxLQUFLO2dCQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUE4QixDQUFDO1FBRWpGLE1BQU0sSUFBSSxHQUFHLEtBQUssRUFBRSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUMxQyxNQUFNLE1BQU0sR0FBRyxLQUFLLEVBQUUsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFdkcsTUFBTSxRQUFRLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzlCLFFBQVEsQ0FBQyxTQUFTLENBQUM7YUFDbkIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLEdBQUcsSUFBSSxpQ0FBaUMsRUFBRSxPQUFPLEVBQUUsTUFBTTtTQUNsRSxDQUFDO2FBQ0QsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLFlBQVk7U0FDdEIsRUFBRTtZQUNDLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLFVBQVU7U0FDcEIsQ0FBQzthQUNELFlBQVksRUFBRSxDQUFDO1FBRXBCLE1BQU0sSUFBQSxvQkFBUSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQ7O09BRUc7SUFDTyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQXVCLEVBQUUsT0FBdUI7UUFDdkUsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBRXJCLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ2xDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdkYsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQztRQUNsRCxNQUFNLE1BQU0sR0FBRyxLQUFLLEVBQUUsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRTlHLE1BQU0sUUFBUSxHQUFHLElBQUkseUJBQVksRUFBRTthQUM5QixRQUFRLENBQUMsU0FBUyxDQUFDO2FBQ25CLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxHQUFHLE1BQU0sZ0JBQWdCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTTtTQUNqRSxDQUFDO2FBQ0QsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVU7WUFDekMsTUFBTSxFQUFFLElBQUk7U0FDZixFQUFFO1lBQ0MsSUFBSSxFQUFFLFNBQVM7WUFDZixLQUFLLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQ3JDLE1BQU0sRUFBRSxJQUFJO1NBQ2YsQ0FBQzthQUNELFlBQVksRUFBRSxDQUFDO1FBRXBCLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ25CLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1lBQ25DLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1lBRTdCLE1BQU0sV0FBVyxHQUFHLEVBQUUsSUFBSSxPQUFPLENBQUMsaUJBQWlCO2dCQUMvQyxDQUFDLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDO2dCQUM5RCxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ1gsTUFBTSxPQUFPLEdBQUcsV0FBVyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssc0JBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUM7WUFFN0YsUUFBUSxDQUFDLFNBQVMsQ0FBQztnQkFDZixJQUFJLEVBQUUscUJBQXFCO2dCQUMzQixLQUFLLEVBQUUsT0FBTzthQUNqQixDQUFDLENBQUM7U0FDTjtRQUVELE1BQU0sSUFBQSxvQkFBUSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQ7O09BRUc7SUFDTyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQXVCLEVBQUUsS0FBMEI7UUFDeEUsSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPO1FBRW5CLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ2xDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFM0MsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQztRQUNsRCxNQUFNLE1BQU0sR0FBRyxLQUFLLEVBQUUsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO2VBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUU1RCxNQUFNLFFBQVEsR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDOUIsUUFBUSxDQUFDLFNBQVMsQ0FBQzthQUNuQixTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsR0FBRyxNQUFNLGNBQWMsS0FBSyxDQUFDLElBQUksRUFBRTtZQUN6QyxPQUFPLEVBQUUsTUFBTTtTQUNsQixDQUFDO2FBQ0QsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVU7WUFDekMsTUFBTSxFQUFFLElBQUk7U0FDZixFQUFFO1lBQ0MsSUFBSSxFQUFFLFNBQVM7WUFDZixLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQ25DLE1BQU0sRUFBRSxJQUFJO1NBQ2YsQ0FBQzthQUNELFlBQVksRUFBRSxDQUFDO1FBRXBCLE1BQU0sSUFBQSxvQkFBUSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRU0sS0FBSyxDQUFDLGVBQWUsQ0FBQyxXQUE0QztRQUNyRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLFdBQVcsQ0FBQztRQUN4QyxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFFN0MsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDLFdBQVcsRUFBZ0MsQ0FBQztRQUN2RixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDakQsTUFBTSxTQUFTLEdBQUcsVUFBVSxLQUFLLFNBQVMsQ0FBQztRQUMzQyxNQUFNLFVBQVUsR0FBRyxTQUFTO1lBQ3hCLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDcEUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRS9ELE1BQU0sT0FBTyxHQUFHLFVBQVU7YUFDckIsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7YUFDWixJQUFJLEVBQUU7YUFDTixHQUFHLENBQXFCLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNwQyxJQUFJLEVBQUUsU0FBUztnQkFDWCxDQUFDLENBQUMsSUFBQSxtQkFBVSxFQUFDLFVBQVUsQ0FBQztnQkFDeEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxJQUFJLElBQUEsbUJBQVUsRUFBQyxVQUFVLENBQUM7WUFDNUQsS0FBSyxFQUFFLFVBQVU7U0FDcEIsQ0FBQyxDQUFDLENBQUM7UUFFUixNQUFNLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkMsQ0FBQztDQUNKO0FBN01ELGtDQTZNQztBQUVELFNBQVMsYUFBYSxDQUFDLEtBQWE7SUFDaEMsT0FBTyxDQUFDLE9BQWdCLEVBQUUsRUFBRTtRQUN4QixJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLFNBQVM7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUN0RCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztlQUM1QixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNoRSxDQUFDLENBQUM7QUFDTixDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsS0FBYTtJQUM5QixPQUFPLENBQUMsS0FBbUIsRUFBRSxFQUFFLENBQzNCLEtBQUssQ0FBQyxFQUFFLEtBQUssT0FBTyxJQUFJLENBQ3BCLEtBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztXQUNyQixLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FDaEMsQ0FBQztBQUNWLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxNQUFzQixFQUFFLE9BQTBDO0lBQ3RGLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxZQUFZLDhCQUFZO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFDN0QsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuRCxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsTUFBc0IsRUFBRSxLQUF3QztJQUNsRixJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssWUFBWSx5QkFBTztRQUFFLE9BQU8sSUFBSSxDQUFDO0lBQ3BELE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDL0MsQ0FBQyJ9