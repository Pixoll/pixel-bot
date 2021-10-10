const Command = require('../../command-handler/commands/base')
const { MessageEmbed } = require('discord.js')
const { commandInfo, basicEmbed, pagedEmbed } = require('../../utils')
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
            throttling: { usages: 1, duration: 3 },
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
        const { guild, client } = message
        const prefix = guild?.prefix || client.prefix

        if (!cmd) {
            /**
             * Creates a paged embed with a list of all the commands and relevant information of how to use the bot.
             * @param {number} page the page of the embed
             */
            function helpEmbed(page) {
                const { registry, user, owners } = client
                const { groups } = registry

                /**
                 * Filters the commands the user has permissions to
                 * @param {CommandType} cmd The command to filter
                 */
                function filterCmd(cmd) {
                    const hasPermission = cmd.hasPermission(message)
                    const hasPerms = typeof hasPermission === 'boolean' ? hasPermission : false
                    const guildOnly = !guild ? !cmd.guildOnly : true
                    const dmOnly = guild ? !cmd.dmOnly : true

                    return !cmd.hidden && hasPerms && guildOnly && dmOnly
                }

                const commands = groups.map(g => g.commands.filter(filterCmd)).filter(g => g.size > 0)
                const owner = owners[0].tag

                const embed = new MessageEmbed()
                    .setColor('#4c9f4c')
                    .setAuthor(`${user.username}'s help`, user.displayAvatarURL({ dynamic: true }))
                    .setFooter(
                        `Page ${++page} of 2 | Version: ${version} | Developer: ${owner}`,
                        user.displayAvatarURL({ dynamic: true })
                    )

                if (page === 1) {
                    embed.setTitle('Commands list')
                        .setDescription(stripIndent`
                            To use a command type: \`${prefix}<command>\`, for example: \`${prefix}prefix\`
                            You can also mention me to use a command, for example: \`@${user.tag} help\`
                            To view detailed information about a specific command, type: \`${prefix}help <command>\`
                        `)

                    for (const group of commands) {
                        const { name } = group.first().group
                        const commandList = group.map(c => `\`${c.name}\``).sort().join(', ')

                        embed.addField(name, commandList)
                    }
                }

                if (page === 2) {
                    embed.setTitle('Commands usage')
                        .setDescription(stripIndent`
                            ${oneLine`
                                Some commands will have their arguments surrounded by different types
                                of paranthesis or even include vertical bars inside them. The meaning
                                of each one of these is listed below.
                            `}

                            **>** **Square paranthesis** \`[]\`: This argument is required.
                            **>** **Arrow parenthesis** \`<>\`: This argument is optional.
                            **>** **Vertical bar** \`|\`: This means \`or\`.
                        `)
                        .addField('Time formatting', stripIndent`
                            ${oneLine`
                                Other commands will require the use of special formatting for time.
                                It can either a number representing the amount of seconds, or a number
                                followed by a letter (it\'s not case sensitive). The number can have
                                decimals if you need them to. This are the letters that I support and
                                their meanings:
                            `}

                            **>** **Letter** \`ms\`: milliseconds
                            **>** **Letter** \`s\`: seconds
                            **>** **Letter** \`m\`: minutes
                            **>** **Letter** \`h\`: hours
                            **>** **Letter** \`d\`: days
                            **>** **Letter** \`w\`: weeks
                            **>** **Letter** \`mth\`: months
                            **>** **Letter** \`y\`: years

                            ${oneLine`
                                An example of this would be \`3d\`, which means \`3 days\`.
                                Another one would be \`1.5y\`, which means \`1 year and a half\`.
                                This also works: \`1d12h\`, which means \`1 day and 12 hours\`.
                            `}
                        `)
                }

                return { embed }
            }

            return await pagedEmbed(message, { number: 1, total: 2 }, helpEmbed)
        }

        if (cmd.hidden) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That command is hidden.'
            }))
        }

        const hasPermission = cmd.hasPermission(message)
        if (hasPermission === false || hasPermission instanceof Array) {
            if (!hasPermission) {
                return await cmd.onBlock(message, 'ownerOnly')
            }
            return await cmd.onBlock(message, 'userPermissions', { missing: hasPermission })
        }

        await message.replyEmbed(commandInfo(cmd, guild))
    }
}