"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const rolesAmount = 10;
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'What sub-command do you want to use?',
        type: 'string',
        oneOf: ['toggle', 'remove-all', 'all', 'bots', 'users'],
        parse(value) {
            return value.toLowerCase();
        },
    }, {
        key: 'userOrRole',
        label: 'member or role',
        prompt: 'What role do you want to toggle? or what member are you looking for?',
        type: ['user', 'role'],
        async validate(value, message, argument) {
            if (typeof value === 'undefined')
                return false;
            const subCommand = (0, utils_1.getSubCommand)(message);
            const choseType = pixoll_commando_1.Util.equals(subCommand, ['toggle', 'remove-all']) ? 'member' : 'role';
            const type = message.client.registry.types.get(choseType);
            if (!type)
                return true;
            const isValid = await type.validate(value, message, argument);
            if (choseType === 'member' || isValid !== true)
                return isValid;
            const role = await type.parse(value, message, argument);
            return (0, utils_1.isValidRole)(message, role);
        },
        async parse(value, message, argument) {
            const subCommand = (0, utils_1.getSubCommand)(message);
            const choseType = pixoll_commando_1.Util.equals(subCommand, ['toggle', 'remove-all']) ? 'user' : 'role';
            const type = message.client.registry.types.get(choseType);
            return await type.parse(value, message, argument);
        },
    }, {
        key: 'roles',
        prompt: 'What roles do you want to toggle for that member?',
        type: 'string',
        isEmpty(_, message) {
            const subCommand = (0, utils_1.getSubCommand)(message);
            return subCommand !== 'toggle';
        },
        async validate(value, message, argument) {
            const subCommand = (0, utils_1.getSubCommand)(message);
            if (subCommand !== 'toggle')
                return true;
            const type = message.client.registry.types.get('role');
            const queries = value?.split(/\s*,\s*/).slice(0, rolesAmount) ?? [];
            const valid = [];
            for (const query of queries) {
                const isValid1 = await type.validate(query, message, argument);
                if (!isValid1)
                    valid.push(false);
                const role = await type.parse(query, message, argument);
                const isValid2 = (0, utils_1.isValidRole)(message, role);
                valid.push(isValid2);
            }
            return valid.filter(b => b === true).length === 0;
        },
        required: false,
        error: 'None of the roles you specified were valid. Please try again.',
    }];
