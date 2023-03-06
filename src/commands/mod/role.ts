import { stripIndent } from 'common-tags';
import { ApplicationCommandOptionType, ApplicationCommandOptionData } from 'discord.js';
import {
    Argument,
    ArgumentType,
    Command,
    CommandContext,
    CommandoClient,
    CommandoMessage,
    ParseRawArguments,
    Util,
    CommandoRole,
    CommandoUser,
    CommandoGuildMember,
} from 'pixoll-commando';
import {
    basicEmbed,
    isValidRole,
    replyAll,
    confirmButtons,
    arrayWithLength,
    addOrdinalSuffix,
    getSubCommand,
    parseArgInput,
} from '../../utils';

const rolesAmount = 10;
const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: ['toggle', 'remove-all', 'all', 'bots', 'users'],
    parse(value: string): string {
        return value.toLowerCase();
    },
}, {
    key: 'userOrRole',
    label: 'member or role',
    prompt: 'What role do you want to toggle? or what member are you looking for?',
    type: ['user', 'role'],
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        if (typeof value === 'undefined') return false;
        const subCommand = getSubCommand<SubCommand>(message);
        const choseType = Util.equals(subCommand, ['toggle', 'remove-all']) ? 'member' : 'role';
        const type = message.client.registry.types.get(choseType);
        if (!type) return true;
        const isValid = await type.validate(value, message, argument);
        if (choseType === 'member' || isValid !== true) return isValid;
        const role = await type.parse(value, message, argument) as CommandoRole;
        return isValidRole(message, role);
    },
    async parse(value: string, message: CommandoMessage, argument: Argument): Promise<CommandoRole | CommandoUser | null> {
        const subCommand = getSubCommand<SubCommand>(message);
        const choseType = Util.equals(subCommand, ['toggle', 'remove-all']) ? 'user' : 'role';
        const type = message.client.registry.types.get(choseType) as ArgumentType<'role' | 'user'>;
        return await type.parse(value, message, argument as Argument<'role' | 'user'>);
    },
}, {
    key: 'roles',
    prompt: 'What roles do you want to toggle for that member?',
    type: 'string',
    isEmpty(_: unknown, message: CommandoMessage): boolean {
        const subCommand = getSubCommand<SubCommand>(message);
        return subCommand !== 'toggle';
    },
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const subCommand = getSubCommand<SubCommand>(message);
        if (subCommand !== 'toggle') return true;
        const type = message.client.registry.types.get('role') as ArgumentType<'role'>;
        const queries = value?.split(/\s*,\s*/).slice(0, rolesAmount) ?? [];
        const valid: boolean[] = [];
        for (const query of queries) {
            const isValid1 = await type.validate(query, message, argument as Argument<'role'>);
            if (!isValid1) valid.push(false);
            const role = await type.parse(query, message, argument as Argument<'role'>);
            const isValid2 = isValidRole(message, role);
            valid.push(isValid2);
        }
        return valid.filter(b => b === true).length === 0;
    },
    required: false,
    error: 'None of the roles you specified were valid. Please try again.',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs> & {
    [K in SlashRoleKey]?: CommandoRole;
} & {
    user?: CommandoUser;
    role?: CommandoRole;
};
type SubCommand = ParsedArgs['subCommand'];

type SlashRoleKey = NumberedStringUnion<'role-', typeof rolesAmount>;

const defaultOptions = {
    user: {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'The targeted member.',
        required: true,
    },
    role: {
        type: ApplicationCommandOptionType.Role,
        name: 'role',
        description: 'The role to toggle.',
        required: true,
    },
} as const;

