import { Document } from 'mongoose'

interface BaseSchema extends Document {
    readonly createdAt?: Date
    readonly updatedAt?: Date
}

type TimeBasedModeration = 'mute' | 'temp-ban'

export interface ActiveSchema extends BaseSchema {
    type: TimeBasedModeration | 'temp-role'
    guild: string
    userId: string
    userTag: string
    role: string
    duration: number
}

export interface AfkSchema extends BaseSchema {
    guild: string
    user: string
    status: string
}

export interface DisabledSchema extends BaseSchema {
    guild?: string
    global: boolean
    commands: string[]
    groups: string[]
}

export interface ErrorSchema extends BaseSchema {
    type: string
    name: string
    message: string
    command: string
    files: string
}

export interface FaqSchema extends BaseSchema {
    question: string
    answer: string
}

export interface ModerationSchema extends BaseSchema {
    type: 'warn' | 'ban' | 'kick' | 'soft-ban' | TimeBasedModeration
    guild: string
    userId: string
    userTag: string
    modId: string
    modTag: string
    reason: string
    duration: string
}

export interface McIpSchema extends BaseSchema {
    guild: string
    type: 'java' | 'bedrock'
    ip: string
    port: number
}

export interface ModuleSchema extends BaseSchema {
    guild: string
    // autoMod: boolean
    // chatFilter: boolean
    welcome: boolean
    stickyRoles: boolean
    auditLogs: {
        channels: boolean
        commands: boolean
        emojis: boolean
        invites: boolean
        members: boolean
        messages: boolean
        moderation: boolean
        modules: boolean
        roles: boolean
        server: boolean
        stickers: boolean
        threads: boolean
        users: boolean
        voice: boolean
    }
}

export type Module = 'auto-mod' | 'chat-filter' | 'sticky-roles' | 'welcome' | 'audit-logs'
export type AuditLog = 'channels' | 'commands' | 'emojis' | 'invites' | 'members' | 'messages' |
    'moderation' | 'modules' | 'roles' | 'server' | 'stickers' | 'threads' | 'users' | 'voice'

export interface PrefixSchema extends BaseSchema {
    global: boolean
    guild?: string
    prefix: string
}

export interface PollSchema extends BaseSchema {
    guild: string
    channel: string
    message: string
    emojis: string[]
    duration: string
    endsAt: number
}

export interface ReactionRoleSchema extends BaseSchema {
    guild: string
    channel: string
    message: string
    roles: string[]
    emojis: string[]
}

export interface ReminderSchema extends BaseSchema {
    user: string
    reminder: string
    remindAt: number
    message: string
    msgURL: string
    channel: string
}

export interface RuleSchema extends BaseSchema {
    guild: string
    rules: string[]
}

export interface SetupSchema extends BaseSchema {
    guild: string
    logsChannel: string
    memberRole: string
    botRole: string
    mutedRole: string
    lockChannels: string[]
}

export interface StickyRoleSchema extends BaseSchema {
    guild: string
    user: string
    roles: string[]
}

export interface TodoSchema extends BaseSchema {
    user: string
    list: string[]
}

export interface WelcomeSchema extends BaseSchema {
    guild: string
    channel: string
    message: string
}