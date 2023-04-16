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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2Qvcm9sZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FBaUg7QUFDakgscURBU3lCO0FBQ3pCLHVDQVVxQjtBQUVyQixNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdkIsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDO1FBQ3ZELEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsWUFBWTtRQUNqQixLQUFLLEVBQUUsZ0JBQWdCO1FBQ3ZCLE1BQU0sRUFBRSxzRUFBc0U7UUFDOUUsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUN0QixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVc7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDL0MsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELE1BQU0sU0FBUyxHQUFHLHNCQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUN4RixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FB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