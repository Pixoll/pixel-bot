/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { Role, GuildMember, Collection } = require('discord.js')
const {
    basicEmbed, roleDetails, memberDetails, isValidRole, removeDuplicated, getArgument, replyAll, confirmButtons
} = require('../../utils')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class RoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'role',
            group: 'mod',
            description: 'Add or remove roles from a member.',
            details: `${memberDetails()}\n${roleDetails()}\n${roleDetails(null, true)}`,
            format: stripIndent`
                role toggle [member] [roles] - Toggles the roles of a member (max. 10 at once).
                role remove-all [member] - Removes the member's roles.
                role all [role] - Toggles a role on every user and bot.
                role bots [role] - Toggles a role on every bot.
                role users [role] - Toggles a role on every user.
            `,
            examples: [
                'role toggle Pixoll Developer, Moderator',
                'role remove-all Pixoll',
                'role all Member',
                'role bots Bots',
                'role users Ping Role'
            ],
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['toggle', 'remove-all', 'all', 'bots', 'users']
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
                        if (typeof msg.parseArgs === 'function') {
                            const sc = msg.parseArgs().split(/ +/)[0].toLowerCase()
                            if (sc !== 'toggle') return true
                        }
                        const type = msg.client.registry.types.get('role')
                        const array = val.split(/\s*,\s*/).slice(0, 10)
                        const valid = []
                        for (const str of array) {
                            const con1 = await type.validate(str, msg, arg)
                            if (!con1) valid.push(false)
                            const con2 = isValidRole(msg, await type.parse(str, msg))
                            valid.push(con2)
                        }
                        return valid.filter(b => b !== true).length !== array.length
                    },
                    parse: async (val, msg, arg) => {
                        if (typeof msg.parseArgs === 'function') {
                            const sc = msg.parseArgs().split(/ +/)[0].toLowerCase()
                            if (sc !== 'toggle') return null
                        }
                        const type = msg.client.registry.types.get('role')
                        const array = val.split(/\s*,\s*/).slice(0, 10)
                        const valid = []
                        for (const str of array) {
                            const con1 = await type.validate(str, msg, arg)
                            if (!con1) continue
                            const role = await type.parse(str, msg)
                            const con2 = isValidRole(msg, role)
                            if (!con2) continue
                            valid.push(role)
                        }
                        return removeDuplicated(valid)
                    },
                    required: false,
                    error: 'None of the roles you specified were valid. Please try again.'
                }
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'toggle',
                        description: 'Toggles the roles of a member.',
                        options: [
                            {
                                type: 'user',
                                name: 'member',
                                description: 'The targeted member.',
                                required: true
                            },
                            {
                                type: 'string',
                                name: 'roles',
                                description: 'The roles to toggle, separated by commas (max. 10 at once).',
                                required: true
                            }
                        ]
                    },
                    {
                        type: 'subcommand',
                        name: 'remove-all',
                        description: 'Removes the member\'s roles.',
                        options: [{
                            type: 'user',
                            name: 'member',
                            description: 'The targeted member.',
                            required: true
                        }]
                    },
                    {
                        type: 'subcommand',
                        name: 'all',
                        description: 'Toggles a role on every user and bot.',
                        options: [{
                            type: 'role',
                            name: 'role',
                            description: 'The role to toggle.',
                            required: true
                        }]
                    },
                    {
                        type: 'subcommand',
                        name: 'bots',
                        description: 'Toggles a role on every bot.',
                        options: [{
                            type: 'role',
                            name: 'role',
                            description: 'The role to toggle.',
                            required: true
                        }]
                    },
                    {
                        type: 'subcommand',
                        name: 'users',
                        description: 'Toggles a role on every user.',
                        options: [{
                            type: 'role',
                            name: 'role',
                            description: 'The role to toggle.',
                            required: true
                        }]
                    },
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'toggle'|'remove-all'|'all'|'bots'|'users'} args.subCommand The sub-command
     * @param {Role|GuildMember} args.memberOrRole The role or member
     * @param {Role[]} args.roles The array of roles to toggle from the member
     */
    async run({ message, interaction }, { subCommand, memberOrRole, roles, member, role }) {
        subCommand = subCommand.toLowerCase()

        if (interaction) {
            if (member && !(member instanceof GuildMember)) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'That is not a valid member in this server.'
                }))
            }
            memberOrRole = member ?? role
            if (roles) {
                const arg = this.argsCollector.args[2]
                const msg = await interaction.fetchReply()
                const isValid = await arg.validate(roles, msg)
                if (isValid !== true) {
                    return await replyAll({ interaction }, basicEmbed({
                        color: 'RED', emoji: 'cross', description: arg.error
                    }))
                }
                roles = await arg.parse(roles, msg)
            }
        }

        switch (subCommand) {
            case 'toggle':
                return await this.toggle({ message, interaction }, memberOrRole, roles)
            case 'remove-all':
                return await this.removeAll({ message, interaction }, memberOrRole)
            case 'all':
                return await this.all({ message, interaction }, memberOrRole)
            case 'bots':
                return await this.bots({ message, interaction }, memberOrRole)
            case 'users':
                return await this.users({ message, interaction }, memberOrRole)
        }
    }

    /**
     * The `all` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {Role} role The role to toggle in all members
     */
    async all({ message, interaction }, role) {
        if (message) {
            while (!(role instanceof Role)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
                if (cancelled) return
                role = value
            }
        } else {
            const intMsg = await interaction.fetchReply()
            if (!isValidRole(intMsg, role)) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED',
                    emoji: 'cross',
                    description: 'The chosen role is invalid. Please check the role hierarchy.'
                }))
            }
        }

        const confirmed = await confirmButtons({ message, interaction },
            `toggle the ${role.name} role in all members and bots`
        )
        if (!confirmed) return

        /** @type {Collection<string, GuildMember>} */
        const members = await (message || interaction).guild.members.fetch().catch(() => null)

        const embed = basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Toggling role in all members and bots... Please be patient.'
        })
        const toDelete = await message?.replyEmbed(embed) || await interaction.channel.send({ embeds: [embed] })

        for (const [, { roles }] of members) {
            if (roles.cache.has(role.id)) await roles.remove(role)
            else await roles.add(role)
        }

        await toDelete?.delete().catch(() => null)
        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Toggled the \`${role.name}\` role for all members and bots.`
        }))
    }

    /**
     * The `bots` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {Role} role The role to toggle in all bot members
     */
    async bots({ message, interaction }, role) {
        if (message) {
            while (!(role instanceof Role)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
                if (cancelled) return
                role = value
            }
        } else {
            const intMsg = await interaction.fetchReply()
            if (!isValidRole(intMsg, role)) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED',
                    emoji: 'cross',
                    description: 'The chosen role is invalid. Please check the role hierarchy.'
                }))
            }
        }

        const confirmed = await confirmButtons({ message, interaction }, `toggle the ${role.name} role in all bots`)
        if (!confirmed) return

        /** @type {Collection<string, GuildMember>} */
        const members = await (message || interaction).guild.members.fetch().catch(() => null)
        const bots = members.filter(m => m.user.bot)

        const embed = basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Toggling role in all bots... Please be patient.'
        })
        const toDelete = await message?.replyEmbed(embed) || await interaction.channel.send({ embeds: [embed] })

        for (const [, { roles }] of bots) {
            if (roles.cache.has(role.id)) await roles.remove(role)
            else await roles.add(role)
        }

        await toDelete?.delete().catch(() => null)
        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Toggled the \`${role.name}\` role for all bots.`
        }))
    }

    /**
     * The `members` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {Role} role The role to toggle in all user members
     */
    async users({ message, interaction }, role) {
        if (message) {
            while (!(role instanceof Role)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
                if (cancelled) return
                role = value
            }
        } else {
            const intMsg = await interaction.fetchReply()
            if (!isValidRole(intMsg, role)) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED',
                    emoji: 'cross',
                    description: 'The chosen role is invalid. Please check the role hierarchy.'
                }))
            }
        }

        const confirmed = await confirmButtons({ message, interaction }, `toggle the ${role.name} role in all users`)
        if (!confirmed) return

        /** @type {Collection<string, GuildMember>} */
        const members = await (message || interaction).guild.members.fetch().catch(() => null)
        const users = members.filter(m => !m.user.bot)

        const embed = basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Toggling role in all members... Please be patient.'
        })
        const toDelete = await message?.replyEmbed(embed) || await interaction.channel.send({ embeds: [embed] })

        for (const [, { roles }] of users) {
            if (roles.cache.has(role.id)) await roles.remove(role)
            else await roles.add(role)
        }

        await toDelete?.delete().catch(() => null)
        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Toggled the \`${role.name}\` role for all members.`
        }))
    }

    /**
     * The `removeall` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {GuildMember} member The member to remove the roles from
     */
    async removeAll({ message, interaction }, member) {
        if (message) {
            while (!(member instanceof GuildMember)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
                if (cancelled) return
                member = value
            }
        }

        const { roles, user } = member
        if (roles.cache.size === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That member has no roles.'
            }))
        }

        const confirmed = await confirmButtons({ message, interaction }, `remove all roles from ${member.toString()}`)
        if (!confirmed) return

        const embed = basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Removing all roles... Please be patient.'
        })
        const toDelete = await message?.replyEmbed(embed) || await interaction.channel.send({ embeds: [embed] })

        const intMsg = await interaction?.fetchReply()
        const memberRoles = roles.cache.filter(r => isValidRole(intMsg || message, r)).toJSON()
        for (const role of memberRoles) await roles.remove(role)

        await toDelete?.delete().catch(() => null)
        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Removed every role from ${user.toString()} (${user.tag}).`
        }))
    }

    /**
     * The `toggle` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {GuildMember} member The member to toggle the roles from
     * @param {Role[]} roles The roles to toggle
     */
    async toggle({ message, interaction }, member, roles) {
        if (message) {
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
        }

        const memberRoles = member.roles

        const alreadyHas = roles.filter(r => memberRoles.cache.has(r.id))
        const doesntHas = roles.filter(r => !memberRoles.cache.has(r.id))

        const embed = basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Toggling the roles... Please be patient.'
        })
        const toDelete = await message?.replyEmbed(embed) || await interaction.channel.send({ embeds: [embed] })

        if (alreadyHas.length !== 0) {
            for (const role of alreadyHas) await memberRoles.remove(role)
        }
        if (doesntHas.length !== 0) {
            for (const role of doesntHas) await memberRoles.add(role)
        }

        const rolesStr = [...alreadyHas.map(r => '-' + r.name), ...doesntHas.map(r => '+' + r.name)]
            .filter(s => s).join(', ')

        await toDelete?.delete().catch(() => null)
        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldValue: rolesStr,
            fieldName: `Toggled the following roles for ${member.user.tag}:`
        }))
    }
}