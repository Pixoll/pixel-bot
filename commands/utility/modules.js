/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags');
const { MessageEmbed } = require('discord.js');
const { Command, CommandInstances } = require('pixoll-commando');
const { ModuleSchema } = require('../../schemas/types');
const { replyAll, customEmoji } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/**
 * Patches the data of a {@link ModuleSchema}
 * @param {ModuleSchema} data The data to patch
 */
function patchData(data) {
    const _patch = b => b === true ? `Enabled ${customEmoji('online')}` : `Disabled ${customEmoji('dnd')}`;

    const patch = {
        // chatFilter: _patch(data?.chatFilter),
        welcome: _patch(data?.welcome),
        stickyRoles: _patch(data?.stickyRoles),
        auditLogs: {
            boosts: _patch(data?.auditLogs?.boosts),
            channels: _patch(data?.auditLogs?.channels),
            commands: _patch(data?.auditLogs?.commands),
            emojis: _patch(data?.auditLogs?.emojis),
            events: _patch(data?.auditLogs?.events),
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
    };

    return patch;
}

/** A command that can be run in a client */
module.exports = class ModulesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'modules',
            group: 'utility',
            description: 'Check the status of all available modules and sub-modules.',
            modPermissions: true,
            guarded: true,
            guildOnly: true,
            slash: true
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const { guild } = message || interaction;

        const data = await guild.database.modules.fetch();
        const patch = patchData(data);
        const { auditLogs, /* chatFilter, */ welcome, stickyRoles } = patch;
        const {
            boosts, channels, commands, emojis, events, invites, members, messages, moderation, modules, roles, server,
            stickers, threads, users, voice
        } = auditLogs;

        // **Chat filter:** ${chatFilter}

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `${guild.name}'s modules and sub-modules`, iconURL: guild.iconURL({ dynamic: true })
            })
            .setDescription(stripIndent`
                **Sticky roles:** ${stickyRoles}
                **Welcome messages:** ${welcome}
                **Audit logs:**
                \u2800⤷ **Boosts:** ${boosts}
                \u2800⤷ **Channels:** ${channels}
                \u2800⤷ **Commands:** ${commands}
                \u2800⤷ **Emojis:** ${emojis}
                \u2800⤷ **Events:** ${events}
                \u2800⤷ **Invites:** ${invites}
                \u2800⤷ **Members:** ${members}
                \u2800⤷ **Messages:** ${messages}
                \u2800⤷ **Moderation:** ${moderation}
                \u2800⤷ **Modules:** ${modules}
                \u2800⤷ **Roles:** ${roles}
                \u2800⤷ **Server:** ${server}
                \u2800⤷ **Stickers:** ${stickers}
                \u2800⤷ **Threads:** ${threads}
                \u2800⤷ **Users:** ${users}
                \u2800⤷ **Voice:** ${voice}
            `)
            .setTimestamp();

        await replyAll({ message, interaction }, embed);
    }
};
