import { stripIndent } from 'common-tags';
import {
    ApplicationCommandOptionChoiceData as ChoiceData,
    ApplicationCommandOptionType,
    EmbedBuilder,
} from 'discord.js';
import {
    Argument,
    ArgumentType,
    Command,
    CommandContext,
    CommandGroup,
    CommandGroupResolvable,
    CommandoMessage,
    CommandoAutocompleteInteraction,
    CommandoClient,
    ParseRawArguments,
    Util,
    CommandResolvable,
} from 'pixoll-commando';
import { reply, getSubCommand, pixelColor } from '../../utils';

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: ['all', 'command', 'group'],
    default: 'all',
    parse(value: string): string {
        return value.toLowerCase();
    },
}, {
    key: 'commandOrGroup',
    label: 'command or group',
    prompt: 'What command or group would you like to diagnose?',
    type: ['command', 'group'],
    required: false,
    isEmpty(_: unknown, message: CommandoMessage): boolean {
        const subCommand = getSubCommand<SubCommand>(message, args[0].default);
        return subCommand === 'all';
    },
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const subCommand = getSubCommand<SubCommand>(message, args[0].default);
        if (subCommand === 'all') return true;
        if (typeof value === 'undefined') return false;
        const isValid = await argument.type?.validate(value, message, argument) ?? true;
        if (isValid !== true) return isValid;
        if (subCommand === 'command') {
            const commandType = argument.client.registry.types.get('command') as ArgumentType<'command'>;
            const command = await commandType.parse(value, message, argument as Argument<'command'>);
            return !(command?.hidden || command?.ownerOnly);
        }
        const groupType = argument.client.registry.types.get('group') as ArgumentType<'group'>;
        const group = await groupType.parse(value, message, argument as Argument<'group'>);
        return group?.id !== 'owner';
    },
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs> & {
    command?: string;
    group?: string;
};
type SubCommand = ParsedArgs['subCommand'];

export default class DiagnoseCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'diagnose',
            group: 'utility',
            description: 'Diagnose any command or group to determine if they are disabled or not.',
            detailedDescription: '`name` can be either a command\'s name or alias, or a group\'s name.',
            format: stripIndent`
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
                type: ApplicationCommandOptionType.Subcommand,
                name: 'all',
                description: 'Check the status of all commands and groups.',
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'command',
                description: 'Check the status of a single command.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'command',
                    description: 'What command would you like to diagnose?',
                    required: true,
                    autocomplete: true,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'group',
                description: 'Check the status of a single group.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'group',
                    description: 'What group would you like to diagnose?',
                    required: true,
                    autocomplete: true,
                }],
            }],
        });
    }

    public async run(context: CommandContext, { subCommand, commandOrGroup, command, group }: ParsedArgs): Promise<void> {
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
    protected async runAll(context: CommandContext): Promise<void> {
        const { guild, client } = context;
        const { user, registry } = client;
        const { commands, groups } = registry;

        const commandsList = commands.filter(cmd => {
            if (guild) return !cmd.isEnabledIn(guild, true);
            return !cmd.isEnabledIn(null);
        }).map(c => `\`${c.name}\``).sort().join(', ') || 'There are no disabled commands';

        const groupsList = groups.filter(grp => {
            if (guild) return !grp.isEnabledIn(guild);
            return !grp.isEnabledIn(null);
        }).map(g => `\`${g.name}\``).sort().join(', ') || 'There are no disabled groups';

        const name = guild?.name || user.username;
        const avatar = guild?.iconURL({ forceStatic: false }) || user.displayAvatarURL({ forceStatic: false });

        const diagnose = new EmbedBuilder()
            .setColor(pixelColor)
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

        await reply(context, diagnose);
    }

    /**
     * The `command` sub-command
     */
    protected async runCommand(context: CommandContext, command: Command | null): Promise<void> {
        if (!command) return;

        const { guild, client } = context;
        const isEnabled = guild ? command.isEnabledIn(guild, true) : command.isEnabledIn(null);

        const global = guild ? 'Status' : 'Global status';
        const avatar = guild?.iconURL({ forceStatic: false }) || client.user.displayAvatarURL({ forceStatic: false });

        const diagnose = new EmbedBuilder()
            .setColor(pixelColor)
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
            const missing = permissions?.map(str => `\`${Util.permissions[str]}\``).join(', ') || 'None';

            diagnose.addFields({
                name: 'Missing permissions',
                value: missing,
            });
        }

        await reply(context, diagnose);
    }

    /**
     * The `group` sub-command
     */
    protected async runGroup(context: CommandContext, group: CommandGroup | null): Promise<void> {
        if (!group) return;

        const { guild, client } = context;
        const isEnabled = group.isEnabledIn(guild);

        const global = guild ? 'Status' : 'Global status';
        const avatar = guild?.iconURL({ forceStatic: false })
            || client.user.displayAvatarURL({ forceStatic: false });

        const diagnose = new EmbedBuilder()
            .setColor(pixelColor)
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

        await reply(context, diagnose);
    }

    public override async runAutocomplete(interaction: CommandoAutocompleteInteraction): Promise<void> {
        const { client, options } = interaction;
        const { commands, groups } = client.registry;

        const subCommand = options.getSubcommand().toLowerCase() as Exclude<SubCommand, 'all'>;
        const query = options.getFocused().toLowerCase();
        const isCommand = subCommand === 'command';
        const rawMatches = isCommand
            ? commands.filter(commandFilter(query)).map(command => command.name)
            : groups.filter(groupFilter(query)).map(group => group.id);

        const matches = rawMatches
            .slice(0, 25)
            .sort()
            .map<ChoiceData<string>>(identifier => ({
                name: isCommand
                    ? Util.capitalize(identifier)
                    : groups.get(identifier)?.name ?? Util.capitalize(identifier),
                value: identifier,
            }));

        await interaction.respond(matches);
    }
}

function commandFilter(query: string): (command: Command) => boolean {
    return (command: Command) => {
        if (command.hidden || command.ownerOnly) return false;
        return command.name.includes(query)
            || command.aliases.some(alias => alias.includes(query));
    };
}

function groupFilter(query: string): (group: CommandGroup) => boolean {
    return (group: CommandGroup) =>
        group.id !== 'owner' && (
            group.id.includes(query)
            || group.name.includes(query)
        );
}

function resolveCommand(client: CommandoClient, command?: CommandGroup | CommandResolvable): Command | null {
    if (!command || command instanceof CommandGroup) return null;
    return client.registry.resolveCommand(command);
}

function resolveGroup(client: CommandoClient, group?: Command | CommandGroupResolvable): CommandGroup | null {
    if (!group || group instanceof Command) return null;
    return client.registry.resolveGroup(group);
}
