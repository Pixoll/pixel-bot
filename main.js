const { CommandoClient, CommandoMessage, Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const { customEmoji, basicEmbed, formatPerm, docID } = require('./utils/functions')
const { stripIndent } = require('common-tags')
const eventsHandler = require('./utils/events-handler')
const mongo = require('./utils/mongo/mongo')
const path = require('path')
const { errors } = require('./utils/mongo/schemas')
require('dotenv').config()

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
    const { username, tag } = client.user
    console.log(`${username} is online! => Logged in as ${tag}!`)

    await mongo().then(console.log('Connected to MongoDB!'))

    await eventsHandler(client)

    await client.owners[0].send('Debug message: Bot is online.')
})

// Command block handling
client.on('commandBlock',
    /**
     * @param {object} [data]
     * @param {number} [data.remaining]
     * @param {string[]} [data.missing]
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

    await ownerErrorHandler(error, 'Command error', command, message)
})

process.on('unhandledRejection', error => ownerErrorHandler(error, 'Unhandled rejection'))
process.on('uncaughtException', error => ownerErrorHandler(error, 'Uncaught exception'))
process.on('uncaughtExceptionMonitor', error => ownerErrorHandler(error, 'Uncaught exception monitor'))
process.on('warning', error => ownerErrorHandler(error, 'Process warning'))
client.on('error', error => ownerErrorHandler(error, 'Client error'))

client.on('warn', warn => console.log(false, warn))

client.login()

/**
 * sends the error message to the bot owner
 * @param {Error} error the error
 * @param {string} type the type of error
 * @param {Command} command the command
 * @param {CommandoMessage} message the message
 */
async function ownerErrorHandler(error, type, command, message) {
    console.error(error)

    const lentgh = error.name.length + error.message.length + 3
    const stack = error.stack?.substr(lentgh)
    const root = '/' + __dirname.split(/[\\/]/g).pop()

    const files = stack.match(/at ([\w\.]+) \(([^)]+)\)/g)
        .map(str => `> ${str}`
            .replace(/[()]/g, '')
            .replace(__dirname, root)
            .replace(/ (C|\/)/g, ' in$&')
            .replace(/([\\]+)/g, '/')
        )
        .filter(str => !str.includes('node_modules') && !str.includes('internal') && !str.includes('anonymous'))
        .join('\n')

    const messageLink = message ? `Please go to [this message](${message.url}) for more information.` : ''
    const whatCommand = command ? ` at '${command.name}' command` : ''

    const toOwner = new MessageEmbed()
        .setColor('RED')
        .setTitle(type)
        .setDescription(stripIndent`
            ${customEmoji('cross')} **An unexpected error happened**
            ${messageLink}
        `)
        .addField(error.name + whatCommand + ': ' + error.message, '```' + files + '```')

    client.owners[0]?.send(toOwner)

    const doc = {
        _id: docID(),
        type: type,
        name: error.name,
        message: error.message,
        command: command?.name,
        files: '```' + files + '```'
    }

    await new errors(doc).save()
}