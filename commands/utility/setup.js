/* eslint-disable no-unused-vars */
const { MessageEmbed, TextChannel, Role } = require('discord.js')
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { basicEmbed, basicCollector, isMod, getArgument, replyAll, isValidRole } = require('../../utils/functions')
const { oneLine, stripIndent } = require('common-tags')
const { SetupSchema } = require('../../schemas/types')
/* eslint-enable no-unused-vars */

/**
 * Creates a default mongo document for {@link SetupSchema}
 * @param {string} guildId The id of the guild the command is being run in
 * @param {'logsChannel'|'memberRole'|'botRole'|'mutedRole'|'lockChannels'} key The key of the value to set
 * @param {*} value The value to set
 */
function defaultDoc(guildId, key, value) {
    /** @type {SetupSchema} */
    const doc = {
        guild: guildId
    }
    doc[key] = value

    return doc
}

const logsOption = {
    type: 'channel',
    channelTypes: ['guild-text'],
    name: 'audit-logs-channel',
    description: 'The channel where to send the audit logs.',
    required: true
}
const mutedOption = {
    type: 'role',
    name: 'muted-role',
    description: 'The role that will be given to muted members.',
    required: true
}
const memberOption = {
    type: 'role',
    name: 'member-role',
    description: 'The role that will be given to a member upon joining.',
    required: true
}
const botOption = {
    type: 'role',
    name: 'bot-role',
    description: 'The role that will be given to a bot upon joining.',
    required: true
}
const lockdownOption = {
    type: 'string',
    name: 'lockdown-channels',
    description: 'The channels for the lockdown command, separated by spaces (max. 30 at once).',
    required: true
}

