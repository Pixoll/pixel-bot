/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { MessageEmbed } = require('discord.js')
const { pagedEmbed, getArgument, replyAll, pluralize } = require('../../utils/functions')
const { version } = require('../../package.json')
const { stripIndent, oneLine } = require('common-tags')
const { CommandInstances } = require('../../command-handler/typings')
const { permissions } = require('../../command-handler/util')
const myMs = require('../../utils/my-ms')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            aliases: ['commands'],
            group: 'info',
            description: 'Displays all the commands you have access to, or information about a single command.',
            details: '`command` can be either a command\'s name or alias.',
            examples: ['help ban'],
            guarded: true,
            args: [{
                key: 'command',
                prompt: 'What command do you want to get information about?',
                type: 'command',
                required: false
            }],
            slash: {
                options: [{
                    type: 'string',
                    name: 'command',
                    description: 'The command to get info from.'
                }]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {Command} args.command The command to get information from
     */
    async run({ message, interaction }, { command }) {
        const { guild, client } = message || interaction
        const author = message?.author || interaction.user
        const { registry, user, owners, options } = client
        const { groups } = registry
        const owner = owners[0]
        const prefix = guild?.prefix || client.prefix

        try {
            command &&= registry.resolveCommand(command)
        } catch {
            command = null
        }

        if (!command) {
            const commands = groups.map(g => g.commands.filter(cmd => {
                const hasPermission = cmd.hasPermission({ message, interaction }) === true
                const guildOnly = !guild ? !cmd.guildOnly : true
                const dmOnly = guild ? !cmd.dmOnly : true
                const shouldHide = author.id !== owner.id && cmd.hidden

                return !shouldHide && hasPermission && guildOnly && dmOnly
            })).filter(g => g.size > 0)

            const commandList = []
            for (const group of commands) {
                const { name } = group.first().group
                const list = group.map(c => {
                    let str = `\`${c.name}\``
                    if ((guild && !c.isEnabledIn(guild)) || !c._globalEnabled) {
                        str = `\`—${str.replace(/`/g, '')}\``
                    }
                    if (c.deprecated) str = `~~\`${str.replace(/`/g, '')}\`~~`
                    return str
                }).sort().join(', ')
                commandList.push({ name, value: list })
            }

            const topgg = 'https://top.gg/bot/802267523058761759'
            commandList.push({
                name: '🔗 Useful links',
                value: oneLine`
                    [Top.gg page](${topgg}) -
                    [Support server](${options.serverInvite}) -
                    [Invite the bot](${topgg}/invite) -
                    [Vote here](${topgg}/vote)
                `
            })

            const base = new MessageEmbed()
                .setColor('#4c9f4c')
                .setAuthor({
                    name: `${user.username}'s help`, iconURL: user.displayAvatarURL({ dynamic: true })
                })

            const strikethrough = 'with a strikethrough (~~`like this`~~), mean they\'ve been marked as deprecated'
            const dash = oneLine`
                with a dash before their name (\`—like this\`), mean they've been disabled,
                either on the server you're in or everywhere
            `
            const hasDeprecated = commandList.some(val => val.value.includes('~~'))
            const hasDash = commandList.some(val => val.value.includes('—'))
            let page1 = []
            if (hasDeprecated) page1.push(strikethrough)
            if (hasDash) page1.push(dash)
            page1 = page1.join('; those with ')

            const pages = [
                new MessageEmbed(base)
                    .setTitle('Commands list')
                    .setDescription(stripIndent`
                        To use a command type \`${prefix}<command>\`, \`/<command>\` or \`@${user.tag} <command>\`.
                        Type \`/help <command>\` for detailed information of a command.

                        ${page1 ? `Commands ${page1}.` : ''}
                    `)
                    .addFields(commandList),
                new MessageEmbed(base)
                    .setTitle(`About ${user.username}`)
                    .setDescription(oneLine`
                        This bot provides a handful amount of moderation, management, information and some other
                        misc commands, going from muting, banning, server information, setting reminders, etc.
                    `)
                    .addField('Current features', stripIndent`
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
                    `)
                    .addField('Upcoming features', stripIndent`
                        🔹 **Tickets system:** ETA 2-3 months.
                        🔹 **Giveaways system:** ETA 2-3 months.
                        🔹 **Chat filtering:** ETA 4-5 months.
                    `)
                    .addField('\u200B', oneLine`
                        *Note: Pixel is still in "early" development, some features, commands and data are subject
                        to future change or removal.*
                    `),
                new MessageEmbed(base)
                    .setTitle('Command usage')
                    .addField('Arguments tips', stripIndent`
                        ${oneLine`
                            If an argument contains spaces, you can use "double" or 'single'
                            quotes, and everything inside of that will count as a __single argument__.
                        `}

                        **Argument types:**
                        **1. Square paranthesis** \`[]\`: Required.
                        **2. Arrow parenthesis** \`<>\`: Optional.

                        *Note: Don't include these brakets (\`[]\` or \`<>\`) in the argument.*
                    `)
                    .addField('Moderator permissions', stripIndent`
                        ${oneLine`
                            Some commands require you to be a "moderator", which means that you **must have
                            at least one** of the following permissions: \`Ban members\`, \`Deafen members\`,
                            \`Kick members\`, \`Manage channels\`, \`Manage emojis and stickers\`, \`Manage guild\`,
                            \`Manage messages\`, \`Manage nicknames\`, \`Manage roles\`, \`Manage threads\`,
                            \`Manage webhooks\`, \`Move members\`, \`Mute members\`.
                        `}
                    `),
                new MessageEmbed(base)
                    .setTitle('Time formatting')
                    .addField('Relative time', stripIndent`
                        ${oneLine`
                            Just specify the relative time with a number followed by a letter, like this:
                            \`1d\`, \`1.5d\` or \`1d12h\`.
                        `}

                        ${oneLine`
                            *Note: The greater the relative time you specify, the less accurate it'll be.
                            If you need something for a specific time, it's recommended to set a date instead.*
                        `}
                    `, true)
                    .addField('Allowed letters', stripIndent`
                        **ms:** milliseconds
                        **s:** seconds
                        **m:** minutes
                        **h:** hours
                        **d:** days
                        **w:** weeks
                        **mth:** months
                        **y:** years
                    `, true)
                    .addField('Specific date', stripIndent`
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
                    `)
            ]

            const generate = page => ({
                embed: pages[page].setFooter({
                    text: `Page ${page + 1} of ${pages.length} • Version: ${version} • Developer: ${owner.tag}`,
                    iconURL: user.displayAvatarURL({ dynamic: true })
                })
            })

            return await pagedEmbed({ message, interaction }, {
                number: 1,
                total: pages.length,
                toUser: true,
                dmMsg: 'Check your DMs for a list of the commands and information about the bot.'
            }, generate)
        }

        if (message && author.id !== owner.id) {
            while (command.hidden) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[0])
                if (cancelled) return
                command = value
            }
        }

        const hasPermission = command.hasPermission({ message, interaction })
        if (hasPermission !== true) {
            if (typeof hasPermission === 'string') {
                return await command.onBlock({ message, interaction }, hasPermission)
            }
            return await command.onBlock({ message, interaction }, 'userPermissions', { missing: hasPermission })
        }

        await replyAll({ message, interaction }, commandInfo(command, guild))
    }
}

/**
 * Creates an embed containing the information about the command.
 * @param {Command} cmd The command to get information from.
 * @param {CommandoGuild} guild The guild where the command is used.
 */
function commandInfo(cmd, guild) {
    const { prefix: _prefix, user, owners } = cmd.client
    const {
        name, description, details, examples, aliases, group, guarded, throttling, ownerOnly, guildOnly,
        dmOnly, deprecated, replacing, slash
    } = cmd

    const prefix = guild?.prefix || _prefix

    const usage = cmd.format?.split('\n').map(format => {
        if (/^[[<]/.test(format)) {
            return `**>** \`${prefix + name} ${format}\``
        }

        const [cmd, desc] = format.split(' - ')
        const str = `**>** \`${prefix + cmd}\``

        if (desc) return str + ' - ' + desc
        return str
    }).join('\n') || `**>** \`${prefix + name}\``

    const clientPermissions = cmd.clientPermissions?.map(perm => permissions[perm]).join(', ')
    const userPermissions = cmd.userPermissions?.map(perm => permissions[perm]).join(', ')

    const embed = new MessageEmbed()
        .setColor('#4c9f4c')
        .setAuthor({
            name: `Information for command: ${name} ${deprecated ? '(Deprecated)' : ''}`,
            iconURL: user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(stripIndent`
            ${deprecated ? oneLine`
                **This command has been marked as deprecated, which means it will be removed in future updates.
                Please start using the \`${replacing}\` command from now on.**
            ` : ''}
            ${description}
            ${details ? `\n>>> ${details}` : ''}
        `)
        .addField('Usage', usage)
        .setFooter({
            text: `Version: ${version} • Developer: ${owners[0].tag}`,
            iconURL: user.displayAvatarURL({ dynamic: true })
        })

    if (examples) embed.addField('Examples', examples.map(ex => `**>** \`${prefix + ex}\``).join('\n'))

    const information = {
        Category: group.name,
        Aliases: aliases.join(', ') || null,
        Slash: slash ? 'Yes' : 'No',
        Cooldown: throttling ?
            `${pluralize('usage', throttling.usages)} per ${myMs(throttling.duration * 1000, { long: true })}` :
            null,
        Guarded: guarded ? 'Yes' : 'No',
        Status: !guarded ? (cmd.isEnabledIn(guild) ? 'Enabled' : 'Disabled') : null,
        'Server only': guildOnly ? 'Yes' : null,
        'DMs only': dmOnly ? 'Yes' : null,
        'Bot perms': clientPermissions || null,
        'User perms': userPermissions || (ownerOnly ? 'Bot\'s owner only' : null)
    }

    const info = []
    for (const prop in information) {
        if (!information[prop]) continue
        info.push(`**>** **${prop}:** ${information[prop]}`)
    }

    const first = info.splice(0, Math.round(info.length / 2 + 0.1))

    embed.addFields(
        { name: 'Information', value: first.join('\n'), inline: true },
        { name: '\u200B', value: info.join('\n'), inline: true }
    )

    return embed
}
