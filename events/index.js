const { CommandoClient } = require('../command-handler/typings')

// Database
const cmdsGroupsData = require('./database/cmds-groups')
const guildsData = require('./database/guilds')
const membersData = require('./database/members')
const prefixesData = require('./database/prefixes')

// Modules
const afk = require('./modules/afk')
const autoPunish = require('./modules/auto-punish')
const chatFilter = require('./modules/chat-filter')
const polls = require('./modules/polls')
const punishments = require('./modules/punishments')
const reactionRoles = require('./modules/reaction-roles')
const reminders = require('./modules/reminders')
const welcome = require('./modules/welcome')

// Logs
const channels = require('./logs/channels')
const commands = require('./logs/commands')
const emojis = require('./logs/emojis')
const invites = require('./logs/invites')
const members = require('./logs/members')
const messages = require('./logs/messages')
const moderation = require('./logs/moderation')
const owner = require('./logs/owner')
const roles = require('./logs/roles')
const server = require('./logs/server')
const voice = require('./logs/voice')

/**
 * Handler function for every module.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    client.emit('debug', 'Loading event handlers...')

    // Database
    await cmdsGroupsData(client)
    await guildsData(client)
    membersData(client)
    await prefixesData(client)

    // Modules
    afk(client)
    // autoPunish(client)
    // chatFilter(client)
    await polls(client)
    // punishments(client)
    await reactionRoles(client)
    await reminders(client)
    welcome(client)

    // Logs
    channels(client)
    commands(client)
    emojis(client)
    invites(client)
    members(client)
    messages(client)
    moderation(client)
    owner(client)
    roles(client)
    server(client)
    voice(client)

    client.emit('debug', 'Loaded all event handlers')
}