const { Command, CommandoMessage, CommandoClient } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const { commandInfo, basicEmbed, pagedEmbed } = require('../../utils/functions')
const { version } = require('../../package.json')
const { stripIndent, oneLine } = require('common-tags')

/**
 * this function creates a paged embed.
 * the first page includes a list of all the commands.
 * the second page includes relevant information of how to use the bot.
 * @param {Number} page the page of the embed
 * @param {CommandoClient} client the client
 * @param {String} prefix the command prefix
 * @param {CommandoMessage} message the message
 */
function helpEmbed(page, { registry, user, owners }, prefix, message) {
    // gets the server where the command was executed, if available
    const { guild } = message
    const { groups } = registry

    /**
     * filters the commands to be displayed in the first page of the embed
     * @param {Command} cmd a command
     */
    function filter(cmd) {
        // checks if the user can use the command
        const canBeUsed = cmd.hasPermission(message)
        const userHasPerms = typeof canBeUsed === 'boolean' ? canBeUsed : false

        // checks if the command is executed in a DM, if so, check if the command is 'guildOnly'
        const guildOnly = !guild ? !cmd.guildOnly : true

        return !cmd.hidden && userHasPerms && guildOnly
    }

    // gets a list of the commands inside their groups 
    const commands = groups.map(({ commands }) => commands.filter(cmd => filter(cmd))).filter(group => group.size > 0)

    // constructs data that will be used later in this embed
    const ownersList = owners.map(({ tag }) => tag).join(', ')

    // creates the template for the paged embed
    const embed = new MessageEmbed()
        .setColor('#4c9f4c')
        .setAuthor(`${user.username}'s help`, user.displayAvatarURL({ dynamic: true }))
        .setFooter(`Page ${++page} of 2 | Version: ${version} | Developers: ${ownersList}`, user.displayAvatarURL({ dynamic: true }))

    // creates the first page of the embed
    if (page === 1) {
        embed.setTitle('Commands list')
            .setDescription(stripIndent`
                To use a command type: \`${prefix}<command>\`, for example: \`${prefix}prefix\`
                You can also mention me to use a command, for example: \`@${user.tag} help\`
                To view detailed information about a specific command, type: \`${prefix}help <command>\`
            `)

        // fills the embed with fields containing each group's commands
        for (const group of commands) {
            const groupName = group.first().group.name
            // creates a list of all the commands inside the group
            const commandList = group.map(({ name }) => `\`${name}\``).sort().join(', ')

            embed.addField(`${groupName}`, commandList)
        }
    }

    // creates the second page of the embed
    if (page === 2) embed.setTitle('Commands usage')
        .setDescription(stripIndent`
            ${oneLine`
                Some commands will have their arguments surrounded by different types of paranthesis or even
                include vertical bars inside them. The meaning of each one of these is listed below.
            `}

            **>** **Square paranthesis** \`[]\`: This argument is required.
            **>** **Arrow parenthesis** \`<>\`: This argument is optional.
            **>** **Vertical bar** \`|\`: This means \`or\`.
        `)
        .addField('Time formatting', stripIndent`
            ${oneLine`
                Other commands will require the use of special formatting for time. It can either a number representing
                the amount of seconds, or a number followed by a letter (it\'s not case sensitive). The number can have
                decimals if you need them to. This are the letters that I support and their meanings:
            `}

            **>** **Letter** \`s\`: seconds
            **>** **Letter** \`m\`: minutes
            **>** **Letter** \`h\`: hours
            **>** **Letter** \`d\`: days
            **>** **Letter** \`y\`: years

            ${oneLine`
                An example of this would be \`3d\`, which means \`3 days\`.
                Another one would be \`1.5y\`, which means \`1 year and a half\`.
            `}
        `)

    return embed
}

module.exports = class help extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            aliases: ['commands'],
            group: 'info',
            memberName: 'help',
            description: 'Displays all the commands you have access to, or information about a single command.',
            details: stripIndent`
                If \`command\` is not specified, it will send an embed with all of the commands that you have access to.
                \`command\` can be either a command's name or alias.
            `,
            format: 'help <command>',
            examples: ['help ban'],
            guarded: true,
            throttling: { usages: 1, duration: 3 },
            args: [{
                key: 'command',
                prompt: 'What command do you want to get information about?',
                type: 'command',
                default: '',
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {Command} args.command The command to get information from
     */
    async run(message, { command }) {
        // gets data that will be used later
        const { guild } = message
        const { client } = this
        const prefix = guild ? guild.commandPrefix : client.commandPrefix

        // sends an embed with all the information if no command is specified
        if (!command) {
            return pagedEmbed(message, { number: 1, total: 2 }, helpEmbed, client, prefix, message)
        }

        const { hidden, guildOnly } = command

        if (hidden) return message.say(basicEmbed('red', 'cross', 'That command is hidden.'))
        // if it's guild only and used in DMs
        if (!guild && guildOnly) return command.onBlock(message, 'guildOnly')
        // if user doens't have permission
        if (!command.hasPermission(message)) return command.onBlock(message, 'permission')

        message.say(commandInfo(client, guild, command))
    }
}