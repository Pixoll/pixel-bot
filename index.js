console.log('Starting bot...')
require('./command-handler/extensions')

const CommandoClient = require('./command-handler/client')
const database = require('./database')
const path = require('path')
const notifier = require('./errors/notifier')
const rateLimits = require('./errors/rateLimits')
require('dotenv').config()

// Heroku logs command: heroku logs -a pixel-bot-main -n NUMBER_OF_LINES

const client = new CommandoClient({
    prefix: '!!',
    owner: '667937325002784768',
    testGuild: '790051159099703316',
    serverInvite: 'https://discord.gg/Pc9pAHf3GU',
    inviteOptions: {
        scopes: ['applications.commands', 'bot'],
        permissions: [
            'ADD_REACTIONS', 'ADMINISTRATOR', 'ATTACH_FILES', 'BAN_MEMBERS', 'CHANGE_NICKNAME', 'CREATE_INSTANT_INVITE',
            'EMBED_LINKS', 'KICK_MEMBERS', 'MANAGE_CHANNELS', 'MANAGE_EMOJIS_AND_STICKERS', 'MANAGE_GUILD',
            'MANAGE_MESSAGES', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'MANAGE_THREADS', 'SEND_MESSAGES',
            'SEND_MESSAGES_IN_THREADS', 'USE_APPLICATION_COMMANDS', 'USE_EXTERNAL_EMOJIS', 'USE_PRIVATE_THREADS',
            'USE_PUBLIC_THREADS', 'VIEW_AUDIT_LOG', 'VIEW_CHANNEL'
        ]
    },
    intents: [
        'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILDS', 'GUILD_BANS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_INVITES',
        'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_PRESENCES', 'GUILD_VOICE_STATES'
    ],
    partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION'],
    failIfNotExists: false,

})

client.on('debug', (...msgs) => {
    const msg = msgs.join(' ')
    const exclude =
        /Heartbeat|Registered|WS|Loaded feature|finished for guild|Garbage collection|executing a request/.test(msg)
    if (exclude) return
    console.log('debug >', msg)
})
client.emit('debug', 'Created client')

client.registry
    .registerDefaultTypes()
    .registerGroups([
        { id: 'info', name: '\u2139 Information', guarded: true },
        // { id: 'fun', name: 'Fun commands' },
        { id: 'lists', name: '📋 Listing' },
        { id: 'managing', name: '💼 Managing', guarded: true },
        // { id: 'minecraft', name: '<:minecraft:897178717925834773> Minecraft' },
        { id: 'misc', name: '🎲 Miscellaneous' },
        { id: 'mod', name: ':shield: Moderation' },
        { id: 'mod-logs', name: '🗃 Moderation logs' },
        { id: 'owner', name: '<a:owner_crown:806558872440930425> Owner only', guarded: true },
        { id: 'utility', name: '🛠 Utility', guarded: true },
    ])
client.emit('debug', `Loaded ${client.registry.groups.size} groups`)

client.registry.registerCommandsIn(path.join(__dirname, '/commands'))
client.emit('debug', `Loaded ${client.registry.commands.size} commands`)

client.on('ready', async () => {
    await database(client, 'chat-filter', 'scam-detector')
    notifier(client)
    rateLimits(client)

    client.user.setActivity({
        name: `for ${client.prefix}help`,
        type: 'WATCHING'
    })

    await client.owners[0].send('**Debug message:** Bot is fully online!')
    client.emit('debug', `${client.user.tag} is fully online!`)
})

client.login().then(() =>
    client.emit('debug', 'Logged in')
)
