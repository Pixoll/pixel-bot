const { stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { ModuleSchema } = require('../../schemas/types')

/**
 * Patches the data of a {@link ModuleSchema}
 * @param {ModuleSchema} data The data to patch
 */
function patchData(data) {
    const _patch = b => b === false ? 'Disabled' : 'Enabled'

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
module.exports = class ModulesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'modules',
            group: 'utility',
            description: stripIndent`
                Check the status of all available modules and sub-modules.
                Use the \`module toggle\` command to toggle a module or sub-module.
            `,
            userPermissions: ['MANAGE_MESSAGES'],
            guarded: true,
            guildOnly: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const { guild } = message

        const data = await guild.database.modules.fetch()
        const patch = patchData(data)
        const { auditLogs, /* autoMod, chatFilter, */ welcome, stickyRoles } = patch
        const {
            channels, commands, emojis, invites, members, messages, moderation,
            modules, roles, server, stickers, threads, users, voice
        } = auditLogs

        // **>** **Automatic moderation:** ${autoMod}
        // **>** **Chat filter:** ${chatFilter}

        const disabled = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${guild.name}'s modules and sub-modules`, guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Sticky roles:** ${stickyRoles}
                **>** **Welcome messages:** ${welcome}
                **>** **Audit logs:**
                \u2800 ⤷ **Channels:** ${channels}
                \u2800 ⤷ **Commands:** ${commands}
                \u2800 ⤷ **Emojis:** ${emojis}
                \u2800 ⤷ **Invites:** ${invites}
                \u2800 ⤷ **Members:** ${members}
                \u2800 ⤷ **Messages:** ${messages}
                \u2800 ⤷ **Moderation:** ${moderation}
                \u2800 ⤷ **Modules:** ${modules}
                \u2800 ⤷ **Roles:** ${roles}
                \u2800 ⤷ **Server:** ${server}
                \u2800 ⤷ **Stickers:** ${stickers}
                \u2800 ⤷ **Threads:** ${threads}
                \u2800 ⤷ **Users:** ${users}
                \u2800 ⤷ **Voice:** ${voice}
            `)
            .setTimestamp()

        await message.replyEmbed(disabled)
    }
}