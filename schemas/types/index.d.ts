// import { Document } from 'mongoose'

/**
 * A {@link https://developer.twitter.com/en/docs/twitter-ids Twitter snowflake},
 * except the epoch is 2015-01-01T00:00:00.000Z.
 *
 * If we have a snowflake '266241948824764416' we can represent it as binary:
 * ```
 * 64                                          22     17     12          0
 *  000000111011000111100001101001000101000000  00001  00000  000000000000
 *       number of ms since Discord epoch       worker  pid    increment
 * ```
 */
type Snowflake = string

interface BaseSchema { // extends Document
    readonly _id: string
    readonly createdAt?: Date
    readonly updatedAt?: Date
}

type TimeBasedModeration = 'mute' | 'temp-ban'

export interface ActiveSchema extends BaseSchema {
    type: TimeBasedModeration | 'temp-role'
    guild: Snowflake
    userId: Snowflake
    userTag: string
    role: Snowflake
    duration: number
}

export interface AfkSchema extends BaseSchema {
    guild: Snowflake
    user: Snowflake
    status: string
}

export interface DisabledSchema extends BaseSchema {
    guild?: Snowflake
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
    guild: Snowflake
    userId: Snowflake
    userTag: string
    modId: Snowflake
    modTag: string
    reason: string
    duration: string
}

export interface McIpSchema extends BaseSchema {
    guild: Snowflake
    type: 'java' | 'bedrock'
    ip: string
    port: number
}

export interface ModuleSchema extends BaseSchema {
    guild: Snowflake
    // autoMod: boolean
    // chatFilter: boolean
    welcome: boolean
    stickyRoles: boolean
    auditLogs: {
        boosts: boolean
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
export type AuditLog = 'boosts' | 'channels' | 'commands' | 'emojis' | 'invites' | 'members' | 'messages' |
    'moderation' | 'modules' | 'roles' | 'server' | 'stickers' | 'threads' | 'users' | 'voice'

export interface PrefixSchema extends BaseSchema {
    global: boolean
    guild?: Snowflake
    prefix: string
}

export interface PollSchema extends BaseSchema {
    guild: Snowflake
    channel: Snowflake
    message: Snowflake
    emojis: (string | Snowflake)[]
    duration: string
    endsAt: number
}

export interface ReactionRoleSchema extends BaseSchema {
    guild: Snowflake
    channel: Snowflake
    message: Snowflake
    roles: Snowflake[]
    emojis: (string | Snowflake)[]
}

export interface ReminderSchema extends BaseSchema {
    user: Snowflake
    reminder: string
    remindAt: number
    message: Snowflake
    msgURL: string
    channel: Snowflake
}

export interface RuleSchema extends BaseSchema {
    guild: Snowflake
    rules: string[]
}

export interface SetupSchema extends BaseSchema {
    guild: Snowflake
    logsChannel: Snowflake
    memberRole: Snowflake
    botRole: Snowflake
    mutedRole: Snowflake
    lockChannels: Snowflake[]
}

export interface StickyRoleSchema extends BaseSchema {
    guild: Snowflake
    user: Snowflake
    roles: Snowflake[]
}

export interface TodoSchema extends BaseSchema {
    user: Snowflake
    list: string[]
}

export interface WelcomeSchema extends BaseSchema {
    guild: Snowflake
    channel: Snowflake
    message: string
}
