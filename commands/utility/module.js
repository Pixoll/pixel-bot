/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { Command } = require('../../command-handler')
const { CommandInstances, CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, capitalize, getArgument, addDashes, removeDashes, replyAll } = require('../../utils')
const { Module, AuditLog, ModuleSchema } = require('../../schemas/types')
/* eslint-enable no-unused-vars */

const Obj = require('../../schemas').modules.schema.obj
const modules = Object.keys(Obj).slice(1).map(addDashes)
const auditLogs = Object.keys(Obj.auditLogs).map(addDashes)

/**
 * Patches the data of a {@link ModuleSchema}
 * @param {ModuleSchema} data The data to patch
 */
function patchData(data) {
    const _patch = b => b === true

    const patch = {
        // autoMod: _patch(data?.autoMod),
        // chatFilter: _patch(data?.chatFilter),
        welcome: _patch(data?.welcome),
        stickyRoles: _patch(data?.stickyRoles),
        auditLogs: {
            channels: _patch(data?.auditLogs?.channels),
            commands: _patch(data?.auditLogs?.commands),
            emojis: _patch(data?.auditLogs?.emojis),
            invites: _patch(data?.auditLogs?.invites),
            members: _patch(data?.auditLogs?.members),
            messages: _patch(data?.auditLogs?.messages),
            moderation: _patch(data?.auditLogs?.moderation),
            modules: _patch(data?.auditLogs?.modules),
            roles: _patch(data?.auditLogs?.roles),
            server: _patch(data?.auditLogs?.server),
            stickers: _patch(data?.auditLogs?.stickers),
            threads: _patch(data?.auditLogs?.threads),
            users: _patch(data?.auditLogs?.users),
            voice: _patch(data?.auditLogs?.voice)
        }
    }

    return patch
}

/** A command that can be run in a client */
module.exports = class ModuleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'module',
            group: 'utility',
            description: 'Diagnose the status of a module or sub-module, or toggle it on/off.',
            details: stripIndent`
                \`module\` can be either: ${modules.map(m => `\`${m}\``).join(', ').replace(/,(?=[^,]*$)/, ' or')}.
                \`sub-module\` can be either: ${auditLogs.map(sm => `\`${sm}\``).join(', ').replace(/,(?=[^,]*$)/, ' or')}.
            `,
            format: stripIndent`
                module diagnose [module] <sub-module> - Diagnose a module or sub-module.
                module toggle [module] <sub-module> - Toggle a module or sub-module on/off.
            `,
            examples: [
                'module diagnose welcome',
                'module toggle audit-logs channels'
            ],
            userPermissions: ['ADMINISTRATOR'],
            guarded: true,
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['diagnose', 'toggle']
                },
                {
                    key: 'module',
                    prompt: 'What module do you want to toggle/diagnose?',
                    type: 'string',
                    oneOf: modules
                },
                {
                    key: 'subModule',
                    label: 'sub-module',
                    prompt: 'What sub-module of the audit logs do you want to toggle/diagnose?',
                    type: 'string',
                    oneOf: auditLogs,
                    required: false
                }
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'diagnose',
                        description: 'Diagnose a module or sub-module.',
                        options: [
                            {
                                type: 'string',
                                name: 'module',
                                description: 'The module to diagnose.',
                                required: true,
                                choices: modules.map(m => ({ name: capitalize(m.replace('-', ' ')), value: m }))
                            },
                            {
                                type: 'string',
                                name: 'sub-module',
                                description: 'The sub-module to diagnose. Only usable if "module" is "Audit Logs".',
                                choices: auditLogs.map(m => ({ name: capitalize(m), value: m }))
                            }
                        ]
                    },
                    {
                        type: 'subcommand',
                        name: 'toggle',
                        description: 'Toggle a module or sub-module on/off.',
                        options: [
                            {
                                type: 'string',
                                name: 'module',
                                description: 'The module to toggle.',
                                required: true,
                                choices: modules.map(m => ({ name: capitalize(m.replace('-', ' ')), value: m }))
                            },
                            {
                                type: 'string',
                                name: 'sub-module',
                                description: 'The sub-module to toggle. Only usable if "module" is "Audit Logs".',
                                choices: auditLogs.map(m => ({ name: capitalize(m), value: m }))
                            }
                        ]
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'diagnose'|'toggle'} args.subCommand The sub-command to use
     * @param {Module} args.module The module to toggle or diagnose
     * @param {AuditLog} args.subModule The sub-module to toggle or diagnose
     */
    async run({ message, interaction }, { subCommand, module, subModule }) {
        subCommand = subCommand.toLowerCase()
        module = module.toLowerCase()
        if (module !== 'audit-logs') subModule = null
        subModule &&= subModule.toLowerCase()

        const { guild } = message || interaction
        this.db = guild.database.modules

        const data = await this.db.fetch()

        switch (subCommand) {
            case 'diagnose':
                return await this.diagnose({ message, interaction }, data, module, subModule)
            case 'toggle':
                return await this.toggle({ message, interaction }, data, module, subModule)
        }
    }

    /**
     * The `diagnose` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {ModuleSchema} data The modules and sub-modules data
     * @param {Module} module The module to diagnose
     * @param {AuditLog} subModule The sub-module to diagnose
     */
    async diagnose({ message, interaction }, data, module, subModule) {
        const patch = patchData(data)

        let part1 = patch[removeDashes(module)]
        if (typeof part1 === 'object') {
            const full = Object.values(part1)
            const part = full.filter(b => b === false)
            if (full.length === part.length) part1 = false
            else part1 = true
        }
        /** @type {boolean} */
        const isEnabled = subModule ? patch[removeDashes(module)][removeDashes(subModule)] : part1

        const { guild } = message || interaction
        const type = subModule ? 'sub-module' : 'module'

        const diagnose = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`Status of ${type}: ${subModule || module}`, guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **Status:** ${isEnabled ? 'Enabled' : 'Disabled'}
                ${subModule ? `**Parent module:** ${capitalize(module)}` : ''}
                ${subModule ? `**Parent module status:** ${part1 ? 'Enabled' : 'Disabled'}` : ''}
            `)
            .setTimestamp()

        await replyAll({ message, interaction }, diagnose)
    }

    /**
     * The `toggle` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {ModuleSchema} data The modules and sub-modules data
     * @param {Module} module The module to toggle
     * @param {AuditLog} subModule The sub-module to toggle
     */
    async toggle({ message, interaction }, data, module, subModule) {
        if (message && module === 'audit-logs' && !subModule) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
            if (cancelled) return
            subModule = value.toLowerCase()
        }

        const { guildId, guild } = message || interaction

        const patch = { guild: guildId, ...patchData(data) }
        if (!subModule) patch[removeDashes(module)] = !patch[removeDashes(module)]
        else patch[removeDashes(module)][removeDashes(subModule)] = !patch[removeDashes(module)][removeDashes(subModule)]

        if (data) await this.db.update(data, patch)
        else await this.db.add(patch)

        const type = subModule ? 'sub-module' : 'module'
        const target = subModule ? `${module}/${subModule}` : module
        const status = subModule ? patch[removeDashes(module)][removeDashes(subModule)] : patch[removeDashes(module)]

        this.client.emit('moduleStatusChange', guild, target, status)

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `Toggled the ${type} \`${target}\``,
            fieldValue: `**New status:** ${status ? 'Enabled' : 'Disabled'}`
        }))
    }
}