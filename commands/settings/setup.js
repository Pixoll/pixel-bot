const { MessageEmbed, TextChannel, Role } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { channelDetails, roleDetails, embedColor, basicEmbed, basicCollector, myMs, isMod, getArgument } = require('../../utils')
const { oneLine, stripIndent } = require('common-tags')
const { SetupSchema } = require('../../schemas/types')
const TextChannelType = require('../../command-handler/types/text-channel')
const RoleType = require('../../command-handler/types/role')

/**
 * Creates a default mongo document for {@link SetupSchema}
 * @param {string} guildId The id of the guild the command is being run in
 * @param {'logsChannel'|'memberRole'|'botRole'|'mutedRole'|'lockChannels'} key The key of the value to set
 * @param {*} value The value to set
 */
function defaultDoc(guildId, key, value) {
    /** @type {SetupSchema} */
    const doc = {
        guild: guildId,
        logsChannel: undefined,
        memberRole: undefined,
        botRole: undefined,
        mutedRole: undefined,
        lockChannels: [],
    }

    doc[key] = value

    return doc
}

/** A command that can be run in a client */
module.exports = class SetupCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'setup',
            group: 'settings',
            description: oneLine`
                Setup the bot to it\'s core. The data collected from this command is never deleted,
                so you don\'t have to worry about doing this twice if I ever leave the server and rejoin.
            `,
            details: `${channelDetails('text-channel')}\n${roleDetails()}\n${channelDetails('text-channels', true)}`,
            format: stripIndent`
                setup <view> - View the current setup data of the server.
                setup full - Setup the bot completely.
                setup audit-logs [text-channel] - Setup the audit logs channel.
                setup muted-role [role] - Setup the role for muted people.
                setup member-role [role] - Setup the role given to all members upon joining.
                setup bot-role [role] - Setup the role given to all bots upon joining.
                setup lockdown-channels [text-channels] - Setup all the lockdown channels used in the \`lockdown\` command.
            `,
            userPermissions: ['ADMINISTRATOR'],
            throttling: { usages: 3, duration: 60 },
            guildOnly: true,
            guarded: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['view', 'full', 'audit-logs', 'muted-role', 'member-role', 'bot-role', 'lockdown-channels'],
                    default: 'view'
                },
                {
                    key: 'value',
                    prompt: 'Please specify the value to set for that sub-command.',
                    type: ['text-channel', 'role', 'string'],
                    required: false
                }
            ]
        })
    }

    /**
     * @typedef {'view'|'full'|'audit-logs'|'muted-role'|'member-role'|'bot-role'|'lockdown-channels'} SubCommand
     */

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {SubCommand} args.subCommand The sub-command to use
     * @param {TextChannel|Role|string} args.value The value to set for that sub-command
     */
    async run(message, { subCommand, value }) {
        subCommand = subCommand.toLowerCase()
        const { guild } = message
        this.db = guild.database.setup

        const data = await this.db.fetch()

        switch (subCommand) {
            case 'view':
                return await this.view(message, data)
            case 'full':
                return await this.full(message, data)
            case 'audit-logs':
                return await this.auditLogs(message, value)
            case 'muted-role':
                return await this.mutedRole(message, value)
            case 'member-role':
                return await this.memberRole(message, value)
            case 'bot-role':
                return await this.botRole(message, value)
            case 'lockdown-channels':
                return await this.lockdownChannels(message, data, value)
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {SetupSchema} data The setup data
     */
    async view(message, data) {
        if (!data) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'There is no saved data for this server yet.'
            }))
        }

        const { guild } = message
        const { roles, channels } = guild

        const logsChannel = channels.resolve(data.logsChannel)
        const memberRole = await roles.fetch(data.memberRole)
        const botRole = await roles.fetch(data.botRole)
        const mutedRole = await roles.fetch(data.mutedRole)
        const lockdownChannels = data.lockChannels.map(c => channels.resolve(c)?.toString())
            .slice(0, 78).filter(c => c)

        const toDisplay = [
            { key: 'Audit logs channel', value: logsChannel?.toString() || null },
            { key: 'Default members role', value: memberRole?.name || null },
            { key: 'Default bots role', value: botRole?.name || null },
            { key: 'Muted members role', value: mutedRole?.name || null },
            { key: 'Lockdown channels', value: lockdownChannels.join(', ') || null },
        ].filter(obj => obj.value).map(obj => `**${obj.key}:** ${obj.value}`)

        if (toDisplay.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'There is no saved data for this server yet.'
            }))
        }

        const embed = new MessageEmbed()
            .setColor(embedColor)
            .setAuthor(`${guild.name}'s setup data`, guild.iconURL({ dynamic: true }))
            .setDescription(toDisplay.join('\n'))

        await message.replyEmbed(embed)
    }

    /**
     * The `full` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {SetupSchema} data The setup data
     */
    async full(message, data) {
        const { guildId, client } = message
        const { types } = client.registry
        /** @type {TextChannelType} */
        const textChanType = types.get('text-channel')
        /** @type {RoleType} */
        const roleType = types.get('role')
        let toDelete

        let logsChannel
        while (!logsChannel || logsChannel.type !== 'GUILD_TEXT') {
            const msg = await basicCollector(message, {
                fieldName: 'In what __text channel__ should I send the audit-logs?'
            }, null, true)
            if (!msg) return
            toDelete = msg
            logsChannel = textChanType.parse(msg.content, message)
        }

        await toDelete.delete()

        let memberRole
        while (!memberRole || isMod(memberRole)) {
            const description = isMod(memberRole) ?
                'This is considered as a moderation role, please try again with another one.' :
                `Audit logs will be sent in ${logsChannel}.`

            const msg = await basicCollector(message, {
                description,
                fieldName: 'What __role__ should I give to a __member__ when they join the server?'
            }, null, true)
            if (!msg) return
            toDelete = msg
            memberRole = roleType.parse(msg.content, message)
        }

        await toDelete.delete()

        let botRole
        while (!botRole) {
            const msg = await basicCollector(message, {
                description: `The default member role will be ${memberRole}.`,
                fieldName: 'What __role__ should I give to a __bot__ when they join the server?'
            }, null, true)
            if (!msg) return
            toDelete = msg
            botRole = roleType.parse(msg.content, message)
        }

        await toDelete.delete()

        let mutedRole
        while (!mutedRole) {
            const msg = await basicCollector(message, {
                description: `The default bot role will be ${botRole}.`,
                fieldName: 'What __role__ should I give to a __member__ when they get muted?'
            }, null, true)
            if (!msg) return
            toDelete = msg
            mutedRole = roleType.parse(msg.content, message)
        }

        await toDelete.delete()

        const lockChannels = []
        while (lockChannels.length === 0) {
            const msg = await basicCollector(message, {
                description: `The role given to muted people will be ${mutedRole}.`,
                fieldName: 'What __text channels__ should I lock when you use the `lockdown` command?'
            }, { time: myMs('2m') }, true)
            if (!msg) return
            toDelete = msg
            for (const val of msg.content.split(/ +/)) {
                if (lockChannels.length === 30) break
                const chan = textChanType.parse(val, message)
                if (chan) lockChannels.push(chan)
            }
        }

        await toDelete.delete()

        const msg = await basicCollector(message, {
            description: stripIndent`
                This is all the data I got:
                **>** **Audit logs channel:** ${logsChannel}
                **>** **Default members role:** ${memberRole}
                **>** **Default bots role:** ${botRole}
                **>** **Muted members role:** ${mutedRole}
                **>** **Lockdown channels:** ${lockChannels.map(c => c.toString()).join(', ')}
            `,
            fieldName: 'Is this data correct? If so, type `confirm` to proceed.'
        }, null, true)
        if (!msg) return
        if (msg.content.toLowerCase() !== 'confirm') {
            return await message.reply('Cancelled command.')
        }

        await this.db.add({
            guild: guildId,
            logsChannel: logsChannel.id,
            memberRole: memberRole.id,
            botRole: botRole.id,
            mutedRole: mutedRole.id,
            lockChannels: lockChannels.map(c => c.id)
        })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            description: 'The data for this server has been saved. Use the `view` sub-command if you wish to check it out.'
        }))
    }

    /**
     * The `audit-logs` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {TextChannel} channel The channel for the audit logs
     */
    async auditLogs(message, channel) {
        while (!(channel instanceof TextChannel)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            channel = value
        }

        await this.db.add(defaultDoc(message.guildId, 'logsChannel', channel.id))

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: oneLine`
                The new audit logs channel will be ${channel.toString()}.
                Use the \`view\` sub-command if you wish to check it out.
            `
        }))
    }

    /**
     * The `muted-role` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Role} role The role for the muted members
     */
    async mutedRole(message, role) {
        while (!(role instanceof Role)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            role = value
        }

        await this.db.add(defaultDoc(message.guildId, 'mutedRole', role.id))

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: oneLine`
                The new role for muted members will be ${role.toString()}.
                Use the \`view\` sub-command if you wish to check it out.
            `
        }))
    }

    /**
     * The `member-role` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Role} role The default role for all members
     */
    async memberRole(message, role) {
        while (!(role instanceof Role)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            role = value
        }

        await this.db.add(defaultDoc(message.guildId, 'memberRole', role.id))

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: oneLine`
                The new default role for all members will be ${role.toString()}.
                Use the \`view\` sub-command if you wish to check it out.
            `
        }))
    }

    /**
     * The `bot-role` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Role} role The default role for all bots
     */
    async botRole(message, role) {
        while (!(role instanceof Role)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            role = value
        }

        await this.db.add(defaultDoc(message.guildId, 'botRole', role.id))

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: oneLine`
                The new default role for all bots will be ${role.toString()}.
                Use the \`view\` sub-command if you wish to check it out.
            `
        }))
    }

    /**
     * The `lockdown-channels` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {SetupSchema} data The setup data
     * @param {string|TextChannel} channelsStr All the lockdown channels for the server
     */
    async lockdownChannels(message, data, channelsStr) {
        while (channelsStr instanceof Role) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            channelsStr = value
        }

        const { client } = message
        const { types } = client.registry
        /** @type {TextChannelType} */
        const textChanType = types.get('text-channel')

        const channels = []
        if (typeof channelsStr === 'string') {
            for (const val of channelsStr.split(/ +/)) {
                if (channels.length === 30) break
                const chan = textChanType.parse(val, message)
                if (chan) channels.push(chan)
            }
        } else {
            channels.push(channelsStr)
        }

        while (channels.length === 0) {
            const msg = await basicCollector(message, {
                fieldName: 'What __text channels__ should I lock when you use the `lockdown` command?'
            }, { time: myMs('2m') }, true)
            if (!msg) return
            for (const val of msg.content.split(/ +/)) {
                if (channels.length === 30) break
                const chan = textChanType.parse(val, message)
                if (chan) channels.push(chan)
            }
        }

        if (data) await this.db.update(data, { $push: { lockChannels: { $each: channels.map(c => c.id) } } })
        else await this.db.add(defaultDoc(message.guildId, 'lockChannels', channels.map(c => c.id)))

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: oneLine`
                I have saved all the lockdown channels you specified.
                Use the \`view\` sub-command if you wish to check it out.
            `
        }))
    }
}