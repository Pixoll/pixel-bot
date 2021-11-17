/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { MessageEmbed, GuildChannel } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const CommandGroup = require('../../command-handler/commands/group')
const { CommandoMessage } = require('../../command-handler/typings')
const { permissions } = require('../../command-handler/util')
const { getArgument } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class DiagnoseCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'diagnose',
            group: 'utility',
            description: 'Diagnose any command or group to determine if they are disabled or not.',
            details: '`name` can be either a command\'s name or alias, or a group\'s name.',
            format: stripIndent`
                diagnose <all> - Check the status of all commands and groups.
                diagnose command [name] - Check the status of a single command.
                diagnose group [name] - Check the status of a single group.
            `,
            examples: [
                'diagnose command ban',
                'diagnose group moderation'
            ],
            userPermissions: ['ADMINISTRATOR'],
            guarded: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['all', 'command', 'group'],
                    default: 'all'
                },
                {
                    key: 'cmdOrGroup',
                    label: 'command or group',
                    prompt: 'What command or group would you like to diagnose?',
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
     * @param {'all'|'command'|'group'} args.subCommand The sub-command to use
     * @param {Command|CommandGroup} args.cmdOrGroup The command or group to diagnose
     */
    async run(message, { subCommand, cmdOrGroup }) {
        subCommand = subCommand.toLowerCase()

        switch (subCommand) {
            case 'all':
                return await this.all(message)
            case 'command':
                return await this.command(message, cmdOrGroup)
            case 'group':
                return await this._group(message, cmdOrGroup)
        }
    }

    /**
     * The `all` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async all(message) {
        const { guild, client } = message
        const { user, registry } = client
        const { commands, groups } = registry

        const commandsList = commands.filter(cmd => {
            if (guild) return !cmd.isEnabledIn(guild, true)
            return !cmd._globalEnabled
        }).map(c => `\`${c.name}\``).sort().join(', ') || 'There are no disabled commands'

        const groupsList = groups.filter(grp => {
            if (guild) return !grp.isEnabledIn(guild)
            return !grp._globalEnabled
        }).map(g => `\`${g.name}\``).sort().join(', ') || 'There are no disabled groups'

        const name = guild?.name || user.username
        const avatar = guild?.iconURL({ dynamic: true }) || user.displayAvatarURL({ dynamic: true })

        const disabled = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${name}'s disabled commands and groups`, avatar)
            .addField('Commands', commandsList)
            .addField('Groups', groupsList)
            .setTimestamp()

        await message.replyEmbed(disabled)
    }

    /**
     * The `command` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {Command} command The command to diagnose
     */
    async command(message, command) {
        while (!(command instanceof Command)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            command = value
        }

        const { guild, clientMember, client } = message
        const isEnabled = guild ? command.isEnabledIn(guild, true) : command._globalEnabled

        const global = guild ? 'Status' : 'Global status'
        const avatar = guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL({ dynamic: true })

        const diagnose = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${global} of command: ${command.name}`, avatar)
            .addField('Status', isEnabled ? 'Enabled' : 'Disabled', true)
            .addField('Guarded', command.guarded ? 'Yes' : 'No', true)
            .setTimestamp()

        if (guild) {
            /** @type {GuildChannel} */
            const channel = message.channel

            const perms = channel.permissionsFor(clientMember).missing(command.clientPermissions)
            const missing = perms?.map(str => `\`${permissions[str.toString()]}\``).join(', ') || 'None'

            diagnose.addField('Missing permissions', missing)
        }

        await message.replyEmbed(diagnose)
    }

    /**
     * The `group` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {CommandGroup} group The group to diagnose
     */
    async _group(message, group) {
        while (!(group instanceof CommandGroup)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            group = value
        }

        const { guild, client } = message
        const isEnabled = guild ? group.isEnabledIn(guild, true) : group._globalEnabled

        const global = guild ? 'Status' : 'Global status'
        const avatar = guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL({ dynamic: true })

        const diagnose = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${global} of group: ${group.name}`, avatar)
            .addField('Status', isEnabled ? 'Enabled' : 'Disabled', true)
            .addField('Guarded', group.guarded ? 'Yes' : 'No', true)
            .setTimestamp()

        await message.replyEmbed(diagnose)
    }
}