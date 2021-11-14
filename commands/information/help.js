const Command = require('../../command-handler/commands/base')
const { MessageEmbed } = require('discord.js')
const { commandInfo, pagedEmbed, getArgument } = require('../../utils')
const { version } = require('../../package.json')
const { stripIndent, oneLine } = require('common-tags')
const { CommandoMessage, Command: CommandType } = require('../../command-handler/typings')

/** A command that can be run in a client */
module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            aliases: ['commands'],
            group: 'info',
            description: 'Displays all the commands you have access to, or information about a single command.',
            details: '`command` can be either a command\'s name or alias.',
            format: 'help <command>',
            examples: ['help ban'],
            guarded: true,
            args: [{
                key: 'cmd',
                label: 'command',
                prompt: 'What command do you want to get information about?',
                type: 'command',
                required: false
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {CommandType} args.cmd The command to get information from
     */
    async run(message, { cmd }) {
        const { guild, client, author } = message
        const { registry, user, owners, options } = client
        const { groups } = registry
        const owner = owners[0]
        const prefix = guild?.prefix || client.prefix

        if (!cmd) {
            const commands = groups.map(g => g.commands.filter(cmd => {
                const hasPermission = cmd.hasPermission(message) === true
                const guildOnly = !guild ? !cmd.guildOnly : true
                const dmOnly = guild ? !cmd.dmOnly : true
                const shouldHide = author.id !== owner.id && cmd.hidden

                return !shouldHide && hasPermission && guildOnly && dmOnly
            })).filter(g => g.size > 0)

            const commandList = []
            for (const group of commands) {
                const { name } = group.first().group
                const list = group.map(c => {
                    if (c.deprecated) return `~~\`${c.name}\`~~`
                    if ((guild && !c.isEnabledIn(guild)) || !c._globalEnabled) {
                        return `\`—${c.name}\``
                    }
                    return `\`${c.name}\``
                }).sort().join(' ')
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
                .setAuthor(`${user.username}'s help`, user.displayAvatarURL({ dynamic: true }))

            const pages = [
                new MessageEmbed(base)
                    .setTitle('Commands list')
                    .setDescription(stripIndent`
                        To use a command type: \`${prefix}<command>\`, for example: \`${prefix}prefix\`.
                        You can also mention me to use a command, for example: \`@${user.tag} help\`.
                        Type \`${prefix}help <command>\` for detailed information of a command.

                        ${oneLine`
                            Commands with a strikethrough (~~\`like this\`~~), mean they've been marked as deprecated,
                            and the ones with a dash before their name (\`—like this\`), mean they've been disabled,
                            either on the server you're in or everywhere.
                        `}
                    `)
                    .addFields(commandList),
                new MessageEmbed(base)
                    .setTitle(`About ${user.username}`)
                    .setDescription(oneLine`
                        This bot provides a handful amount of moderation, management, information and some other
                        misc commands, going from muting, banning, server information, setting reminders, etc.
                    `)
                    .addField('Current features', stripIndent`
                        🔹 **Moderation:** warning, kicking, soft-banning, temp-banning, banning, muting, etc.
                        🔹 **Welcome messages:** in a server channel.
                        🔹 **Audit logs:** ${oneLine`
                            new joins, permissions update, channels/roles update, etc. Specific channel logging soon!
                        `}
                        🔹 **Polls system:** ${oneLine`
                        custom messages and reactions, automatically ends and determines the results.
                        `}
                        🔹 **Reminders system:** with both relative time and a specific date.
                        🔹 **Reaction roles:** soon with buttons!
                    `)
                    .addField('Upcoming features', stripIndent`
                        🔹 **Slash commands:** ETA ~2 months.
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
                    .addField('Arguments', stripIndent`
                        ${oneLine`
                            Arguments are extra information to pass for the command you want to use,
                            some will be required and others not. You can send arguments surrounded by
                            "double" or 'single' quotes (both work), and everything inside of that will count
                            as a __single argument__.
                        `}

                        ${oneLine`
                            If an argument is surrounded by quotes, it means you **must** put that
                            argument with quotes for the command to work correctly.
                        `}

                        ${oneLine`
                            Some commands will have their arguments surrounded by different types of
                            paranthesis, meaning some are required, while others are not. Just like this:
                        `}
                        **Square paranthesis** \`[]\`: This argument is required.
                        **Arrow parenthesis** \`<>\`: This argument is optional.
                    `)
                    .addField('Permissions', stripIndent`
                        ${oneLine`
                            Some commands will require you to have specific permissions, which has \`Ban members\`
                            for \`${prefix}ban\`, or \`Administrator\` for \`${prefix}setup\`.
                        `}

                        ${oneLine`
                            Others may just require you to be a "moderator", which means that you **must have
                            at least one** of the following permissions: \`Ban members\`, \`Deafen members\`,
                            \`Kick members\`, \`Manage channels\`, \`Manage emojis and stickers\`, \`Manage guild\`,
                            \`Manage messages\`, \`Manage nicknames\`, \`Manage roles\`, \`Manage threads\`,
                            \`Manage webhooks\`, \`Move members\`, \`Mute members\`.
                        `}
                    `),
                new MessageEmbed(base)
                    .setTitle('Time formatting')
                    .setDescription(oneLine`
                        Some commands will require the use of special formatting for time. It can either
                        a number followed by a letter (relative time) or a specific date.
                    `)
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
                            isn't: \`10/21/2021\`, and both of these cases work: \`11:30pm\`, \`23:30\`.
                        `}
                        ${oneLine`
                            You can also specify the time zone offset by adding a \`+\` or \`-\` sign followed
                            by a number, like this: \`12am-3\`. This means that time will be used as if it's
                            from UTC-3.
                        `}
                    `)
            ]

            const generate = page => ({
                embed: pages[page].setFooter(
                    `Page ${++page} of 4 | Version: ${version} | Developer: ${owner.tag}`,
                    user.displayAvatarURL({ dynamic: true })
                )
            })

            return await pagedEmbed(message, {
                number: 1, total: 4, toUser: true,
                dmMsg: 'Check your DMs for a list of the commands and information about the bot.'
            }, generate)
        }

        if (author.id !== owner.id) {
            while (cmd.hidden) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[0])
                if (cancelled) return
                cmd = value
            }
        }

        const hasPermission = cmd.hasPermission(message)
        if (hasPermission !== true) {
            if (typeof hasPermission === 'string') return await cmd.onBlock(message, hasPermission)
            return await cmd.onBlock(message, 'userPermissions', { missing: hasPermission })
        }

        await message.replyEmbed(commandInfo(cmd, guild))
    }
}