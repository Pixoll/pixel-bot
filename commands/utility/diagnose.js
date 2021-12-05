/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { MessageEmbed, GuildChannel } = require('discord.js')
const { Command, permissions, CommandGroup } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { getArgument, replyAll, basicEmbed } = require('../../utils')
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
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'all',
                        description: 'Check the status of all commands and groups.'
                    },
                    {
                        type: 'subcommand',
                        name: 'command',
                        description: 'Check the status of a single command.',
                        options: [{
                            type: 'string',
                            name: 'command',
                            description: 'The command to diagnose.',
                            required: true
                        }]
                    },
                    {
                        type: 'subcommand',
                        name: 'group',
                        description: 'Check the status of a single group.',
                        options: [{
                            type: 'string',
                            name: 'group',
                            description: 'The group to diagnose.',
                            required: true,
                            choices: [
                                { name: 'ℹ️ Information', value: 'info' },
                                { name: '📋 Listing', value: 'lists' },
                                { name: '💼 Managing', value: 'managing' },
                                { name: '🎲 Miscellaneous', value: 'misc' },
                                { name: '🛡️ Moderation', value: 'mod' },
                                { name: '🗃 Moderation logs', value: 'mod-logs' },
                                { name: '🛠 Utility', value: 'utility' },
                            ]
                        }]
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'all'|'command'|'group'} args.subCommand The sub-command to use
     * @param {Command|CommandGroup} args.cmdOrGroup The command or group to diagnose
     */
    async run({ message, interaction }, { subCommand, cmdOrGroup, command, group }) {
        subCommand = subCommand.toLowerCase()

        try {
            command &&= this.client.registry.resolveCommand(command)
            group &&= this.client.registry.resolveGroup(group)
        } catch {
            command = null
            group = null
        }

        switch (subCommand) {
            case 'all':
                return await this.all({ message, interaction })
            case 'command':
                return await this.command({ message, interaction }, cmdOrGroup ?? command)
            case 'group':
                return await this._group({ message, interaction }, cmdOrGroup ?? group)
        }
    }

    /**
     * The `all` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async all({ message, interaction }) {
        const { guild, client } = message || interaction
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

        const diagnose = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${name}'s disabled commands and groups`, avatar)
            .addField('Commands', commandsList)
            .addField('Groups', groupsList)
            .setTimestamp()

        await replyAll({ message, interaction }, diagnose)
    }

    /**
     * The `command` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {Command} command The command to diagnose
     */
    async command({ message, interaction }, command) {
        if (message) {
            while (!(command instanceof Command)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
                if (cancelled) return
                command = value
            }
        } else if (!command) {
            return await replyAll({ interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That command doesn\'t exist.'
            }))
        }

        const { guild, client } = message || interaction
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
            const channel = (message || interaction).channel

            const perms = channel.permissionsFor(guild.me).missing(command.clientPermissions)
            const missing = perms?.map(str => `\`${permissions[str.toString()]}\``).join(', ') || 'None'

            diagnose.addField('Missing permissions', missing)
        }

        await replyAll({ message, interaction }, diagnose)
    }

    /**
     * The `group` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {CommandGroup} group The group to diagnose
     */
    async _group({ message, interaction }, group) {
        if (message) {
            while (!(group instanceof CommandGroup)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
                if (cancelled) return
                group = value
            }
        }

        const { guild, client } = message || interaction
        const isEnabled = guild ? group.isEnabledIn(guild, true) : group._globalEnabled

        const global = guild ? 'Status' : 'Global status'
        const avatar = guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL({ dynamic: true })

        const diagnose = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${global} of group: ${group.name}`, avatar)
            .addField('Status', isEnabled ? 'Enabled' : 'Disabled', true)
            .addField('Guarded', group.guarded ? 'Yes' : 'No', true)
            .setTimestamp()

        await replyAll({ message, interaction }, diagnose)
    }
}