const defaultOptions = {
    user: {
        type: discord_js_1.ApplicationCommandOptionType.User,
        name: 'user',
        description: 'The targeted member.',
        required: true,
    },
    role: {
        type: discord_js_1.ApplicationCommandOptionType.Role,
        name: 'role',
        description: 'The role to toggle.',
        required: true,
    },
};
class RoleCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'role',
            group: 'mod',
            description: 'Add or remove roles from a member.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`member\` can be either a member's name, mention or ID.
                \`role\` can be either a role's name, mention or ID.
                \`roles\` to be all the roles' names, mentions or ids, separated by commas (max. 10 at once).
            `,
            format: (0, common_tags_1.stripIndent) `
                role toggle [member] [roles] - Toggles the roles of a member (max. 10 at once).
                role remove-all [member] - Removes the member's roles.
                role all [role] - Toggles a role on every user and bot.
                role bots [role] - Toggles a role on every bot.
                role users [role] - Toggles a role on every user.
            `,
            examples: [
                'role toggle Pixoll Developer, Moderator',
                'role remove-all Pixoll',
                'role all Member',
                'role bots Bots',
                'role users Ping Role',
            ],
            clientPermissions: ['ManageRoles'],
            userPermissions: ['ManageRoles'],
            guildOnly: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'toggle',
                    description: 'Toggles the roles of a member.',
                    options: [defaultOptions.user, ...(0, utils_1.arrayWithLength)(rolesAmount, (n) => ({
                            type: discord_js_1.ApplicationCommandOptionType.Role,
                            name: `role-${n}`,
                            description: `The ${(0, utils_1.addOrdinalSuffix)(n)} role.`,
                            required: n === 1,
                        }))],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'remove-all',
                    description: 'Removes the member\'s roles.',
                    options: [defaultOptions.user],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'all',
                    description: 'Toggles a role on every user and bot.',
                    options: [defaultOptions.role],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'bots',
                    description: 'Toggles a role on every bot.',
                    options: [defaultOptions.role],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'users',
                    description: 'Toggles a role on every user.',
                    options: [defaultOptions.role],
                }],
        });
    }
    async run(context, args) {
        const { subCommand, userOrRole, user, role } = args;
        switch (subCommand) {
            case 'toggle':
                return await this.toggle(context, args);
            case 'remove-all':
                return await this.removeAll(context, user ?? userOrRole);
            case 'all':
                return await this.runAll(context, role ?? userOrRole);
            case 'bots':
                return await this.bots(context, role ?? userOrRole);
            case 'users':
                return await this.users(context, role ?? userOrRole);
        }
    }
    /**
     * The `all` sub-command
     */
    async runAll(context, role) {
        await toggleRolesFor('all', context, role);
    }
    /**
     * The `bots` sub-command
     */
    async bots(context, role) {
        await toggleRolesFor('bots', context, role);
    }
    /**
     * The `members` sub-command
     */
    async users(context, role) {
        await toggleRolesFor('members', context, role);
    }
    /**
     * The `remove-all` sub-command
     */
    async removeAll(context, user) {
        const member = await context.guild.members.fetch(user).catch(() => null);
        if (!member) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }
        const { roles } = member;
        if (roles.cache.size === 0) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That member has no roles.',
            }));
            return;
        }
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: `remove all roles from ${user.toString()}`,
        });
        if (!confirmed)
            return;
        const replyToEdit = await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Gold',
            emoji: 'loading',
            description: 'Removing all roles... Please be patient.',
        }));
        const memberRoles = roles.cache.filter(role => (0, utils_1.isValidRole)(replyToEdit, role)).toJSON();
        await Promise.all(memberRoles.map(role => roles.remove(role)));
        await (0, utils_1.reply)(context, {
            embeds: [(0, utils_1.basicEmbed)({
                    color: 'Green',
                    emoji: 'check',
                    description: `Removed every role from ${user.toString()} (${user.tag}).`,
                })],
            replyToEdit,
        });
    }
    /**
     * The `toggle` sub-command
     */
    async toggle(context, args) {
        const member = await context.guild.members.fetch(args.user ?? '').catch(() => null);
        if (!member) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }
        const message = await (0, utils_1.getContextMessage)(context);
        const roles = await parseRoles(context, args, message, this);
        const memberRoles = member.roles;
        const alreadyHas = roles.filter(r => memberRoles.cache.has(r.id));
        const doesNotHave = roles.filter(r => !memberRoles.cache.has(r.id));
        const replyToEdit = await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Gold',
            emoji: 'loading',
            description: 'Toggling the roles... Please be patient.',
        }));
        await Promise.all([
            ...alreadyHas.map(role => memberRoles.remove(role.id)),
            ...doesNotHave.map(role => memberRoles.add(role.id)),
        ]);
        const rolesStr = [...alreadyHas.map(r => '-' + r.name), ...doesNotHave.map(r => '+' + r.name)]
            .filter(s => s)
            .join(', ');
        await (0, utils_1.reply)(context, {
            embeds: [(0, utils_1.basicEmbed)({
                    color: 'Green',
                    emoji: 'check',
                    fieldValue: rolesStr,
                    fieldName: `Toggled the following roles for ${member.user.tag}:`,
                })],
            replyToEdit,
        });
    }
}
exports.default = RoleCommand;
async function toggleRolesFor(type, context, role) {
    if (!(0, utils_1.isValidRole)(context, role)) {
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Red',
            emoji: 'cross',
            description: 'That is not a valid manageable role.',
        }));
        return;
    }
    const target = type === 'all' ? 'members and bots' : type;
    const filter = (member) => type === 'all'
        ? true
        : member.user.bot && type === 'bots';
    const confirmed = await (0, utils_1.confirmButtons)(context, {
        action: `toggle the ${role.name} role in all ${target}`,
    });
    if (!confirmed)
        return;
    const members = await context.guild.members.fetch().catch(() => null);
    if (!members) {
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Red',
            emoji: 'cross',
            description: 'There was an error while trying to get the server members, please try again later.',
        }));
        return;
    }
    const replyToEdit = await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
        color: 'Gold',
        emoji: 'loading',
        description: `Toggling role in all ${target}... Please be patient.`,
    }));
    await Promise.all(members.filter(filter).map(async ({ roles }) => {
        if (roles.cache.has(role.id))
            await roles.remove(role.id);
        else
            await roles.add(role.id);
    }));
    await (0, utils_1.reply)(context, {
        embeds: [(0, utils_1.basicEmbed)({
                color: 'Green',
                emoji: 'check',
                description: `Toggled the \`${role.name}\` role for all ${target}.`,
            })],
        replyToEdit,
    });
}
async function parseRoles(context, args, message, command) {
    const results = context.isInteraction()
        ? Object.entries(args)
            .filter((entry) => /^role\d+$/.test(entry[0]))
            .map(([, role]) => role)
        : await Promise.all((args.roles ?? '').split(/ +/).map(query => (0, utils_1.parseArgInput)(query, message, command.argsCollector?.args[1], 'role')));
    return pixoll_commando_1.Util.filterNullishItems(results);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2Qvcm9sZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FRb0I7QUFDcEIscURBVXlCO0FBQ3pCLHVDQVVxQjtBQUVyQixNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdkIsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDO1FBQ3ZELEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsWUFBWTtRQUNqQixLQUFLLEVBQUUsZ0JBQWdCO1FBQ3ZCLE1BQU0sRUFBRSxzRUFBc0U7UUFDOUUsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUN0QixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVc7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDL0MsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELE1BQU0sU0FBUyxHQUFHLHNCQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUN4RixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FB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