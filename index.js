console.log('Starting bot...')
require('./command-handler/extensions')

const { CommandoMessage, Command } = require('./command-handler/typings')
const CommandoClient = require('./command-handler/client')
const { MessageEmbed } = require('discord.js')
const { customEmoji, docId, code } = require('./utils')
const { stripIndent } = require('common-tags')
const database = require('./database')
const path = require('path')
require('dotenv').config()

// Heroku logs command: heroku logs -a pixel-bot-main -n NUMBER_OF_LINES

const client = new CommandoClient({
    prefix: '!!',
    owner: '667937325002784768',
    serverInvite: 'https://discord.gg/Pc9pAHf3GU',
    inviteOptions: {
        scopes: ['applications.commands', 'bot'],
        permissions: [
            'ADD_REACTIONS', 'ADMINISTRATOR', 'ATTACH_FILES', 'BAN_MEMBERS', 'CHANGE_NICKNAME', 'CREATE_INSTANT_INVITE',
            'KICK_MEMBERS', 'MANAGE_CHANNELS', 'MANAGE_EMOJIS_AND_STICKERS', 'MANAGE_GUILD', 'MANAGE_MESSAGES',
            'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'MANAGE_THREADS', 'SEND_MESSAGES', 'SEND_MESSAGES_IN_THREADS',
            'USE_APPLICATION_COMMANDS', 'USE_EXTERNAL_EMOJIS', 'USE_PRIVATE_THREADS', 'USE_PUBLIC_THREADS',
            'VIEW_AUDIT_LOG', 'VIEW_CHANNEL'
        ]
    },
    intents: [
        'DIRECT_MESSAGES', 'GUILDS', 'GUILD_BANS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_INVITES', 'GUILD_MEMBERS',
        'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_PRESENCES', 'GUILD_VOICE_STATES'
    ],
    partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION'],
    presence: {
        activities: [{
            name: 'for !help',
            type: 'WATCHING'
        }]
    },
    failIfNotExists: false
})

client.on('debug', msg => {
    const exclude = ['Heartbeat', 'Registered', 'WS', 'Loaded feature', 'for guild']
    for (const word of exclude) if (msg.includes(word)) return
    console.log('debug >', msg)
})
client.emit('debug', 'Created client')
client.on('rateLimit', console.log)

client.registry
    .registerDefaultTypes()
    .registerGroups([
        { id: 'channels', name: '💬 Channels', guarded: true },
        { id: 'info', name: 'ℹ️ Information', guarded: true },
        // { id: 'fun', name: 'Fun commands' },
        { id: 'minecraft', name: '<:minecraft:897178717925834773> Minecraft' },
        { id: 'misc', name: '🎲 Miscellaneous' },
        { id: 'mod', name: '<:ban_hammer:822644311140204554> Moderation' },
        { id: 'mod-logs', name: '🗃 Moderation logs' },
        { id: 'owner', name: '<a:owner_crown:806558872440930425> Owner only', guarded: true },
        { id: 'settings', name: '⚙ Settings', guarded: true },
        { id: 'utility', name: '🛠 Utility', guarded: true },
    ])
    .client.emit('debug', `Loaded ${client.registry.groups.size} groups`)

client.registry
    .registerCommandsIn(path.join(__dirname, '/commands'))
    .client.emit('debug', `Loaded ${client.registry.commands.size} commands`)

client.on('ready', async () => {
    await database(client, 'auto-punish', 'chat-filter')

    await client.owners[0].send('**Debug message:** Bot is fully online!')
    client.emit('debug', `${client.user.tag} is fully online!`)
})
    .on('commandError', async (command, error, message) => {
        await errorHandler(error, 'Command error', message, command)
    })
    .on('error', error => errorHandler(error, 'Client error'))
    .on('warn', warn => errorHandler(warn, 'Client warn'))

process.on('unhandledRejection', error => errorHandler(error, 'Unhandled rejection'))
    .on('uncaughtException', error => errorHandler(error, 'Uncaught exception'))
    .on('uncaughtExceptionMonitor', error => errorHandler(error, 'Uncaught exception monitor'))
    .on('warning', error => errorHandler(error, 'Process warning'))

client.login().then(() =>
    client.emit('debug', 'Logged in')
)

/**
 * sends the error message to the bot owner
 * @param {Error|string} error the error
 * @param {string} type the type of error
 * @param {CommandoMessage} message the message
 * @param {Command} command the command
 */
async function errorHandler(error, type, message, command) {
    const owner = client.owners[0]
    if (error instanceof Error) {
        console.error(error)
        return

        const lentgh = error.name.length + error.message.length + 3
        const stack = error.stack?.substr(lentgh).replace(/ +/g, ' ').split('\n')
        const root = __dirname.split(/[\\/]/g).pop()

        const files = stack.filter(str =>
            !str.includes('node_modules') &&
            !str.includes('(internal') &&
            !str.includes('(<anonymous>)') &&
            !str.includes('eval.js') &&
            str.includes(root)
        ).map(str =>
            '>' + str.replace('at ', '')
                .replace(__dirname, root)
                .replace(/([\\]+)/g, '/')
        ).join('\n')

        const messageLink = message ? `Please go to [this message](${message.url}) for more information.` : ''
        const whatCommand = command ? ` at '${command.name}' command` : ''

        const toOwner = new MessageEmbed()
            .setColor('RED')
            .setTitle(type)
            .setDescription(stripIndent`
                ${customEmoji('cross')} **An unexpected error happened**
                ${messageLink}
            `)
            .addField(error.name + whatCommand + ': ' + error.message, code(files || 'No files.'))

        await owner?.send({ embeds: [toOwner] })

        if (!files) return

        await client.database.errors.add({
            _id: docId(),
            type: type,
            name: error.name,
            message: error.message,
            command: command?.name,
            files: code(files)
        })
    }

    else {
        console.warn(error)

        const toOwner = new MessageEmbed()
            .setColor('RED')
            .setTitle(type)
            .setDescription(error)

        await owner?.send({ embeds: [toOwner] })
    }
}