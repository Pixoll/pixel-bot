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
        const { guild, client, author } = context;
        const { registry, user, owners, options } = client;
        const { groups } = registry;
        const owner = owners?.[0];
        const prefix = guild?.prefix || client.prefix;
        try {
            command &&= registry.resolveCommand(command);
        }
        catch {
            command = null;
        }
        if (!command) {
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
            return;
        }
        if (context instanceof pixoll_commando_1.CommandoMessage && author.id !== owner?.id) {
            while (command.hidden) {
                const result = await (0, functions_1.getArgument)(context, this.argsCollector?.args[0]);
                if (!result || result.cancelled)
                    return;
                command = result.value;
            }
        }
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
    }
    async runAutocomplete(interaction) {
        const { client, options } = interaction;
        const query = options.getFocused().toLowerCase();
        const matches = client.registry.commands
            .filter(command => command.name.includes(query) || command.aliases.some(alias => alias.includes(query)))
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9pbmZvL2hlbHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBcUM7QUFDckMsNkNBQW1EO0FBQ25ELDJDQVFvQjtBQUNwQixtQ0FBb0M7QUFDcEMscURBV3lCO0FBQ3pCLHVDQUFtRDtBQUNuRCxxREFBMEc7QUFHMUcsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBc0IsdUJBQXVCLENBQUMsQ0FBQztBQUUxRSxNQUFNLEtBQUssR0FBRyx1Q0FBdUMsQ0FBQztBQUN0RCxNQUFNLG9CQUFvQixHQUFHLGlGQUFpRixDQUFDO0FBQy9HLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSxxQkFBTyxFQUFBOzs7Q0FHakMsQ0FBQztBQUVGLE1BQU0sZ0JBQWdCLEdBQWUsQ0FBQztRQUNsQyxXQUFXLEVBQUUsSUFBQSxxQkFBTyxFQUFBOzs7S0FHbkI7UUFDRCxNQUFNLEVBQUUsQ0FBQztnQkFDTCxJQUFJLEVBQUUsa0JBQWtCO2dCQUN4QixLQUFLLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7OzZCQUlHLElBQUEscUJBQU8sRUFBQTs7U0FFM0I7K0JBQ3NCLElBQUEscUJBQU8sRUFBQTs7U0FFN0I7OztTQUdBO2dCQUNELE9BQU87Z0JBQ1AsaUNBQWlDO2dCQUNqQywwQkFBMEI7Z0JBQzFCLDZDQUE2QztnQkFDN0MsK0NBQStDO2dCQUMvQyw2Q0FBNkM7Z0JBQzdDLFNBQVM7YUFDWixFQUFFO2dCQUNDLElBQUksRUFBRSxRQUFRO2dCQUNkLEtBQUssRUFBRSxJQUFBLHFCQUFPLEVBQUE7OztTQUdiO2FBQ0osQ0FBQztLQUNMLEVBQUU7UUFDQyxLQUFLLEVBQUUsZUFBZTtRQUN0QixNQUFNLEVBQUUsQ0FBQztnQkFDTCxJQUFJLEVBQUUsZ0JBQWdCO2dCQUN0QixLQUFLLEVBQUUsSUFBQSx5QkFBVyxFQUFBO1VBQ2hCLElBQUEscUJBQU8sRUFB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