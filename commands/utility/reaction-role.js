const Command = require('../../command-handler/commands/base')
const { CommandoMessage, DatabaseManager } = require('../../command-handler/typings')
const { TextChannel, Role, Message } = require('discord.js')
const { basicEmbed, channelDetails, emojiRegex, basicCollector, myMs, isMod } = require('../../utils')
const { stripIndent, oneLine } = require('common-tags')
const { ReactionRoleSchema } = require('../../schemas/types')
const RoleArgumentType = require('../../command-handler/types/role')

/**
 * Validates a {@link Role}
 * @param {CommandoMessage} msg The member to validate
 * @param {Role} role The role to validate
 */
function validRole(msg, role) {
    if (!(role instanceof Role)) return false
    if (!role) return false
    if (role.managed) return false

    const { member, client, author, clientMember } = msg
    const botId = client.user.id

    const botManagable = clientMember.roles.highest.comparePositionTo(role)
    if (botManagable < 1) return false

    const isOwner = author.id === botId
    if (isOwner) return true

    const memberManagable = member.roles.highest.comparePositionTo(role)
    if (memberManagable < 1) return false
    if (isMod(role)) return false

    return true
}

/** A command that can be run in a client */
module.exports = class ReactionRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reactionrole',
            aliases: ['reactrole', 'rrole', 'reaction-role', 'react-role'],
            group: 'utility',
            description: 'Create or remove reaction roles.',
            details: stripIndent`
                ${channelDetails()}
                \`msg id\` has to be a message's id that's in the **same channel** that you specified.
            `,
            format: stripIndent`
                reactrole create [channel] [msg id] - Create reaction roles.
                reactrole remove [channel] [msg id] - Remove reaction roles.
            `,
            examples: [
                'reactrole create #reaction-roles 826935004936142918',
                'reactrole remove #self-roles 826935004936142918'
            ],
            clientPermissions: ['ADD_REACTIONS'],
            userPermissions: ['MANAGE_ROLES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'Do you want to create or remove the reaction roles?',
                    type: 'string',
                    oneOf: ['create', 'remove']
                },
                {
                    key: 'channel',
                    prompt: 'On what channel do you want to create or remove the reaction roles?',
                    type: 'text-channel'
                },
                {
                    key: 'msgId',
                    label: 'message id',
                    prompt: 'On what message do you want to create or remove the reaction roles?',
                    type: 'string'
                }
            ]
        })

        /** @type {DatabaseManager<ReactionRoleSchema>} */
        this.db = null
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {'create'|'remove'} args.subCommand The sub-command to use
     * @param {TextChannel} args.channel The text channel of the reaction messages
     * @param {string} args.msgId The message of the reaction messages
     */
    async run(message, { subCommand, channel, msgId }) {
        subCommand = subCommand.toLowerCase()

        let msg = await channel.messages.fetch(msgId)
        while (!(msg instanceof Message)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            msg = await channel.messages.fetch(value)
        }

        this.db = message.guild.database.reactionRoles
        const data = await this.db.fetch({ channel: channel.id, message: msg.id })

        switch (subCommand) {
            case 'create':
                return await this.create(message, channel, msg, data)
            case 'remove':
                return await this.remove(message, msg, data)
        }
    }

    /**
     * The `create` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {TextChannel} channel The text channel of the reaction roles to create
     * @param {Message} msg The message of the reaction roles to create
     * @param {ReactionRoleSchema} data The data of the reaction roles
     */
    async create(message, channel, msg, data) {
        const { client, guildId } = message
        /** @type {RoleArgumentType} */
        const roleType = client.registry.types.get('role')

        const roles = []
        while (roles.length === 0) {
            const rolesMsg = await basicCollector(message, {
                fieldName: 'What are the roles that you want to assign? Please send them separated by commas (max. 30 at once).'
            }, { time: myMs('2m') })
            if (!rolesMsg) return

            for (const str of rolesMsg.content.split(/\s*,\s*/).slice(0, 30)) {
                const con1 = roleType.validate(str, message)
                const con2 = validRole(message, con1 === true ? roleType.parse(str, message) : null)
                if (!con1 && !con2) continue

                const role = roleType.parse(str, message)
                roles.push(role)
            }
        }

        const allEmojis = client.emojis.cache
        const emojis = []
        while (roles.length !== emojis.length) {
            const emojisMsg = await basicCollector(message, {
                fieldName: oneLine`
                    Now, what emojis should the bot react with in the message?
                    These will be applied to the roles you specified in the same exact order.
                `
            }, { time: myMs('2m') })
            if (!emojisMsg) return

            const match = emojisMsg.content.match(emojiRegex)?.map(e => e).filter(e => e) || []
            for (const emoji of match) {
                if (roles.length === emojis.length) break
                if (emojis.includes(emoji)) continue

                if (!Number.parseInt(emoji)) emojis.push(emoji)
                if (allEmojis.get(emoji)) emojis.push(emoji)
            }
        }

        for (const emoji of emojis) await msg.react(emoji)

        await this.db.add({
            guild: guildId,
            channel: channel.id,
            message: msg.id,
            roles: roles.map(r => r.id),
            emojis: emojis
        })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            description: `The reaction roles were successfully created at [this message](${msg.url}).`
        }))
    }

    /**
     * The `remove` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Message} msg The message of the reaction roles to remove
     * @param {ReactionRoleSchema} data The data of the reaction roles
     */
    async remove(message, { url }, data) {
        if (!data) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'I couldn\'t find the reaction roles you were looking for.'
            }))
        }

        await data.deleteOne()

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            description: `The reaction roles of [this message](${url}) were successfully removed.`
        }))
    }
}