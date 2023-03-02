import { prettyMs } from 'better-ms';
import { stripIndent, oneLine } from 'common-tags';
import {
    APIEmbed,
    APIEmbedField,
    ApplicationCommandOptionChoiceData as ChoiceData,
    ApplicationCommandOptionType,
    Collection,
    EmbedBuilder,
    hyperlink,
} from 'discord.js';
import { capitalize } from 'lodash';
import {
    Argument,
    Command,
    CommandContext,
    CommandoClient,
    CommandGroup,
    ParseRawArguments,
    Util,
    CommandoMessage,
    CommandoGuild,
    CommandoAutocompleteInteraction,
} from 'pixoll-commando';
import { moderatorPermissions } from '../../utils';
import { pagedEmbed, replyAll, pluralize, TemplateEmbedResult } from '../../utils/functions';

declare function require<T>(id: string): T;
const { version } = require<{ version: string }>('../../../package.json');

const topgg = 'https://top.gg/bot/802267523058761759';
const hasDeprecatedMessage = 'with a strikethrough (~~`like this`~~), mean they\'ve been marked as deprecated';
const hasDisabledMessage = oneLine`
    with a dash before their name (\`—like this\`), mean they've been disabled,
    either on the server you're in or everywhere
`;

const staticEmbedPages: APIEmbed[] = [{
    description: oneLine`
        This bot provides a handful amount of moderation, management, information and some other
        misc commands, going from muting, banning, server information, setting reminders, etc.
    `,
    fields: [{
        name: 'Current features',
        value: stripIndent`
        🔹 **Slash commands:** type \`/\` to get access to the commands list.
        🔹 **Moderation:** warning, kicking, temp-banning, banning, muting, logging, etc.
        🔹 **Welcome messages:** in a server channel.
        🔹 **Audit logs:** ${oneLine`
        new joins, permissions update, channels/roles update, etc. Specific channel logging soon!
        `}
        🔹 **Polls system:** ${oneLine`
        custom messages and reactions, automatically ends and determines the results.
        `}
        🔹 **Reminders system:** with both relative time and a specific date.
        🔹 **Reaction/Button roles:** up to 10 roles per message.
        `,
        // }, {
        //     name: 'Upcoming features',
        //     value: stripIndent`
        //     🔹 **Tickets system:** ETA 2-3 months.
        //     🔹 **Giveaways system:** ETA 2-3 months.
        //     🔹 **Chat filtering:** ETA 4-5 months.
        //     `,
    }, {
        name: '\u200B',
        value: oneLine`
        *Note: Pixel is still in "early" development, some features, commands and data are subject
        to future change or removal.*
        `,
    }],
}, {
    title: 'Command usage',
    fields: [{
        name: 'Arguments tips',
        value: stripIndent`
        ${oneLine`
        If an argument contains spaces, you can use "double" or 'single'
        quotes, and everything inside of that will count as a __single argument__.
        `}

        **Argument types:**
        **1. Square parenthesis** \`[]\`: Required.
        **2. Arrow parenthesis** \`<>\`: Optional.

        *Note: Don't include these brackets (\`[]\` or \`<>\`) in the argument.*
        `,
    }, {
        name: 'Moderator permissions',
        value: stripIndent`
        ${oneLine`
        Some commands require you to be a "moderator", which means that you **must have
        at least one** of the following permissions: ${moderatorPermissions.map(perm => `${Util.permissions[perm]}`)}
        `}
        `,
    }],
}, {
    title: 'Time formatting',
    fields: [{
        name: 'Relative time',
        value: stripIndent`
        ${oneLine`
        Just specify the relative time with a number followed by a letter, like this:
        \`1d\`, \`1.5d\` or \`1d12h\`.
        `}

        ${oneLine`
        *Note: The greater the relative time you specify, the less accurate it'll be.
        If you need something for a specific time, it's recommended to set a date instead.*
        `}
        `,
        inline: true,
    }, {
        name: 'Allowed letters',
        value: stripIndent`
        **ms:** milliseconds
        **s:** seconds
        **m:** minutes
        **h:** hours
        **d:** days
        **w:** weeks
        **mth:** months
        **y:** years
        `,
        inline: true,
    }],
}];

const args = [{
    key: 'command',
    prompt: 'What command do you want to get information about?',
    type: 'command',
    required: false,
    async validate(value: string, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const arg = argument as Argument<'command'>;
        if (!arg.type) return true;
        const isValid = await arg.type.validate(value, message, arg);
        if (isValid !== true) return isValid;
        const command = await arg.type.parse(value, message, arg);
        if (!command || command.hidden || command.ownerOnly) return false;
        return true;
    },
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class HelpCommand extends Command<boolean, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'help',
            aliases: ['commands'],
            group: 'info',
            description: 'Displays all the commands you have access to, or information about a single command.',
            details: '`command` can be either a command\'s name or alias.',
            examples: ['help ban'],
            guarded: true,
            hidden: true,
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.String,
                name: 'command',
                description: 'The command to get info from.',
                autocomplete: true,
            }],
        });
    }

    public async run(context: CommandContext, { command }: ParsedArgs): Promise<void> {
        const { guild, client } = context;
        const { registry, user, owners, options } = client;
        const { groups } = registry;
        const owner = owners?.[0];
        const prefix = guild?.prefix || client.prefix;

        if (command) {
            command &&= registry.resolveCommand(command);
            const hasPermission = command.hasPermission(context);
            if (hasPermission !== true) {
                if (typeof hasPermission === 'string') {
                    await command.onBlock(context, hasPermission);
                    return;
                }
                await command.onBlock(context, 'userPermissions', { missing: hasPermission });
                return;
            }

            await replyAll(context, commandInfo(client, command, guild));
            return;
        }

        const commandList = getCommandsList(context, groups);

        const base = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `${user.username}'s help`,
                iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .toJSON();

        const hasDeprecated = commandList.some(val => val.value.includes('~~'));
        const hasDash = commandList.some(val => val.value.includes('—'));
        const page1 = [];
        if (hasDeprecated) page1.push(hasDeprecatedMessage);
        if (hasDash) page1.push(hasDisabledMessage);
        const page1String = page1.join('; those with ');

        const pages = [
            new EmbedBuilder(base).setTitle('Commands list').setDescription(stripIndent`
                To use a command type \`${prefix}<command>\`, \`/<command>\` or \`@${user.tag} <command>\`.
                Type \`/help <command>\` for detailed information of a command.

                ${page1String ? `Commands ${page1String}.` : ''}
                `).addFields(...commandList, {
                name: '🔗 Useful links',
                value: oneLine`
                ${hyperlink('Top.gg page', topgg)} -
                ${hyperlink('Support server', options.serverInvite ?? '')} -
                ${hyperlink('Invite the bot', topgg + '/invite')} -
                ${hyperlink('Vote here', topgg + '/vote')} -
                `,
            }),
            new EmbedBuilder({ ...base, ...staticEmbedPages[0] }).setTitle(`About ${user.username}`),
            new EmbedBuilder({ ...base, ...staticEmbedPages[1] }),
            new EmbedBuilder({ ...base, ...staticEmbedPages[2] }).addFields({
                name: 'Specific date',
                value: stripIndent`
                ${oneLine`
                ${user.username} uses the **British English date format**, and supports both
                24-hour and 12-hour formats. E.g. this is right: \`21/10/2021\`, while this
                isn't: \`10/21/2021\`, while both of these cases work: \`11:30pm\`, \`23:30\`.
                `}

                ${oneLine`
                You can also specify the time zone offset by adding a \`+\` or \`-\` sign followed
                by a number, like this: \`1pm -4\`. This means that time will be used as if it's
                from UTC-4.
                `}
                `,
            }),
        ];

        await pagedEmbed(context, {
            number: 1,
            total: pages.length,
            toUser: true,
            dmMsg: 'Check your DMs for a list of the commands and information about the bot.',
        }, (page: number): TemplateEmbedResult => ({
            embed: pages[page].setFooter({
                text: `Page ${page + 1} of ${pages.length} • Version: ${version} • Developer: ${owner?.tag}`,
                iconURL: user.displayAvatarURL({ forceStatic: false }),
            }),
            total: pages.length,
        }));
    }

    public async runAutocomplete(interaction: CommandoAutocompleteInteraction): Promise<void> {
        const { client, options } = interaction;
        const query = options.getFocused().toLowerCase();
        const matches = client.registry.commands
            .filter(command => {
                if (command.hidden || command.ownerOnly) return false;
                return command.name.includes(query)
                    || command.aliases.some(alias => alias.includes(query));
            })
            .map(command => command.name)
            .slice(0, 25)
            .sort()
            .map<ChoiceData<string>>(command => ({
                name: capitalize(command),
                value: command,
            }));

        await interaction.respond(matches);
    }
}

function getCommandsList(context: CommandContext, groups: Collection<string, CommandGroup>): APIEmbedField[] {
    const { guild, author, client } = context;
    const owner = client.owners?.[0];

    const commands = groups.map(g => g.commands.filter(cmd => {
        const hasPermission = cmd.hasPermission(context) === true;
        const guildOnly = !guild ? !cmd.guildOnly : true;
        const dmOnly = guild ? !cmd.dmOnly : true;
        const shouldHide = author.id !== owner?.id && cmd.hidden;

        return !shouldHide && hasPermission && guildOnly && dmOnly;
    })).filter(g => g.size > 0);

    const commandList: APIEmbedField[] = [];
    for (const group of commands) {
        const { name } = group.toJSON()[0].group;
        const list = group.map(command => {
            let str = `\`${command.name}\``;
            if ((guild && !command.isEnabledIn(guild)) || !command.isEnabledIn(null)) {
                str = `\`—${str.replace(/`/g, '')}\``;
            }
            if (command.deprecated) str = `~~\`${str.replace(/`/g, '')}\`~~`;
            return str;
        }).sort().join(', ');
        commandList.push({ name, value: list });
    }

    return commandList;
}