/** A command that can be run in a client */
module.exports = class SetupCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setup',
            group: 'utility',
            description: 'Setup the bot to its core. Data collected will be deleted if the bot leaves the server.',
            details: stripIndent`
                \`text-channel\` can be either a text channel's name, mention or id.
                \`role\` can be either a role's name, mention or id.
                \`text-channels\` to be all the text channels' names, mentions or ids, separated by spaces (max. 30 at once).
            `,
            format: stripIndent`
                setup <full> - Setup the bot completely to its core.
                setup view - View the current setup data of the server.
                setup reload - Reloads the data of the server.
                setup audit-logs [text-channel] - Setup the audit logs channel.
                setup muted-role [role] - Setup the role for muted members.
                setup member-role [role] - Setup the role given to a member upon joining.
                setup bot-role [role] - Setup the role given to a bot upon joining.
                setup lockdown-channels [text-channels] - Setup all the lockdown channels used in the \`lockdown\` command.
            `,
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true,
            guarded: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: [
                        'view', 'full', 'reload', 'audit-logs', 'muted-role', 'member-role', 'bot-role', 'lockdown-channels'
                    ],
                    default: 'full'
                },
                {
                    key: 'value',
                    prompt: 'Please specify the value to set for that sub-command.',
                    type: ['text-channel', 'role', 'string'],
                    required: false
                }
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'view',
                        description: 'View the current setup data of the server.'
                    },
                    {
                        type: 'subcommand',
                        name: 'full',
                        description: 'Setup the bot completely to its core.',
                        options: [logsOption, mutedOption, memberOption, botOption, lockdownOption]
                    },
                    {
                        type: 'subcommand',
                        name: 'reload',
                        description: 'Reloads the data of the server.'
                    },
                    {
                        type: 'subcommand',
                        name: 'audit-logs',
                        description: 'Setup the audit logs channel.',
                        options: [logsOption]
                    },
                    {
                        type: 'subcommand',
                        name: 'muted-role',
                        description: 'Setup the role for muted members.',
                        options: [mutedOption]
                    },
                    {
                        type: 'subcommand',
                        name: 'member-role',
                        description: 'Setup the role given to a member upon joining.',
                        options: [memberOption]
                    },
                    {
                        type: 'subcommand',
                        name: 'bot-role',
                        description: 'Setup the role given to a bot upon joining.',
                        options: [botOption]
                    },
                    {
                        type: 'subcommand',
                        name: 'lockdown-channels',
                        description: 'Setup all the lockdown channels used in the "lockdown" command.',
                        options: [lockdownOption]
                    }
                ]
            }
        })
    }

    /**
     * @typedef {'view'|'full'|'audit-logs'|'muted-role'|'member-role'|'bot-role'|'lockdown-channels'|'reload'} SubCommand
     */

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {SubCommand} args.subCommand The sub-command to use
     * @param {TextChannel|Role|string} args.value The value to set for that sub-command
     */
    async run({ message, interaction }, {
        subCommand, value, auditLogsChannel, mutedRole, memberRole, botRole, lockdownChannels
    }) {
        subCommand = subCommand.toLowerCase()
        const { guild } = message || interaction
        this.db = guild.database.setup

        const data = await this.db.fetch()
        const fullData = { auditLogsChannel, mutedRole, memberRole, botRole, lockdownChannels }

        switch (subCommand) {
            case 'full':
                return await this.full({ message, interaction }, data, fullData)
            case 'view':
                return await this.view({ message, interaction }, data)
            case 'reload':
                return await this._reload({ message, interaction }, data)
            case 'audit-logs':
                return await this.auditLogs({ message, interaction }, value ?? auditLogsChannel)
            case 'muted-role':
                return await this.mutedRole({ message, interaction }, value ?? mutedRole)
            case 'member-role':
                return await this.memberRole({ message, interaction }, value ?? memberRole)
            case 'bot-role':
                return await this.botRole({ message, interaction }, value ?? botRole)
            case 'lockdown-channels':
                return await this.lockdownChannels({ message, interaction }, data, value ?? lockdownChannels)
        }
    }

    /**
     * The `full` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {SetupSchema} data The setup data
     * @param {object} fullData The full setup data (for "interaction")
     * @param {TextChannel} fullData.auditLogsChannel
     * @param {Role} fullData.mutedRole
     * @param {Role} fullData.memberRole
     * @param {Role} fullData.botRole
     * @param {string} fullData.lockdownChannels
     */
    async full({ message, interaction }, data, fullData) {
        const { guildId, client } = message || interaction
        const { types } = client.registry
        const textChanType = types.get('text-channel')
        const roleType = types.get('role')

        /** @type {TextChannel} */
        let logsChannel = fullData.auditLogsChannel
        /** @type {Role} */
        let mutedRole = fullData.mutedRole
        /** @type {Role} */
        let memberRole = fullData.memberRole
        /** @type {Role} */
        let botRole = fullData.botRole
        /** @type {TextChannel[]} */
        const lockChannels = []

        if (message) {
            let toDelete
            while (!logsChannel || logsChannel.type !== 'GUILD_TEXT') {
                const msg = await basicCollector({ message }, {
                    fieldName: 'In what __text channel__ should I send the audit-logs?'
                }, null, true)
                if (!msg) return
                toDelete = msg
                logsChannel = textChanType.parse(msg.content, message)
            }

            await toDelete?.delete()

            while (!memberRole || isMod(memberRole)) {
                const description = isMod(memberRole) ?
                    'This is considered as a moderation role, please try again with another one.' :
                    `Audit logs will be sent in ${logsChannel}.`

                const msg = await basicCollector({ message }, {
                    description,
                    fieldName: 'What __role__ should I give to a __member__ when they join the server?'
                }, null, true)
                if (!msg) return
                toDelete = msg
                memberRole = roleType.parse(msg.content, message)
            }

            await toDelete?.delete()

            while (!botRole) {
                const msg = await basicCollector({ message }, {
                    description: `The default member role will be ${memberRole}.`,
                    fieldName: 'What __role__ should I give to a __bot__ when they join the server?'
                }, null, true)
                if (!msg) return
                toDelete = msg
                botRole = roleType.parse(msg.content, message)
            }

            await toDelete?.delete()

            while (!mutedRole) {
                const msg = await basicCollector({ message }, {
                    description: `The default bot role will be ${botRole}.`,
                    fieldName: 'What __role__ should I give to a __member__ when they get muted?'
                }, null, true)
                if (!msg) return
                toDelete = msg
                mutedRole = roleType.parse(msg.content, message)
            }

            await toDelete?.delete()

            while (lockChannels.length === 0) {
                const msg = await basicCollector({ message }, {
                    description: `The role given to muted people will be ${mutedRole}.`,
                    fieldName: 'What __text channels__ should I lock when you use the `lockdown` command?'
                }, { time: 2 * 60_000 }, true)
                if (!msg) return
                toDelete = msg
                for (const val of msg.content.split(/ +/)) {
                    if (lockChannels.length === 30) break
                    const chan = textChanType.parse(val, message)
                    if (!chan || lockChannels.includes(chan)) continue
                    lockChannels.push(chan)
                }
            }

            await toDelete?.delete()
        } else {
            const intMsg = await interaction.fetchReply()

            if (!isValidRole(intMsg, mutedRole)) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED',
                    emoji: 'cross',
                    description: 'The chosen muted role is invalid. Please check the role hierarchy.'
                }))
            }
            if (!isValidRole(intMsg, memberRole)) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED',
                    emoji: 'cross',
                    description: 'The chosen default member role is invalid. Please check the role hierarchy.'
                }))
            }
            if (!isValidRole(intMsg, botRole)) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED',
                    emoji: 'cross',
                    description: 'The chosen default bot role is invalid. Please check the role hierarchy.'
                }))
            }

            for (const val of fullData.lockdownChannels.split(/ +/)) {
                if (lockChannels.length === 30) break
                const chan = textChanType.parse(val, intMsg)
                if (!chan || lockChannels.includes(chan)) continue
                lockChannels.push(chan)
            }
            if (lockChannels.length === 0) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED',
                    emoji: 'cross',
                    description: 'None of the lockdown channels you specified were valid. Please try again.'
                }))
            }
        }

        const msg = await basicCollector({ message, interaction }, {
            description: stripIndent`
                **This is all the data I got:**
                Audit logs channel: ${logsChannel}
                Default members role: ${memberRole}
                Default bots role: ${botRole}
                Muted members role: ${mutedRole}
                Lockdown channels: ${lockChannels.map(c => c.toString()).join(', ')}
            `,
            fieldName: 'Is this data correct? If so, type `confirm` to proceed.'
        }, null, true)
        if (!msg) return
        if (msg.content.toLowerCase() !== 'confirm') {
            return await replyAll({ message, interaction }, { content: 'Cancelled command.', embeds: [] })
        }

        const doc = {
            guild: guildId,
            logsChannel: logsChannel.id,
            memberRole: memberRole.id,
            botRole: botRole.id,
            mutedRole: mutedRole.id,
            lockChannels: lockChannels.map(c => c.id)
        }
        if (data) await this.db.update(data, doc)
        else await this.db.add(doc)

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: 'The data for this server has been saved. Use the `view` sub-command if you wish to check it out.'
        }))
    }

    /**
     * The `view` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {SetupSchema} data The setup data
     */
    async view({ message, interaction }, data) {
        if (!data) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup full` command first.'
            }))
        }

        const { guild } = message || interaction

        const logsChannel = data.logsChannel ? `<#${data.logsChannel}>` : null
        const memberRole = data.memberRole ? `<@&${data.memberRole}> (${data.memberRole})` : null
        const botRole = data.botRole ? `<@&${data.botRole}> (${data.botRole})` : null
        const mutedRole = data.mutedRole ? `<@&${data.mutedRole}> (${data.mutedRole})` : null
        const lockdownChannels = data.lockChannels?.map(c => `<#${c}>`).slice(0, 78).join(', ') || null

        const toDisplay = [
            { key: 'Audit logs channel', value: logsChannel },
            { key: 'Default members role', value: memberRole },
            { key: 'Default bots role', value: botRole },
            { key: 'Muted members role', value: mutedRole },
            { key: 'Lockdown channels', value: lockdownChannels },
        ].filter(obj => obj.value).map(obj => `**${obj.key}:** ${obj.value}`)

        if (toDisplay.length === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'There is no saved data for this server yet.'
            }))
        }

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${guild.name}'s setup data`, guild.iconURL({ dynamic: true }))
            .setDescription(toDisplay.join('\n'))
            .setFooter('Missing or wrong data? Try using the "reload" sub-command!')

        await replyAll({ message, interaction }, embed)
    }

    /**
     * The `reload` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {SetupSchema} data The setup data
     */
    async _reload({ message, interaction }, data) {
        if (!data) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED',
                emoji: 'cross',
                fieldName: 'There is no saved data for this server yet.',
                fieldValue: 'Please run the `setup full` command first.'
            }))
        }

        const embed = basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Reloading setup data...'
        })
        const toDelete = await message?.replyEmbed(embed) || await interaction.channel.send({ embeds: [embed] })

        const { guild, guildId } = message || interaction
        const newDoc = { guild: guildId }

        if (data.logsChannel) {
            const logsChannel = await guild.channels.fetch(data.logsChannel).catch(() => null)
            if (logsChannel) newDoc.logsChannel = logsChannel.id
        }

        if (data.memberRole) {
            const memberRole = await guild.roles.fetch(data.memberRole).catch(() => null)
            if (memberRole) newDoc.memberRole = memberRole.id
        }

        if (data.botRole) {
            const botRole = await guild.roles.fetch(data.botRole).catch(() => null)
            if (botRole) newDoc.botRole = botRole.id
        }

        if (data.mutedRole) {
            const mutedRole = await guild.roles.fetch(data.mutedRole).catch(() => null)
            if (mutedRole) newDoc.mutedRole = mutedRole.id
        }

        if (data.lockChannels?.length !== 0) {
            newDoc.lockChannels = []
            for (const chanId of data.lockChannels) {
                const channel = await guild.channels.fetch(chanId).catch(() => null)
                if (channel) newDoc.lockChannels.push(channel.id)
            }
        }

        await this.db.update(data, newDoc)

        await toDelete?.delete().catch(() => null)
        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', description: 'Reloaded data.'
        }))
    }

    /**
     * The `audit-logs` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {TextChannel} channel The channel for the audit logs
     */
    async auditLogs({ message, interaction }, channel) {
        if (message) {
            while (!(channel instanceof TextChannel)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
                if (cancelled) return
                channel = value
            }
        }

        const { guildId } = message || interaction
        await this.db.add(defaultDoc(guildId, 'logsChannel', channel.id))

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: oneLine`
                The new audit logs channel will be ${channel.toString()}.
                Use the \`view\` sub-command if you wish to check it out.
            `
        }))
    }

    /**
     * The `muted-role` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {Role} role The role for the muted members
     */
    async mutedRole({ message, interaction }, role) {
        if (message) {
            while (!(role instanceof Role)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
                if (cancelled) return
                role = value
            }
        }

        const { guildId } = message || interaction
        await this.db.add(defaultDoc(guildId, 'mutedRole', role.id))

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: oneLine`
                The new role for muted members will be ${role.toString()}.
                Use the \`view\` sub-command if you wish to check it out.
            `
        }))
    }

    /**
     * The `member-role` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {Role} role The default role for all members
     */
    async memberRole({ message, interaction }, role) {
        if (message) {
            while (!(role instanceof Role)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
                if (cancelled) return
                role = value
            }
        }

        const { guildId } = message || interaction
        await this.db.add(defaultDoc(guildId, 'memberRole', role.id))

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: oneLine`
                The new default role for all members will be ${role.toString()}.
                Use the \`view\` sub-command if you wish to check it out.
            `
        }))
    }

    /**
     * The `bot-role` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {Role} role The default role for all bots
     */
    async botRole({ message, interaction }, role) {
        if (message) {
            while (!(role instanceof Role)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
                if (cancelled) return
                role = value
            }
        }

        const { guildId } = message || interaction
        await this.db.add(defaultDoc(guildId, 'botRole', role.id))

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            description: oneLine`
                The new default role for all bots will be ${role.toString()}.
                Use the \`view\` sub-command if you wish to check it out.
            `
        }))
    }

    /**
     * The `lockdown-channels` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {SetupSchema} data The setup data
     * @param {string|TextChannel} channelsStr All the lockdown channels for the server
     */
    async lockdownChannels({ message, interaction }, data, channelsStr) {
        if (message) {
            while (channelsStr instanceof Role) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
                if (cancelled) return
                channelsStr = value
            }
        }

        const { client, guildId } = message || interaction
        const { types } = client.registry
        /** @type {TextChannelType} */
        const textChanType = types.get('text-channel')

        const channels = []
        if (typeof channelsStr === 'string') {
            const intMsg = await interaction?.fetchReply()
            for (const val of channelsStr.split(/ +/)) {
                if (channels.length === 30) break
                const chan = textChanType.parse(val, message || intMsg)
                if (chan) channels.push(chan)
            }
        } else {
            channels.push(channelsStr)
        }

        if (message) {
            while (channels.length === 0) {
                const msg = await basicCollector({ message }, {
                    fieldName: 'What __text channels__ should I lock when you use the `lockdown` command?'
                }, { time: 2 * 60_000 }, true)
                if (!msg) return
                for (const val of msg.content.split(/ +/)) {
                    if (channels.length === 30) break
                    const chan = textChanType.parse(val, message)
                    if (chan) channels.push(chan)
                }
            }
        } else {
            if (channels.length === 0) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED',
                    emoji: 'cross',
                    description: 'None of the channels you specified were valid. Please try again.'
                }))
            }
        }

        if (data) await this.db.update(data, { $push: { lockChannels: { $each: channels.map(c => c.id) } } })
        else await this.db.add(defaultDoc(guildId, 'lockChannels', channels.map(c => c.id)))

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', description: oneLine`
                I have saved all the lockdown channels you specified.
                Use the \`view\` sub-command if you wish to check it out.
            `
        }))
    }
}
