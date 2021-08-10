const { CommandoClient } = require('discord.js-commando')

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
const guild = require('./logs/guild')
const invites = require('./logs/invites')
const members = require('./logs/members')
const messages = require('./logs/messages')
const moderation = require('./logs/moderation')
const owner = require('./logs/owner')
const roles = require('./logs/roles')
const voice = require('./logs/voice')

/**
 * Handler function for every module.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    // Modules
    afk(client)
    autoPunish(client)
    chatFilter(client)
    polls(client)
    punishments(client)
    reactionRoles(client)
    reminders(client)
    welcome(client)

    // Logs
    channels(client)
    commands(client)
    emojis(client)
    guild(client)
    invites(client)
    members(client)
    messages(client)
    moderation(client)
    owner(client)
    roles(client)
    voice(client)
}