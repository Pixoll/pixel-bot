const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { Role, GuildMember, Collection } = require('discord.js')
const { isMod, basicEmbed, roleDetails, memberDetails } = require('../../utils')
const { stripIndent } = require('common-tags')

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
module.exports = class RoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'role',
            group: 'mod',
            description: 'Add or remove roles from a member.',
            details: `${memberDetails()}\n${roleDetails()}\n${roleDetails(null, true)}`,
            format: stripIndent`
                role toggle [member] [roles] - Toggles the roles of a member.
                role removeall [member] - Removes the member's roles.
                role all [role] - Toggles a role on every member and bot.
                role bots [role] - Toggles a role on every bot.
                role members [role] - Toggles a role on every member.
            `,
            examples: [
                'role toggle Pixoll Developer, Moderator',
                'role removeall Pixoll',
                'role all Member',
                'role bots Bots',
                'role members Ping Role'
            ],
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['toggle', 'removeall', 'all', 'bots', 'members']
                },
                {
                    key: 'memberOrRole',
                    label: 'member or role',
                    prompt: 'What role do you want to toggle? or what member are you looking for?',
                    type: ['member', 'role']
                },
                {
                    key: 'roles',
                    prompt: 'What roles do you want to toggle for that member?',
                    type: 'string',
                    validate: async (val, msg, arg) => {
                        const sc = msg.parseArgs().split(/ +/)[0].toLowerCase()
                        if (sc !== 'toggle') return true
                        const type = msg.client.registry.types.get('role')
                        const array = val.split(/\s*,\s*/).slice(0, 30)
                        const valid = []
                        for (const str of array) {
                            const con1 = await type.validate(str, msg, arg)
                            const con2 = validRole(msg, con1 === true ? await type.parse(str, msg) : null)
                            valid.push(con1 && con2)
                        }
                        const wrong = valid.filter(b => b !== true)
                        return wrong[0] === undefined
                    },
                    parse: async (val, msg) => {
                        const type = msg.client.registry.types.get('role')
                        const array = val.split(/\s*,\s*/).slice(0, 30)
                        const valid = []
                        for (const str of array) {
                            valid.push(await type.parse(str, msg))
                        }
                        return valid
                    },
                    required: false,
                    error: 'At least one of the roles you specified was invalid, please try again.'
                }
            ]
        })
    }

    /**
    * @param {CommandoMessage} message The message the command is being run for
    * @param {object} args The arguments for the command
    * @param {'toggle'|'removeall'|'all'|'bots'|'members'} args.subCommand The sub-command
    * @param {Role|GuildMember} args.memberOrRole The role or member
    * @param {Role[]} args.roles The array of roles to toggle from the member
    */
    async run(message, { subCommand, memberOrRole, roles }) {
        subCommand = subCommand.toLowerCase()

        switch (subCommand) {
            case 'toggle':
                return await this.toggle(message, memberOrRole, roles)
            case 'removeall':
                return await this.removeAll(message, memberOrRole)
            case 'all':
                return await this.all(message, memberOrRole)
            case 'bots':
                return await this.bots(message, memberOrRole)
            case 'members':
                return await this.members(message, memberOrRole)
        }
    }

    /**
     * The `all` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Role} role The role to toggle in all members
     */
    async all(message, role) {
        while (!(role instanceof Role) && !validRole(message, role)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            role = value
        }

        /** @type {Collection<string, GuildMember>} */
        const members = await message.guild.members.fetch().catch(() => null)

        for (const [, { roles }] of members) {
            if (roles.cache.has(role.id)) await roles.remove(role)
            else await roles.add(role)
        }

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Toggled the \`${role.name}\` role for all members and bots.`
        }))
    }

    /**
     * The `bots` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Role} role The role to toggle in all bot members
     */
    async bots(message, role) {
        while (!(role instanceof Role)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            role = value
        }

        /** @type {Collection<string, GuildMember>} */
        const members = await message.guild.members.fetch().catch(() => null)
        const bots = members.filter(m => m.user.bot)

        const toEdit = await message.replyEmbed(basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Toggling role in all bots...'
        }))

        for (const [, { roles }] of bots) {
            if (roles.cache.has(role.id)) await roles.remove(role)
            else await roles.add(role)
        }

        await toEdit.edit({
            embeds: [basicEmbed({
                color: 'GREEN', emoji: 'check', description: `Toggled the \`${role.name}\` role for all bots.`
            })]
        })
    }

    /**
     * The `members` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Role} role The role to toggle in all user members
     */
    async members(message, role) {
        while (!(role instanceof Role)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            role = value
        }

        /** @type {Collection<string, GuildMember>} */
        const members = await message.guild.members.fetch().catch(() => null)
        const users = members.filter(m => !m.user.bot)

        const toEdit = await message.replyEmbed(basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Toggling role in all members...'
        }))

        for (const [, { roles }] of users) {
            if (roles.cache.has(role.id)) await roles.remove(role)
            else await roles.add(role)
        }

        await toEdit.edit({
            embeds: [basicEmbed({
                color: 'GREEN', emoji: 'check', description: `Toggled the \`${role.name}\` role for all members.`
            })]
        })
    }

    /**
     * The `removeall` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {GuildMember} member The member to remove the roles from
     */
    async removeAll(message, member) {
        while (!(member instanceof GuildMember)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            member = value
        }

        const { roles, user } = member
        if (roles.cache.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That member has no roles.'
            }))
        }

        const botRole = message.clientMember.roles.highest

        const toEdit = await message.replyEmbed(basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Removing all roles...'
        }))

        const memberRoles = roles.cache.filter(r => {
            if (r.id === message.guildId) return false
            return !r.managed && botRole.comparePositionTo(r) > 0
        })
        for (const [, role] of memberRoles) await roles.remove(role)

        await toEdit.edit({
            embeds: [basicEmbed({
                color: 'GREEN', emoji: 'check',
                description: `Removed every role from ${user.toString()} (${user.tag}).`
            })]
        })
    }

    /**
     * The `toggle` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {GuildMember} member The member to toggle the roles from
     * @param {Role[]} roles The roles to toggle
     */
    async toggle(message, member, roles) {
        while (!(member instanceof GuildMember)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            member = value
        }

        if (!roles) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
            if (cancelled) return
            roles = value
        }

        const { user, roles: _roles } = member

        const alreadyHas = roles.filter(r => _roles.cache.has(r.id))
        const doesntHas = roles.filter(r => !_roles.cache.has(r.id))

        const toEdit = await message.replyEmbed(basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Toggling all roles...'
        }))

        if (alreadyHas.length !== 0) {
            for (const role of alreadyHas) await _roles.remove(role)
        }
        if (doesntHas.length !== 0) {
            for (const role of doesntHas) await _roles.add(role)
        }

        const rolesStr = [...alreadyHas.map(r => '-' + r.name), ...doesntHas.map(r => '+' + r.name)]
            .filter(s => s).join(', ')

        await toEdit.edit({
            embeds: [basicEmbed({
                color: 'GREEN', emoji: 'check', fieldValue: rolesStr,
                fieldName: `Toggled the following roles for ${user.tag}:`
            })]
        })
    }
}