export default class RoleCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'role',
            group: 'mod',
            description: 'Add or remove roles from a member.',
            details: stripIndent`
                \`member\` can be either a member's name, mention or ID.
                \`role\` can be either a role's name, mention or ID.
                \`roles\` to be all the roles' names, mentions or ids, separated by commas (max. 10 at once).
            `,
            format: stripIndent`
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
                type: ApplicationCommandOptionType.Subcommand,
                name: 'toggle',
                description: 'Toggles the roles of a member.',
                options: [defaultOptions.user, ...arrayWithLength<Extract<ApplicationCommandOptionData, {
                    type: ApplicationCommandOptionType.Role;
                }>>(rolesAmount, (n) => ({
                    type: ApplicationCommandOptionType.Role,
                    name: `role-${n + 1}`,
                    description: `The ${addOrdinalSuffix(n + 1)} role.`,
                    required: n === 0,
                }))],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'remove-all',
                description: 'Removes the member\'s roles.',
                options: [defaultOptions.user],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'all',
                description: 'Toggles a role on every user and bot.',
                options: [defaultOptions.role],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'bots',
                description: 'Toggles a role on every bot.',
                options: [defaultOptions.role],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
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
    public async run(context: CommandContext<true>, args: ParsedArgs): Promise<void> {
        const { subCommand, userOrRole, user, role } = args;

        switch (subCommand) {
            case 'toggle':
                return await this.toggle(context, args);
            case 'remove-all':
                return await this.removeAll(context, user ?? userOrRole as CommandoUser);
            case 'all':
                return await this.runAll(context, role ?? userOrRole as CommandoRole);
            case 'bots':
                return await this.bots(context, role ?? userOrRole as CommandoRole);
            case 'users':
                return await this.users(context, role ?? userOrRole as CommandoRole);
        }
    }

    /**
     * The `all` sub-command
     */
    protected async runAll(context: CommandContext<true>, role: CommandoRole): Promise<void> {
        await toggleRolesFor('all', context, role);
    }

    /**
     * The `bots` sub-command
     */
    protected async bots(context: CommandContext<true>, role: CommandoRole): Promise<void> {
        await toggleRolesFor('bots', context, role);
    }

    /**
     * The `members` sub-command
     */
    protected async users(context: CommandContext<true>, role: CommandoRole): Promise<void> {
        await toggleRolesFor('members', context, role);
    }

    /**
     * The `remove-all` sub-command
     */
    protected async removeAll(context: CommandContext<true>, user: CommandoUser): Promise<void> {
        const member = await context.guild.members.fetch(user).catch(() => null);
        if (!member) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }

        const { roles } = member;
        if (roles.cache.size === 0) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That member has no roles.',
            }));
            return;
        }

        const confirmed = await confirmButtons(context, {
            action: `remove all roles from ${user.toString()}`,
        });
        if (!confirmed) return;

        const replyToEdit = await replyAll(context, basicEmbed({
            color: 'Gold',
            emoji: 'loading',
            description: 'Removing all roles... Please be patient.',
        }));

        const memberRoles = roles.cache.filter(role => isValidRole(replyToEdit, role)).toJSON();
        await Promise.all(memberRoles.map(role => roles.remove(role)));

        await replyAll(context, {
            embeds: [basicEmbed({
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
    protected async toggle(context: CommandContext<true>, args: ParsedArgs): Promise<void> {
        const member = await context.guild.members.fetch(args.user ?? '').catch(() => null);
        if (!member) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }
        const message = context.isMessage() ? context : await context.fetchReply() as CommandoMessage;
        const roles = await parseRoles(context, args, message, this);
        const memberRoles = member.roles;

        const alreadyHas = roles.filter(r => memberRoles.cache.has(r.id));
        const doesNotHave = roles.filter(r => !memberRoles.cache.has(r.id));

        const replyToEdit = await replyAll(context, basicEmbed({
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

        await replyAll(context, {
            embeds: [basicEmbed({
                color: 'Green',
                emoji: 'check',
                fieldValue: rolesStr,
                fieldName: `Toggled the following roles for ${member.user.tag}:`,
            })],
            replyToEdit,
        });
    }
}

async function toggleRolesFor(
    type: 'all' | 'bots' | 'members', context: CommandContext<true>, role: CommandoRole
): Promise<void> {
    if (!isValidRole(context, role)) {
        await replyAll(context, basicEmbed({
            color: 'Red',
            emoji: 'cross',
            description: 'That is not a valid manageable role.',
        }));
        return;
    }

    const target = type === 'all' ? 'members and bots' : type;
    const filter = (member: CommandoGuildMember): boolean => type === 'all'
        ? true
        : member.user.bot && type === 'bots';
    const confirmed = await confirmButtons(context, {
        action: `toggle the ${role.name} role in all ${target}`,
    });
    if (!confirmed) return;

    const members = await context.guild.members.fetch().catch(() => null);
    if (!members) {
        await replyAll(context, basicEmbed({
            color: 'Red',
            emoji: 'cross',
            description: 'There was an error while trying to get the server members, please try again later.',
        }));
        return;
    }

    const replyToEdit = await replyAll(context, basicEmbed({
        color: 'Gold',
        emoji: 'loading',
        description: `Toggling role in all ${target}... Please be patient.`,
    }));

    await Promise.all(members.filter(filter).map(async ({ roles }) => {
        if (roles.cache.has(role.id)) await roles.remove(role);
        else await roles.add(role);
    }));

    await replyAll(context, {
        embeds: [basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: `Toggled the \`${role.name}\` role for all ${target}.`,
        })],
        replyToEdit,
    });
}

async function parseRoles(
    context: CommandContext, args: ParsedArgs, message: CommandoMessage, command: RoleCommand
): Promise<CommandoRole[]> {
    if (context.isInteraction()) return Object.entries(args)
        .filter((entry): entry is [SlashRoleKey, CommandoRole] => entry[0].startsWith('role-'))
        .map(([, role]) => role);
    const results = await Promise.all((args.roles ?? '').split(/ +/).map(query =>
        parseArgInput(query, message, command.argsCollector?.args[1] as Argument, 'role')
    ));
    return Util.filterNullishItems(results);
}
