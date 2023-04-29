"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
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
            name: pixoll_commando_1.Util.capitalize(command),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9pbmZvL2hlbHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBcUM7QUFDckMsNkNBQW1EO0FBQ25ELDJDQU9vQjtBQUNwQixxREFXeUI7QUFDekIsdUNBV3FCO0FBR3JCLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQXNCLHVCQUF1QixDQUFDLENBQUM7QUFFMUUsTUFBTSxvQkFBb0IsR0FBRyxpRkFBaUYsQ0FBQztBQUMvRyxNQUFNLGtCQUFrQixHQUFHLElBQUEscUJBQU8sRUFBQTs7O0NBR2pDLENBQUM7QUFFRixNQUFNLGdCQUFnQixHQUFlLENBQUM7UUFDbEMsV0FBVyxFQUFFLElBQUEscUJBQU8sRUFBQTs7O0tBR25CO1FBQ0QsTUFBTSxFQUFFLENBQUM7Z0JBQ0wsSUFBSSxFQUFFLGtCQUFrQjtnQkFDeEIsS0FBSyxFQUFFLElBQUEseUJBQVcsRUFBQTs7Ozs2QkFJRyxJQUFBLHFCQUFPLEVBQUE7O1NBRTNCOytCQUNzQixJQUFBLHFCQUFPLEVBQUE7O1NBRTdCOzs7U0FHQTtnQkFDRCxPQUFPO2dCQUNQLGlDQUFpQztnQkFDakMsMEJBQTBCO2dCQUMxQiw2Q0FBNkM7Z0JBQzdDLCtDQUErQztnQkFDL0MsNkNBQTZDO2dCQUM3QyxTQUFTO2FBQ1osRUFBRTtnQkFDQyxJQUFJLEVBQUUsUUFBUTtnQkFDZCxLQUFLLEVBQUUsSUFBQSxxQkFBTyxFQUFBOzs7U0FHYjthQUNKLENBQUM7S0FDTCxFQUFFO1FBQ0MsS0FBSyxFQUFFLGVBQWU7UUFDdEIsTUFBTSxFQUFFLENBQUM7Z0JBQ0wsSUFBSSxFQUFFLGdCQUFnQjtnQkFDdEIsS0FBSyxFQUFFLElBQUEseUJBQVcsRUFBQTtVQUNoQixJQUFBLHFCQUFPLEVBQUE7OztTQUdSOzs7Ozs7O1NBT0E7YUFDSixFQUFFO2dCQUNDLElBQUksRUFBRSx1QkFBdUI7Z0JBQzdC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