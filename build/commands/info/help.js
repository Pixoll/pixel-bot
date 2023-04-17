"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const lodash_1 = require("lodash");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const { version } = require('../../../package.json');
const hasDeprecatedMessage = 'with a strikethrough (~~`like this`~~), mean they\'ve been marked as deprecated';
const hasDisabledMessage = (0, common_tags_1.oneLine) `
    with a dash before their name (\`—like this\`), mean they've been disabled,
    either on the server you're in or everywhere
`;
const staticEmbedPages = [{
        description: (0, common_tags_1.oneLine) `
        This bot provides a handful amount of moderation, management, information and some other
        misc commands, going from muting, banning, server information, setting reminders, etc.
    `,
        fields: [{
                name: 'Current features',
                value: (0, common_tags_1.stripIndent) `
        🔹 **Slash commands:** type \`/\` to get access to the commands list.
        🔹 **Moderation:** warning, kicking, temp-banning, banning, muting, logging, etc.
        🔹 **Welcome messages:** in a server channel.
        🔹 **Audit logs:** ${(0, common_tags_1.oneLine) `
        new joins, permissions update, channels/roles update, etc. Specific channel logging soon!
        `}
        🔹 **Polls system:** ${(0, common_tags_1.oneLine) `
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
                value: (0, common_tags_1.oneLine) `
        *Note: Pixel is still in "early" development, some features, commands and data are subject
        to future change or removal.*
        `,
            }],
    }, {
        title: 'Command usage',
        fields: [{
                name: 'Arguments tips',
                value: (0, common_tags_1.stripIndent) `
        ${(0, common_tags_1.oneLine) `
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
                value: (0, common_tags_1.stripIndent) `
        ${(0, common_tags_1.oneLine) `
        Some commands require you to be a "moderator", which means that you **must have
        at least one** of the following permissions: ${utils_1.moderatorPermissions.map(perm => `${pixoll_commando_1.Util.permissions[perm]}`)}
        `}
        `,
            }],
    }, {
        title: 'Time formatting',
        fields: [{
                name: 'Relative time',
                value: (0, common_tags_1.stripIndent) `
        ${(0, common_tags_1.oneLine) `
        Just specify the relative time with a number followed by a letter, like this:
        \`1d\`, \`1.5d\` or \`1d12h\`.
        `}

        ${(0, common_tags_1.oneLine) `
        *Note: The greater the relative time you specify, the less accurate it'll be.
        If you need something for a specific time, it's recommended to set a date instead.*
        `}
        `,
                inline: true,
            }, {
                name: 'Allowed letters',
                value: (0, common_tags_1.stripIndent) `
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
        async validate(value, message, argument) {
            const arg = argument;
            if (!arg.type)
                return true;
            if (typeof value === 'undefined')
                return false;
            const isValid = await arg.type.validate(value, message, arg);
            if (isValid !== true)
                return isValid;
            const command = await arg.type.parse(value, message, arg);
            if (!command || command.hidden || command.ownerOnly)
                return false;
            return true;
        },
    }];
class HelpCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'help',
            aliases: ['commands'],
            group: 'info',
            description: 'Displays all the commands you have access to, or information about a single command.',
            detailedDescription: '`command` can be either a command\'s name or alias.',
            examples: ['help ban'],
            guarded: true,
            hidden: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    name: 'command',
                    description: 'The command to get info from.',
                    autocomplete: true,
                }],
        });
    }
    async run(context, { command }) {
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
                await command.onBlock(context, 'userPermissions', { missing: hasPermission || undefined });
                return;
            }
            await (0, utils_1.reply)(context, commandInfo(client, command, guild));
            return;
        }
        const commandList = getCommandsList(context, groups);
        const base = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `${user.username}'s help`,
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .toJSON();
        const hasDeprecated = commandList.some(val => val.value.includes('~~'));
        const hasDash = commandList.some(val => val.value.includes('—'));
        const commandsDisclaimers = [];
        if (hasDeprecated)
            commandsDisclaimers.push(hasDeprecatedMessage);
        if (hasDash)
            commandsDisclaimers.push(hasDisabledMessage);
        const commandsDisclaimer = commandsDisclaimers.join('; those with ');
        const pages = [
            new discord_js_1.EmbedBuilder(base).setTitle('Commands list').setDescription((0, common_tags_1.stripIndent) `
                To use a command type \`${prefix}<command>\`, \`/<command>\` or \`@${user.tag} <command>\`.
                Type \`/help <command>\` for detailed information of a command.

                ${commandsDisclaimer ? `Commands ${commandsDisclaimer}.` : ''}
                `).addFields(...commandList, {
                name: '🔗 Useful links',
                value: (0, common_tags_1.oneLine) `
                ${(0, utils_1.hyperlink)('Privacy Policy', utils_1.privacyPolicyUrl)} -
                ${(0, utils_1.hyperlink)('Terms of Service', utils_1.termsOfServiceUrl)} -
                ${(0, utils_1.hyperlink)('Top.gg page', utils_1.topggUrl)} -
                ${(0, utils_1.hyperlink)('Support server', options.serverInvite ?? '')} -
                ${(0, utils_1.hyperlink)('Invite the bot', utils_1.topggUrl + '/invite')} -
                ${(0, utils_1.hyperlink)('Vote here', utils_1.topggUrl + '/vote')}
                `,
            }),
            new discord_js_1.EmbedBuilder({ ...base, ...staticEmbedPages[0] }).setTitle(`About ${user.username}`),
            new discord_js_1.EmbedBuilder({ ...base, ...staticEmbedPages[1] }),
            new discord_js_1.EmbedBuilder({ ...base, ...staticEmbedPages[2] }).addFields({
                name: 'Specific date',
                value: (0, common_tags_1.stripIndent) `
                ${(0, common_tags_1.oneLine) `
                ${user.username} uses the **British English date format**, and supports both
                24-hour and 12-hour formats. E.g. this is right: \`21/10/2021\`, while this
                isn't: \`10/21/2021\`, while both of these cases work: \`11:30pm\`, \`23:30\`.
                `}

                ${(0, common_tags_1.oneLine) `
                You can also specify the time zone offset by adding a \`+\` or \`-\` sign followed
                by a number, like this: \`1pm -4\`. This means that time will be used as if it's
                from UTC-4.
                `}
                `,
            }),
        ];
        await (0, utils_1.pagedEmbed)(context, {
            number: 1,
            total: pages.length,
            toUser: true,
            dmMsg: 'Check your DMs for a list of the commands and information about the bot.',
        }, (page) => ({
            embed: pages[page].setFooter({
                text: `Page ${page + 1} of ${pages.length} • Version: ${version} • Developer: ${owner?.tag}`,
                iconURL: user.displayAvatarURL({ forceStatic: false }),
            }),
            total: pages.length,
        }));
    }
    async runAutocomplete(interaction) {
        const { client, options } = interaction;
        const query = options.getFocused().toLowerCase();
        const matches = client.registry.commands
            .filter(command => {
            if (command.hidden || command.ownerOnly)
                return false;
            return command.name.includes(query)
                || command.aliases.some(alias => alias.includes(query));
        })
            .map(command => command.name)
            .slice(0, 25)
            .sort()
            .map(command => ({
            name: (0, lodash_1.capitalize)(command),
            value: command,
        }));
        await interaction.respond(matches);
    }
}
exports.default = HelpCommand;
function getCommandsList(context, groups) {
    const { guild, author, client } = context;
    const owner = client.owners?.[0];
    const commands = groups.map(g => g.commands.filter(cmd => {
        const hasPermission = cmd.hasPermission(context) === true;
        const guildOnly = !guild ? !cmd.guildOnly : true;
        const dmOnly = guild ? !cmd.dmOnly : true;
        const shouldHide = author.id !== owner?.id && cmd.hidden;
        return !shouldHide && hasPermission && guildOnly && dmOnly;
    })).filter(g => g.size > 0);
    const commandList = [];
    for (const group of commands) {
        const { name } = group.toJSON()[0].group;
        const list = group.map(command => {
            let str = `\`${command.name}\``;
            if ((guild && !command.isEnabledIn(guild)) || !command.isEnabledIn(null)) {
                str = `\`—${str.replace(/`/g, '')}\``;
            }
            if (command.deprecated)
                str = `~~\`${str.replace(/`/g, '')}\`~~`;
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
function commandInfo(client, command, guild) {
    const { prefix: _prefix, user, owners } = client;
    const { name, description, details, examples, aliases, group, guarded, throttling, ownerOnly, guildOnly, dmOnly, deprecated, deprecatedReplacement, slashCommand, contextMenuCommands, } = command;
    const prefix = guild?.prefix || _prefix || '';
    const usage = command.format?.split('\n').map(format => {
        if (/^[[<]/.test(format)) {
            return `**>** \`${prefix + name} ${format}\``;
        }
        const [cmd, desc] = format.split(' - ');
        const str = `**>** \`${prefix + cmd}\``;
        if (desc)
            return str + ' - ' + desc;
        return str;
    }).join('\n') || `**>** \`${prefix + name}\``;
    const clientPermissions = command.clientPermissions?.map(perm => pixoll_commando_1.Util.permissions[perm]).join(', ');
    const userPermissions = command.userPermissions?.map(perm => pixoll_commando_1.Util.permissions[perm]).join(', ');
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(utils_1.pixelColor)
        .setAuthor({
        name: `Information for command: ${name} ${deprecated ? '(Deprecated)' : ''}`,
        iconURL: user.displayAvatarURL({ forceStatic: false }),
    })
        .setDescription((0, common_tags_1.stripIndent) `
            ${deprecated ? (0, common_tags_1.oneLine) `
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
    if (examples)
        embed.addFields({
            name: 'Examples',
            value: examples.map(ex => `**>** \`${prefix + ex}\``).join('\n'),
        });
    const information = {
        Category: group.name,
        Aliases: aliases.join(', ') || null,
        Slash: slashCommand ? 'Yes' : 'No',
        'Context Menu': contextMenuCommands.length !== 0 ? 'Yes' : 'No',
        Cooldown: throttling
            ? `${(0, utils_1.pluralize)('usage', throttling.usages)} per ${(0, better_ms_1.prettyMs)(throttling.duration * 1000, { verbose: true })}`
            : null,
        Guarded: guarded ? 'Yes' : 'No',
        Status: !guarded ? (command.isEnabledIn(guild) ? 'Enabled' : 'Disabled') : null,
        'Server only': guildOnly ? 'Yes' : null,
        'DMs only': dmOnly ? 'Yes' : null,
        'Bot perms': clientPermissions || null,
        'User perms': userPermissions || (ownerOnly ? 'Bot\'s owner only' : null),
    };
    const info = [];
    for (const prop of Object.keys(information)) {
        if (!information[prop])
            continue;
        info.push(`**>** **${prop}:** ${information[prop]}`);
    }
    const first = info.splice(0, Math.round(info.length / 2 + 0.1));
    embed.addFields({ name: 'Information', value: first.join('\n'), inline: true }, { name: '\u200B', value: info.join('\n'), inline: true });
    return embed;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9pbmZvL2hlbHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBcUM7QUFDckMsNkNBQW1EO0FBQ25ELDJDQU9vQjtBQUNwQixtQ0FBb0M7QUFDcEMscURBV3lCO0FBQ3pCLHVDQVdxQjtBQUdyQixNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFzQix1QkFBdUIsQ0FBQyxDQUFDO0FBRTFFLE1BQU0sb0JBQW9CLEdBQUcsaUZBQWlGLENBQUM7QUFDL0csTUFBTSxrQkFBa0IsR0FBRyxJQUFBLHFCQUFPLEVBQUE7OztDQUdqQyxDQUFDO0FBRUYsTUFBTSxnQkFBZ0IsR0FBZSxDQUFDO1FBQ2xDLFdBQVcsRUFBRSxJQUFBLHFCQUFPLEVBQUE7OztLQUduQjtRQUNELE1BQU0sRUFBRSxDQUFDO2dCQUNMLElBQUksRUFBRSxrQkFBa0I7Z0JBQ3hCLEtBQUssRUFBRSxJQUFBLHlCQUFXLEVBQUE7Ozs7NkJBSUcsSUFBQSxxQkFBTyxFQUFBOztTQUUzQjsrQkFDc0IsSUFBQSxxQkFBTyxFQUFBOztTQUU3Qjs7O1NBR0E7Z0JBQ0QsT0FBTztnQkFDUCxpQ0FBaUM7Z0JBQ2pDLDBCQUEwQjtnQkFDMUIsNkNBQTZDO2dCQUM3QywrQ0FBK0M7Z0JBQy9DLDZDQUE2QztnQkFDN0MsU0FBUzthQUNaLEVBQUU7Z0JBQ0MsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsS0FBSyxFQUFFLElBQUEscUJBQU8sRUFBQTs7O1NBR2I7YUFDSixDQUFDO0tBQ0wsRUFBRTtRQUNDLEtBQUssRUFBRSxlQUFlO1FBQ3RCLE1BQU0sRUFBRSxDQUFDO2dCQUNMLElBQUksRUFBRSxnQkFBZ0I7Z0JBQ3RCLEtBQUssRUFBRSxJQUFBLHlCQUFXLEVBQUE7VUFDaEIsSUFBQSxxQkFBTyxFQUFBOzs7U0FHUjs7Ozs7OztTQU9BO2FBQ0osRUFBRTtnQkFDQyxJQUFJLEVBQUUs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