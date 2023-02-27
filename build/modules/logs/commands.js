"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
/** Handles all of the command logs. */
function default_1(client) {
    client.on('commandRun', async (command, _, context) => {
        if (!context.inGuild())
            return;
        const { guild, channel, author } = context;
        const isModCommand = !!command.userPermissions
            || command.ownerOnly
            || command.guildOwnerOnly
            || command.name === 'prefix'
            || command.modPermissions;
        if (command.hidden || !isModCommand)
            return;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'commands');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/commands#run".');
        const commandContent = context.toString();
        const trimmedContent = (0, functions_1.sliceDots)(commandContent, 1016);
        const url = context instanceof pixoll_commando_1.CommandoMessage ? context.url
            : await context.fetchReply().catch(() => null).then(m => m?.url);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: `Used ${command.name} command`,
            iconURL: author.displayAvatarURL({ forceStatic: false }),
        })
            .setDescription((0, common_tags_1.oneLine) `
                ${author.toString()} used the \`${command.name}\` command in ${channel.toString()}
                ${url ? `[Jump to message](${url})` : ''}
            `)
            .addFields({
            name: 'Message',
            value: (0, functions_1.code)(trimmedContent),
        })
            .setFooter({ text: `Author ID: ${author.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('commandPrefixChange', async (guild, prefix) => {
        if (!guild)
            return;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'commands');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/commands#prefixChange".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: 'Updated command prefix',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(`**New prefix:** ${prefix}`)
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('commandStatusChange', async (guild, command, enabled) => {
        if (!guild)
            return;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'commands');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/commands#statusChange".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: 'Updated command status',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(`The \`${command.name}\` command has been \`${enabled ? 'enabled' : 'disabled'}\`.`)
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9sb2dzL2NvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQXNDO0FBQ3RDLDJDQUEwQztBQUMxQyxxREFBa0U7QUFDbEUscURBQThFO0FBRTlFLHVDQUF1QztBQUN2QyxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFBRSxPQUFPO1FBRS9CLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMzQyxNQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWU7ZUFDdkMsT0FBTyxDQUFDLFNBQVM7ZUFDakIsT0FBTyxDQUFDLGNBQWM7ZUFDdEIsT0FBTyxDQUFDLElBQUksS0FBSyxRQUFRO2VBQ3pCLE9BQU8sQ0FBQyxjQUFjLENBQUM7UUFFOUIsSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsWUFBWTtZQUFFLE9BQU87UUFFNUMsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLGdDQUFvQixFQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUUsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLG9DQUFvQyxDQUFDLENBQUM7UUFFM0QsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFDLE1BQU0sY0FBYyxHQUFHLElBQUEscUJBQVMsRUFBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFdkQsTUFBTSxHQUFHLEdBQUcsT0FBTyxZQUFZLGlDQUFl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