/**
 * Creates an embed containing the information about the command.
 * @param command The command to get information from.
 * @param guild The guild where the command is used.
 */
function commandInfo(client: CommandoClient<true>, command: Command, guild: CommandoGuild | null): EmbedBuilder {
    const { prefix: _prefix, user, owners } = client;
    const {
        name, description, details, examples, aliases, group, guarded, throttling, ownerOnly, guildOnly,
        dmOnly, deprecated, deprecatedReplacement, slashInfo,
    } = command;

    const prefix = guild?.prefix || _prefix || '';

    const usage = command.format?.split('\n').map(format => {
        if (/^[[<]/.test(format)) {
            return `**>** \`${prefix + name} ${format}\``;
        }

        const [cmd, desc] = format.split(' - ');
        const str = `**>** \`${prefix + cmd}\``;

        if (desc) return str + ' - ' + desc;
        return str;
    }).join('\n') || `**>** \`${prefix + name}\``;

    const clientPermissions = command.clientPermissions?.map(perm => Util.permissions[perm]).join(', ');
    const userPermissions = command.userPermissions?.map(perm => Util.permissions[perm]).join(', ');

    const embed = new EmbedBuilder()
        .setColor('#4c9f4c')
        .setAuthor({
            name: `Information for command: ${name} ${deprecated ? '(Deprecated)' : ''}`,
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
        .setDescription(stripIndent`
            ${deprecated ? oneLine`
            **This command has been marked as deprecated, which means it will be removed in future updates.
            Please start using the \`${deprecatedReplacement}\` command from now on.**
            ` : ''}
            ${description}
            ${details ? `\n>>> ${details}` : ''}
        `)
        .addFields({
            name: 'Usage',
            value: usage,
        })
        .setFooter({
            text: `Version: ${version} • Developer: ${owners?.[0].tag}`,
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        });

    if (examples) embed.addFields({
        name: 'Examples',
        value: examples.map(ex => `**>** \`${prefix + ex}\``).join('\n'),
    });

    const information = {
        Category: group.name,
        Aliases: aliases.join(', ') || null,
        Slash: slashInfo ? 'Yes' : 'No',
        Cooldown: throttling
            ? `${pluralize('usage', throttling.usages)} per ${prettyMs(throttling.duration * 1000, { verbose: true })}`
            : null,
        Guarded: guarded ? 'Yes' : 'No',
        Status: !guarded ? (command.isEnabledIn(guild) ? 'Enabled' : 'Disabled') : null,
        'Server only': guildOnly ? 'Yes' : null,
        'DMs only': dmOnly ? 'Yes' : null,
        'Bot perms': clientPermissions || null,
        'User perms': userPermissions || (ownerOnly ? 'Bot\'s owner only' : null),
    };

    const info: string[] = [];
    for (const prop of Object.keys(information)) {
        if (!information[prop]) continue;
        info.push(`**>** **${prop}:** ${information[prop]}`);
    }

    const first = info.splice(0, Math.round(info.length / 2 + 0.1));

    embed.addFields(
        { name: 'Information', value: first.join('\n'), inline: true },
        { name: '\u200B', value: info.join('\n'), inline: true }
    );

    return embed;
}
