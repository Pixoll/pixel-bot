import { stripIndent } from 'common-tags';
import {
    ApplicationCommandOptionChoiceData as ChoiceData,
    ApplicationCommandOptionType,
} from 'discord.js';
import { capitalize } from 'lodash';
import {
    Argument,
    ArgumentType,
    Command,
    CommandContext,
    CommandGroup,
    CommandGroupResolvable,
    CommandoAutocompleteInteraction,
    CommandoClient,
    CommandoMessage,
    CommandResolvable,
    DatabaseManager,
    DisabledSchema,
    ParseRawArguments,
} from 'pixoll-commando';
import { basicEmbed, getSubCommand, replyAll } from '../../utils/functions';

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: ['command', 'group'],
    parse(value: string): string {
        return value.toLowerCase();
    },
}, {
    key: 'commandOrGroup',
    label: 'command or group',
    prompt: 'What command or group would you like to toggle?',
    type: ['command', 'group'],
    async validate(value: string, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const subCommand = getSubCommand<SubCommand>(message);
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

type SubCommand = Lowercase<typeof args[0]['oneOf'][number]>;
type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs> & {
    command?: string;
    group?: string;
};

export default class ToggleCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'toggle',
            group: 'utility',
            description: 'Toggles a command or group on/off.',
            details: '`name` can be either a command\'s name or alias, or a group\'s name.',
            format: stripIndent`
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
                type: ApplicationCommandOptionType.Subcommand,
                name: 'command',
                description: 'Toggle a command on/off.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'command',
                    description: 'What command would you like to toggle?',
                    required: true,
                    autocomplete: true,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'group',
                description: 'Toggle a group on/off.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'group',
                    description: 'What group would you like to toggle?',
                    required: true,
                    autocomplete: true,
                }],
            }],
        });
    }

    public async run(context: CommandContext, { subCommand, commandOrGroup, command, group }: ParsedArgs): Promise<void> {
        const { client, guildId, guild } = context;
        const resolvedCommand = resolveCommand(client, command ?? commandOrGroup);
        const resolvedGroup = resolveGroup(client, group ?? commandOrGroup);

        const db = guild?.database.disabled || this.client.database.disabled;
        const data = await db.fetch(guildId ? {} : { global: true });

        switch (subCommand) {
            case 'command':
                return await this.runCommand(context, resolvedCommand, db, data);
            case 'group':
                return await this.runGroup(context, resolvedGroup, db, data);
        }
    }

    /**
     * The `command` sub-command
     */
    protected async runCommand(
        context: CommandContext,
        command: Command | null,
        db: DatabaseManager<DisabledSchema, boolean>,
        data: DisabledSchema | null
    ): Promise<void> {
        if (!command) return;

        if (command.guarded) {
            await replyAll(context, basicEmbed({
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
                : { $pull: { commands: command.name } }
            );
        } else {
            await db.add({
                guild: guildId ?? undefined,
                global: !guildId,
                commands: isEnabled ? [command.name] : [],
                groups: [],
            });
        }

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `Toggled the \`${command.name}\` command${global}`,
            fieldValue: `**New status:** ${!isEnabled ? 'Enabled' : 'Disabled'}`,
        }));
    }

    /**
     * The `group` sub-command
     */
    protected async runGroup(
        context: CommandContext,
        group: CommandGroup | null,
        db: DatabaseManager<DisabledSchema, boolean>,
        data: DisabledSchema | null
    ): Promise<void> {
        if (!group) return;

        if (group.guarded) {
            await replyAll(context, basicEmbed({
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
                : { $pull: { groups: group.name } }
            );
        } else {
            await db.add({
                guild: guildId ?? undefined,
                global: !guildId,
                commands: [],
                groups: !isEnabled ? [group.name] : [],
            });
        }

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `Toggled the \`${group.name}\` group${global}`,
            fieldValue: `**New status:** ${!isEnabled ? 'Enabled' : 'Disabled'}`,
        }));
    }

    public async runAutocomplete(interaction: CommandoAutocompleteInteraction): Promise<void> {
        const { client, options } = interaction;
        const { commands, groups } = client.registry;

        const subCommand = options.getSubcommand().toLowerCase() as SubCommand;
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
                    ? capitalize(identifier)
                    : groups.get(identifier)?.name ?? capitalize(identifier),
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

function resolveCommand(client: CommandoClient, command: CommandGroup | CommandResolvable): Command | null {
    if (!command || command instanceof CommandGroup) return null;
    return client.registry.resolveCommand(command);
}

function resolveGroup(client: CommandoClient, group: Command | CommandGroupResolvable): CommandGroup | null {
    if (!group || group instanceof Command) return null;
    return client.registry.resolveGroup(group);
}
