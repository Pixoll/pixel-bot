/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const CommandGroup = require('../../command-handler/commands/group')
const { basicEmbed, getArgument } = require('../../utils')
const { stripIndent } = require('common-tags')
const { CommandoMessage } = require('../../command-handler/typings')
const { DisabledSchema } = require('../../schemas/types')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class ToggleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'toggle',
            group: 'utility',
            description: 'Toggles a command or group on/off.',
            details: '`name` can be either a command\'s name or alias, or a group\'s name.',
            format: stripIndent`
                toggle command [name]
                toggle group [name]
            `,
            examples: [
                'toggle command ban',
                'toggle group moderation'
            ],
            userPermissions: ['ADMINISTRATOR'],
            guarded: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['command', 'group']
                },
                {
                    key: 'cmdOrGroup',
                    label: 'command or group',
                    prompt: 'What command or group would you like to toggle?',
                    type: ['command', 'group'],
                    required: false
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {'command'|'group'} args.subCommand The sub-command to use
     * @param {Command|CommandGroup} args.cmdOrGroup The command or group to toggle
     */
    async run(message, { subCommand, cmdOrGroup }) {
        subCommand = subCommand.toLowerCase()
        const { guildId, guild } = message
        this.db = guild?.database.disabled || this.client.database.disabled

        const data = await this.db.fetch(guildId ? {} : { global: true })

        switch (subCommand) {
            case 'command':
                return await this.command(message, cmdOrGroup, data)
            case 'group':
                return await this._group(message, cmdOrGroup, data)
        }
    }

    /**
     * The `command` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Command} command The command to toggle
     * @param {DisabledSchema} data The disabled commands & groups data
     */
    async command(message, command, data) {
        while (!(command instanceof Command)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            command = value
        }

        const { guildId } = message

        const isEnabled = guildId ? command.isEnabledIn(guildId, true) : command._globalEnabled
        const global = guildId ? '' : ' globally'

        if (guildId) command.setEnabledIn(guildId, !isEnabled)
        else command._globalEnabled = !isEnabled

        if (data) {
            await this.db.update(data, isEnabled ?
                { $push: { commands: command.name } } :
                { $pull: { commands: command.name } }
            )
        } else {
            await this.db.add({
                guild: guildId,
                global: !guildId,
                commands: isEnabled ? [command.name] : [],
                groups: []
            })
        }

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `Toggled the \`${command.name}\` command${global}`,
            fieldValue: `**New status:** ${!isEnabled ? 'Enabled' : 'Disabled'}`
        }))
    }

    /**
     * The `group` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {CommandGroup} group The group to toggle
     * @param {DisabledSchema} data The disabled commands & groups data
     */
    async _group(message, group, data) {
        while (!(group instanceof CommandGroup)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            group = value
        }

        const { guildId } = message

        const isEnabled = guildId ? group.isEnabledIn(guildId) : group._globalEnabled
        const global = guildId ? '' : ' globally'

        if (guildId) group.setEnabledIn(guildId, !isEnabled)
        else group._globalEnabled = !isEnabled

        if (data) {
            await this.db.update(data, isEnabled ?
                { $push: { groups: group.name } } :
                { $pull: { groups: group.name } }
            )
        } else {
            await this.db.add({
                guild: guildId,
                global: !guildId,
                commands: [],
                groups: !isEnabled ? [group.name] : []
            })
        }

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `Toggled the \`${group.name}\` group${global}`,
            fieldValue: `**New status:** ${!isEnabled ? 'Enabled' : 'Disabled'}`
        }))
    }
}