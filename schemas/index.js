const { model, Schema } = require('mongoose')

module.exports = {
    active: model('active', Schema({
        _id: String,
        type: String,
        guild: String,
        userId: String,
        userTag: String,
        role: String,
        duration: Number
    }, { timestamps: true }), 'active'),
    afk: model('afk', Schema({
        guild: String,
        user: String,
        status: String
    }, { timestamps: true }), 'afk'),
    disabled: model('disabled', Schema({
        guild: String,
        global: Boolean,
        commands: Array,
        groups: Array
    }), 'disabled'),
    errors: model('errors', Schema({
        _id: String,
        type: String,
        name: String,
        message: String,
        command: String,
        files: String,
    }, { timestamps: true })),
    faq: model('faq', Schema({
        question: String,
        answer: String
    }), 'faq'),
    mcIp: model('mc-ips', Schema({
        guild: String,
        type: String,
        ip: String,
        port: Number
    })),
    moderations: model('moderations', Schema({
        _id: String,
        type: String,
        guild: String,
        userId: String,
        userTag: String,
        modId: String,
        modTag: String,
        reason: String,
        duration: String
    }, { timestamps: true })),
    modules: model('modules', Schema({
        guild: String,
        // autoMod: Boolean,
        // chatFilter: Boolean,
        // scamDetector: Boolean,
        stickyRoles: Boolean,
        welcome: Boolean,
        auditLogs: {
            boosts: Boolean,
            channels: Boolean,
            commands: Boolean,
            emojis: Boolean,
            invites: Boolean,
            members: Boolean,
            messages: Boolean,
            moderation: Boolean,
            modules: Boolean,
            roles: Boolean,
            server: Boolean,
            stickers: Boolean,
            threads: Boolean,
            users: Boolean,
            voice: Boolean
        }
    })),
    prefixes: model('prefixes', Schema({
        global: Boolean,
        guild: String,
        prefix: String
    })),
    polls: model('polls', Schema({
        guild: String,
        channel: String,
        message: String,
        emojis: Array,
        duration: String,
        endsAt: Number
    })),
    reactionRoles: model('reaction-roles', Schema({
        guild: String,
        channel: String,
        message: String,
        roles: Array,
        emojis: Array
    })),
    reminders: model('reminders', Schema({
        user: String,
        reminder: String,
        remindAt: Number,
        message: String,
        msgURL: String,
        channel: String
    }, { timestamps: true })),
    rules: model('rules', Schema({
        guild: String,
        rules: Array
    })),
    setup: model('setup', Schema({
        guild: String,
        logsChannel: String,
        memberRole: String,
        botRole: String,
        mutedRole: String,
        lockChannels: Array
    }), 'setup'),
    stickyRoles: model('sticky-roles', Schema({
        guild: String,
        user: String,
        roles: Array
    })),
    todo: model('todo', Schema({
        user: String,
        list: Array
    }), 'todo'),
    welcome: model('welcome', Schema({
        guild: String,
        channel: String,
        message: String
    }), 'welcome')
}
