"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const lodash_1 = require("lodash");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const functions_1 = require("../../utils/functions");
const { version } = require('../../../package.json');
const topgg = 'https://top.gg/bot/802267523058761759';
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
            details: '`command` can be either a command\'s name or alias.',
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
                await command.onBlock(context, 'userPermissions', { missing: hasPermission });
                return;
            }
            await (0, functions_1.replyAll)(context, commandInfo(client, command, guild));
            return;
        }
        const commandList = getCommandsList(context, groups);
        const base = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
            name: `${user.username}'s help`,
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .toJSON();
        const hasDeprecated = commandList.some(val => val.value.includes('~~'));
        const hasDash = commandList.some(val => val.value.includes('—'));
        const page1 = [];
        if (hasDeprecated)
            page1.push(hasDeprecatedMessage);
        if (hasDash)
            page1.push(hasDisabledMessage);
        const page1String = page1.join('; those with ');
        const pages = [
            new discord_js_1.EmbedBuilder(base).setTitle('Commands list').setDescription((0, common_tags_1.stripIndent) `
                To use a command type \`${prefix}<command>\`, \`/<command>\` or \`@${user.tag} <command>\`.
                Type \`/help <command>\` for detailed information of a command.

                ${page1String ? `Commands ${page1String}.` : ''}
                `).addFields(...commandList, {
                name: '🔗 Useful links',
                value: (0, common_tags_1.oneLine) `
                ${(0, discord_js_1.hyperlink)('Top.gg page', topgg)} -
                ${(0, discord_js_1.hyperlink)('Support server', options.serverInvite ?? '')} -
                ${(0, discord_js_1.hyperlink)('Invite the bot', topgg + '/invite')} -
                ${(0, discord_js_1.hyperlink)('Vote here', topgg + '/vote')} -
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
        await (0, functions_1.pagedEmbed)(context, {
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
    const { name, description, details, examples, aliases, group, guarded, throttling, ownerOnly, guildOnly, dmOnly, deprecated, deprecatedReplacement, slashInfo, } = command;
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
        .setColor('#4c9f4c')
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
        Slash: slashInfo ? 'Yes' : 'No',
        Cooldown: throttling
            ? `${(0, functions_1.pluralize)('usage', throttling.usages)} per ${(0, better_ms_1.prettyMs)(throttling.duration * 1000, { verbose: true })}`
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9pbmZvL2hlbHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBcUM7QUFDckMsNkNBQW1EO0FBQ25ELDJDQVFvQjtBQUNwQixtQ0FBb0M7QUFDcEMscURBV3lCO0FBQ3pCLHVDQUFtRDtBQUNuRCxxREFBNkY7QUFHN0YsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBc0IsdUJBQXVCLENBQUMsQ0FBQztBQUUxRSxNQUFNLEtBQUssR0FBRyx1Q0FBdUMsQ0FBQztBQUN0RCxNQUFNLG9CQUFvQixHQUFHLGlGQUFpRixDQUFDO0FBQy9HLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSxxQkFBTyxFQUFBOzs7Q0FHakMsQ0FBQztBQUVGLE1BQU0sZ0JBQWdCLEdBQWUsQ0FBQztRQUNsQyxXQUFXLEVBQUUsSUFBQSxxQkFBTyxFQUFBOzs7S0FHbkI7UUFDRCxNQUFNLEVBQUUsQ0FBQztnQkFDTCxJQUFJLEVBQUUsa0JBQWtCO2dCQUN4QixLQUFLLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7OzZCQUlHLElBQUEscUJBQU8sRUFBQTs7U0FFM0I7K0JBQ3NCLElBQUEscUJBQU8sRUFBQTs7U0FFN0I7OztTQUdBO2dCQUNELE9BQU87Z0JBQ1AsaUNBQWlDO2dCQUNqQywwQkFBMEI7Z0JBQzFCLDZDQUE2QztnQkFDN0MsK0NBQStDO2dCQUMvQyw2Q0FBNkM7Z0JBQzdDLFNBQVM7YUFDWixFQUFFO2dCQUNDLElBQUksRUFBRSxRQUFRO2dCQUNkLEtBQUssRUFBRSxJQUFBLHFCQUFPLEVBQUE7OztTQUdiO2FBQ0osQ0FBQztLQUNMLEVBQUU7UUFDQyxLQUFLLEVBQUUsZUFBZTtRQUN0QixNQUFNLEVBQUUsQ0FBQztnQkFDTCxJQUFJLEVBQUUsZ0JBQWdCO2dCQUN0QixLQUFLLEVBQUUsSUFBQSx5QkFBVyxFQUFBO1VBQ2hCLElBQUEscUJBQU8sRUFB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