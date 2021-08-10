const { CommandoClient, CommandoMessage, Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const { customEmoji, basicEmbed, formatPerm, sliceDots } = require('./utils/functions')
const { prefixes, disabled } = require('./utils/mongodb-schemas')
const { stripIndent } = require('common-tags')
const mongo = require('./mongo')
const path = require('path')
require('dotenv').config()

// Modules handler
const eventsHandler = require('./utils/events-handler')

const client = new CommandoClient({
    commandPrefix: '!',
    owner: '667937325002784768',
    invite: 'https://discord.gg/Pc9pAHf3GU',
    partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION'],
    presence: {
        activity: {
            name: 'for !help',
            type: 'WATCHING'
        }
    }
})

client.registry
    .registerDefaultTypes()
    .registerGroups([
        { id: 'info', name: 'Information', guarded: true },
        // { id: 'fun', name: 'Fun commands', guarded: false },
        { id: 'minecraft', name: 'Minecraft', guarded: false },
        { id: 'misc', name: 'Miscellaneous', guarded: false },
        { id: 'mod', name: 'Moderation', guarded: false },
        { id: 'owner', name: 'Owner only', guarded: true },
        { id: 'utility', name: 'Utility', guarded: true }
    ])
    .registerCommandsIn(path.join(__dirname, '/commands'))

client.on('ready', async () => {
    const owner = client.owners[0]
    const { username, tag } = client.user
    console.log(`${username} is online! => Logged in as ${tag}!`)

    await mongo().then(console.log('Connected to MongoDB!'))

    eventsHandler(client)

    await owner.send('Debug message: Bot is online.')
})

// Mongo DB data loader
client.once('ready', async () => {
    const allPrefixes = await prefixes.find({})
    for (const prefixData of allPrefixes) {
        if (prefixData.global) client.commandPrefix = prefixData.prefix
        else {
            const guild = client.guilds.cache.get(prefixData.guild)
            if (!guild) await prefixData.deleteOne()
            else guild.commandPrefix = prefixData.prefix
        }
    }
    console.log('Applied all saved prefixes')

    const allDisabled = await disabled.find({})
    for (const data of allDisabled) {
        const guild = client.guilds.cache.get(data.guild)
        if (!guild) await data.deleteOne()
        else {
            const { commands, groups } = client.registry
            for (var command of data.commands) {
                command = commands.find(cmd => cmd.name === command)
                if (command) command.setEnabledIn(guild, false)
            }
            for (var group of data.groups) {
                group = groups.find(gr => gr.id === group)
                if (group) group.setEnabledIn(guild, false)
            }
        }
    }
    console.log('Disabled saved commands & groups')
})

// Command block handling
client.on('commandBlock',
    /**
     * @param {CommandoMessage} message
     * @param {string} reason
     * @param {object} data
     * @param {number} data.remaining
     * @param {string[]} data.missing
     */
    (message, reason, data) => {
        const { name, userPermissions } = message.command

        const missingPerms = data?.missing?.map(perm => formatPerm(perm, true)).join(', ')
        const cooldown = data?.remaining?.toFixed(0)
        const userPerms = missingPerms || userPermissions?.map(perm => formatPerm(perm, true)).join(', ')

        if (reason === 'guildOnly') return message.say(basicEmbed('red', 'cross', `The \`${name}\` command can only be used on a server channel.`))

        if (reason === 'nsfw') return message.say(basicEmbed('red', 'cross', `The \`${name}\` command can only be used on a NSFW channel.`))

        if (reason === 'permission') {
            if (userPerms) return message.say(basicEmbed('red', 'cross', 'You are missing one of the following permissions:', userPerms))

            return message.say(basicEmbed('red', 'cross', `The \`${name}\` command can only be used by the bot's owner.`))
        }
        if (reason === 'throttling') return message.say(basicEmbed('red', 'cross', `Please wait **${cooldown} seconds** before using the \`${name}\` command again.`))

        if (reason === 'clientPermissions') return message.say(basicEmbed('red', 'cross', 'The bot is missing the following permissions:', missingPerms))
    }
)

/**
 * sends the error message to the bot owner
 * @param {Error} error the error
 * @param {string} type the type of error
 * @param {Command} message the command
 * @param {CommandoMessage} message the message
 */
function ownerErrorHandler(error, type, command, message) {
    const stack = error.stack?.substr(error.message.length + 1)
    const _stack = sliceDots(stack, 1024)

    const messageLink = message ? `Please go to [this message](${message.url}) for more information.` : ''
    const whatCommand = command ? ` at '${command.name}' command` : ''

    const toOwner = new MessageEmbed()
        .setColor('RED')
        .setTitle(type)
        .setDescription(stripIndent`
            ${customEmoji('cross')} **An unexpected error happened**
            ${messageLink}
        `)
        .addField(error.name + whatCommand + ': ' + error.message, '```' + _stack + '```')

    client.owners[0]?.send(toOwner)

    console.log(error.name + whatCommand + ':', error.message)
    console.log(stack)
}

// Command error handling
client.on('commandError', async (command, error, message) => {
    const { tag } = client.owners[0]
    const { invite } = client.options

    const reply = new MessageEmbed()
        .setColor('RED')
        .setDescription(stripIndent`
            ${customEmoji('cross')} **An unexpected error happened**
            Please contact ${tag} or join the [support server](${invite}).
        `)
        .addField(error.name, '```' + error.message + '```')

    await message.say(reply)

    ownerErrorHandler(error, 'Command error', command, message)
})

process.on('unhandledRejection', error => ownerErrorHandler(error, 'Unhandled rejection'))
process.on('uncaughtException', error => ownerErrorHandler(error, 'Uncaught exception'))
process.on('uncaughtExceptionMonitor', error => ownerErrorHandler(error, 'Uncaught exception monitor'))
process.on('warning', error => ownerErrorHandler(error, 'Process warning'))
client.on('error', error => ownerErrorHandler(error, 'Client error'))

client.on('warn', warn => console.log(false, warn))

client.login()