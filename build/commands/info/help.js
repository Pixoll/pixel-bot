"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
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
            }, {
                name: 'Upcoming features',
                value: (0, common_tags_1.stripIndent) `
        🔹 **Tickets system:** ETA 2-3 months.
        🔹 **Giveaways system:** ETA 2-3 months.
        🔹 **Chat filtering:** ETA 4-5 months.
        `,
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
        at least one** of the following permissions: \`Ban members\`, \`Deafen members\`,
        \`Kick members\`, \`Manage channels\`, \`Manage emojis and stickers\`, \`Manage guild\`,
        \`Manage messages\`, \`Manage nicknames\`, \`Manage roles\`, \`Manage threads\`,
        \`Manage webhooks\`, \`Move members\`, \`Mute members\`.
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
                }],
        });
    }
    async run(context, { command }) {
        const { guild, client, author } = context;
        const { registry, user, owners } = client;
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
                `).addFields(commandList),
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
}
exports.default = HelpCommand;
function getCommandsList(context, groups) {
    const { guild, author, client } = context;
    const { options, owners } = client;
    const owner = owners?.[0];
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
    commandList.push({
        name: '🔗 Useful links',
        value: (0, common_tags_1.oneLine) `
        [Top.gg page](${topgg}) -
        [Support server](${options.serverInvite}) -
        [Invite the bot](${topgg}/invite) -
        [Vote here](${topgg}/vote)
        `,
    });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9pbmZvL2hlbHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBcUM7QUFDckMsNkNBQW1EO0FBQ25ELDJDQUE4RjtBQUM5RixxREFVeUI7QUFDekIscURBQTBHO0FBRzFHLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQXNCLHVCQUF1QixDQUFDLENBQUM7QUFFMUUsTUFBTSxLQUFLLEdBQUcsdUNBQXVDLENBQUM7QUFDdEQsTUFBTSxvQkFBb0IsR0FBRyxpRkFBaUYsQ0FBQztBQUMvRyxNQUFNLGtCQUFrQixHQUFHLElBQUEscUJBQU8sRUFBQTs7O0NBR2pDLENBQUM7QUFFRixNQUFNLGdCQUFnQixHQUFlLENBQUM7UUFDbEMsV0FBVyxFQUFFLElBQUEscUJBQU8sRUFBQTs7O0tBR25CO1FBQ0QsTUFBTSxFQUFFLENBQUM7Z0JBQ0wsSUFBSSxFQUFFLGtCQUFrQjtnQkFDeEIsS0FBSyxFQUFFLElBQUEseUJBQVcsRUFBQTs7Ozs2QkFJRyxJQUFBLHFCQUFPLEVBQUE7O1NBRTNCOytCQUNzQixJQUFBLHFCQUFPLEVBQUE7O1NBRTdCOzs7U0FHQTthQUNKLEVBQUU7Z0JBQ0MsSUFBSSxFQUFFLG1CQUFtQjtnQkFDekIsS0FBSyxFQUFFLElBQUEseUJBQVcsRUFBQTs7OztTQUlqQjthQUNKLEVBQUU7Z0JBQ0MsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsS0FBSyxFQUFFLElBQUEscUJBQU8sRUFBQTs7O1NBR2I7YUFDSixDQUFDO0tBQ0wsRUFBRTtRQUNDLEtBQUssRUFBRSxlQUFlO1FBQ3RCLE1BQU0sRUFBRSxDQUFDO2dCQUNMLElBQUksRUFBRSxnQkFBZ0I7Z0JBQ3RCLEtBQUssRUFBRSxJQUFBLHlCQUFXLEVBQUE7VUFDaEIsSUFBQSxxQkFBTyxFQUFBOzs7U0FHUjs7Ozs7OztTQU9BO2FBQ0osRUFBRTtnQkFDQyxJQUFJLEVB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