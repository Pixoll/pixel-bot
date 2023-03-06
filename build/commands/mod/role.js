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
            details: (0, common_tags_1.stripIndent) `
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
                            name: `role-${n + 1}`,
                            description: `The ${(0, utils_1.addOrdinalSuffix)(n + 1)} role.`,
                            required: n === 0,
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
    /**
     * Runs the command
     * @param {CommandContext} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'toggle'|'remove-all'|'all'|'bots'|'users'} args.subCommand The sub-command
     * @param {Role|GuildMember} args.memberOrRole The role or member
     * @param {Role[]} args.roles The array of roles to toggle from the member
     */
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
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }
        const { roles } = member;
        if (roles.cache.size === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
        const replyToEdit = await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Gold',
            emoji: 'loading',
            description: 'Removing all roles... Please be patient.',
        }));
        const memberRoles = roles.cache.filter(role => (0, utils_1.isValidRole)(replyToEdit, role)).toJSON();
        await Promise.all(memberRoles.map(role => roles.remove(role)));
        await (0, utils_1.replyAll)(context, {
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
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }
        const message = context.isMessage() ? context : await context.fetchReply();
        const roles = await parseRoles(context, args, message, this);
        const memberRoles = member.roles;
        const alreadyHas = roles.filter(r => memberRoles.cache.has(r.id));
        const doesNotHave = roles.filter(r => !memberRoles.cache.has(r.id));
        const replyToEdit = await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Gold',
            emoji: 'loading',
            description: 'Toggling the roles... Please be patient.',
        }));
        await Promise.all([
            ...alreadyHas.map(role => memberRoles.remove(role)),
            ...doesNotHave.map(role => memberRoles.add(role)),
        ]);
        const rolesStr = [...alreadyHas.map(r => '-' + r.name), ...doesNotHave.map(r => '+' + r.name)]
            .filter(s => s)
            .join(', ');
        await (0, utils_1.replyAll)(context, {
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
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Red',
            emoji: 'cross',
            description: 'There was an error while trying to get the server members, please try again later.',
        }));
        return;
    }
    const replyToEdit = await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
        color: 'Gold',
        emoji: 'loading',
        description: `Toggling role in all ${target}... Please be patient.`,
    }));
    await Promise.all(members.filter(filter).map(async ({ roles }) => {
        if (roles.cache.has(role.id))
            await roles.remove(role);
        else
            await roles.add(role);
    }));
    await (0, utils_1.replyAll)(context, {
        embeds: [(0, utils_1.basicEmbed)({
                color: 'Green',
                emoji: 'check',
                description: `Toggled the \`${role.name}\` role for all ${target}.`,
            })],
        replyToEdit,
    });
}
async function parseRoles(context, args, message, command) {
    if (context.isInteraction())
        return Object.entries(args)
            .filter((entry) => entry[0].startsWith('role-'))
            .map(([, role]) => role);
    const results = await Promise.all((args.roles ?? '').split(/ +/).map(query => (0, utils_1.parseArgInput)(query, message, command.argsCollector?.args[1], 'role')));
    return pixoll_commando_1.Util.filterNullishItems(results);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2Qvcm9sZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FBd0Y7QUFDeEYscURBWXlCO0FBQ3pCLHVDQVNxQjtBQUVyQixNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdkIsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDO1FBQ3ZELEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsWUFBWTtRQUNqQixLQUFLLEVBQUUsZ0JBQWdCO1FBQ3ZCLE1BQU0sRUFBRSxzRUFBc0U7UUFDOUUsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUN0QixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVc7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDL0MsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELE1BQU0sU0FBUyxHQUFHLHNCQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUN4RixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FB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