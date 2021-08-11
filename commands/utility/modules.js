const { stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { Command, CommandoMessage } = require('discord.js-commando')
const { basicEmbed } = require('../../utils/functions')
const { modules: modulesDocs } = require('../../utils/mongo/schemas')

module.exports = class modules extends Command {
    constructor(client) {
        super(client, {
            name: 'modules',
            group: 'utility',
            memberName: 'modules',
            description: stripIndent`
                With this command you can toggle the different modules on and off.
                These are the available modules: \`auto-mod\`, \`chat-filter\` \`welcome\`, \`audit-logs\` and \`all\`.
                \`audit-logs\` has the sub-modules: \`channels\`, \`commands\`, \`emojis\`, \`invites\`, \`members\`, \`messages\`, \`moderation\`, \`roles\`, \`server\`, \`voice\` and \`all\`
            `,
            format: stripIndent`
                modules <module> - Toggle one or all modules.
                modules audit-logs [sub-module] - Toggle one or all sub-modules of the audit logs.
            `,
            examples: ['modules auto-mod', 'modules audit-logs server'],
            userPermissions: ['ADMINISTRATOR'],
            guarded: true,
            guildOnly: true,
            args: [
                {
                    key: 'module',
                    prompt: 'What module do you want to toggle?',
                    type: 'string',
                    oneOf: ['auto-mod', 'chat-filter', 'welcome', 'audit-logs', 'all'],
                    default: ''
                },
                {
                    key: 'subModule',
                    prompt: 'What sub-module of the audit logs do you want to toggle?',
                    type: 'string',
                    oneOf: ['channels', 'emojis', 'members', 'server', 'messages', 'roles', 'misc', 'all'],
                    default: ''
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {string} args.module The module to toggle
     * @param {string} args.subModule The sub-module to toggle
     */
    async run(message, { module, subModule }) {
        const { guild } = message

        const data = await modulesDocs.findOne({ guild: guild.id })
        const { autoMod, chatFilter, welcome, auditLogs } = data || {}
        const { channels, commands, emojis, invites, members, messages, moderation, roles, server, voice } = auditLogs || {}

        const isEnabled = module => module === false ? 'Disabled' : 'Enabled'
        const toggle = module => typeof module === 'undefined' ? false : !module

        if (!module) {
            const disabled = new MessageEmbed()
                .setColor('#4c9f4c')
                .setAuthor(`${guild.name}'s modules and sub-modules`, guild.iconURL({ dynamic: true }))
                .setDescription(stripIndent`
                    **>** **Automatic moderation:** ${isEnabled(autoMod)}
                    **>** **Chat filter:** ${isEnabled(chatFilter)}
                    **>** **Welcome messages:** ${isEnabled(welcome)}
                    **>** **Audit logs:**
                    \u2800 ⤷ **Channels:** ${isEnabled(channels)}
                    \u2800 ⤷ **Commands:** ${isEnabled(commands)}
                    \u2800 ⤷ **Emojis:** ${isEnabled(emojis)}
                    \u2800 ⤷ **Invites:** ${isEnabled(invites)}
                    \u2800 ⤷ **Members:** ${isEnabled(members)}
                    \u2800 ⤷ **Messages:** ${isEnabled(messages)}
                    \u2800 ⤷ **Moderation:** ${isEnabled(moderation)}
                    \u2800 ⤷ **Roles:** ${isEnabled(roles)}
                    \u2800 ⤷ **Server:** ${isEnabled(server)}
                    \u2800 ⤷ **Voice:** ${isEnabled(voice)}
                `)
                .setTimestamp()

            return message.say(disabled)
        }

        if (module.toLowerCase() === 'all') {
            const doc = {
                guild: guild.id,
                autoMod: toggle(autoMod),
                chatFilter: toggle(chatFilter),
                welcome: toggle(welcome),
                auditLogs: {
                    channels: toggle(channels),
                    commands: toggle(commands),
                    emojis: toggle(emojis),
                    invites: toggle(invites),
                    members: toggle(members),
                    messages: toggle(messages),
                    moderation: toggle(moderation),
                    server: toggle(server),
                    roles: toggle(roles),
                    voice: toggle(voice)
                }
            }

            if (!data) await new modulesDocs(doc).save()
            else await data.updateOne(doc)

            return message.say(basicEmbed('green', 'check', 'Toggled every single module and sub-module.'))
        }

        const template = {
            guild: guild.id,
            autoMod,
            chatFilter,
            welcome,
            auditLogs: {
                channels,
                commands,
                emojis,
                invites,
                members,
                messages,
                moderation,
                server,
                roles,
                voice
            }
        }

        if (module.toLowerCase() !== 'audit-logs') {
            if (module.toLowerCase() === 'auto-mod') template.autoMod = toggle(template.autoMod)
            if (module.toLowerCase() === 'chat-filter') template.chatFilter = toggle(template.chatFilter)
            if (module.toLowerCase() === 'welcome') template.welcome = toggle(template.welcome)

            if (!data) await new modulesDocs(template).save()
            else await data.updateOne(template)

            return message.say(basicEmbed('green', 'check', `Toggled the module \`${module.toLowerCase()}\``))
        }

        if (!subModule) return message.say(basicEmbed('red', 'cross', 'Please specify a sub-module.'))

        if (subModule.toLowerCase() === 'all') {
            for (const sub in template.auditLogs) {
                template.auditLogs[sub] = toggle(template.auditLogs[sub])
            }

            if (!data) await new modulesDocs(template).save()
            else await data.updateOne(template)

            return message.say(basicEmbed('green', 'check', 'Toggled every single sub-module of `audit-logs`.'))
        }

        template.auditLogs[subModule.toLowerCase()] = toggle(template.auditLogs[subModule.toLowerCase()])

        if (!data) await new modulesDocs(template).save()
        else await data.updateOne(template)

        return message.say(basicEmbed('green', 'check', `Toggled the sub-module \`${subModule.toLowerCase()}\``))
    }
}