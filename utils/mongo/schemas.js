const { model, Schema } = require('mongoose')

const active = model('active', Schema({
    _id: String,
    type: String,
    guild: String,
    user: String,
    mod: String,
    reason: String,
    role: String,
    duration: Number
}, { timestamps: true }), 'active')

const afk = model('afk', Schema({
    guild: String,
    user: String,
    status: String
}, { timestamps: true }), 'afk')

const disabled = model('disabled', Schema({
    guild: String,
    commands: Array,
    groups: Array
}), 'disabled')

const faq = model('faq', Schema({
    list: [{
        question: String,
        answer: String
    }]
}), 'faq')

const moderations = model('moderations', Schema({
    _id: String,
    type: String,
    guild: String,
    user: String,
    mod: String,
    reason: String,
    duration: String
}, { timestamps: true }))

const mcIp = model('mc-ips', Schema({
    guild: String,
    type: String,
    ip: String,
    port: Number
}))

const modules = model('modules', Schema({
    guild: String,
    autoMod: Boolean,
    chatFilter: Boolean,
    welcome: Boolean,
    auditLogs: {
        channels: Boolean,
        commands: Boolean,
        emojis: Boolean,
        invites: Boolean,
        members: Boolean,
        messages: Boolean,
        moderation: Boolean,
        roles: Boolean,
        server: Boolean,
        voice: Boolean
    }
}))

const prefixes = model('prefixes', Schema({
    global: Boolean,
    guild: String,
    prefix: String
}))

const polls = model('polls', Schema({
    guild: String,
    channel: String,
    message: String,
    emojis: Array,
    duration: String,
    endsAt: Number
}))

const reactionRoles = model('reaction-roles', Schema({
    guild: String,
    channel: String,
    message: String,
    roles: Array,
    emojis: Array
}))

const reminders = model('reminders', Schema({
    user: String,
    reminder: String,
    remindAt: Number,
    link: String,
    message: String,
    channel: String
}, { timestamps: true }))

const rules = model('rules', Schema({
    guild: String,
    rules: Array
}))

const setup = model('setup', Schema({
    guild: String,
    logsChannel: String,
    memberRole: String,
    botRole: String,
    mutedRole: String,
    lockChannels: Array
}), 'setup')

const stickyRoles = model('sticky-roles', Schema({
    guild: String,
    user: String,
    roles: Array
}))

const todo = model('todo-list', Schema({
    user: String,
    list: Array
}), 'todo-list')

const welcome = model('welcome', Schema({
    guild: String,
    dms: String,
    channel: String,
    message: String
}), 'welcome')

module.exports = {
    active,
    afk,
    disabled,
    faq,
    mcIp,
    moderations,
    modules,
    prefixes,
    polls,
    reactionRoles,
    reminders,
    rules,
    setup,
    stickyRoles,
    todo,
    welcome
}