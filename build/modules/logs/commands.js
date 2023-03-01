"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
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
        const url = context.isMessage() ? context.url
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9sb2dzL2NvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQXNDO0FBQ3RDLDJDQUEwQztBQUUxQyxxREFBOEU7QUFFOUUsdUNBQXVDO0FBQ3ZDLG1CQUF5QixNQUE0QjtJQUNqRCxNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUNsRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUFFLE9BQU87UUFFL0IsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzNDLE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZTtlQUN2QyxPQUFPLENBQUMsU0FBUztlQUNqQixPQUFPLENBQUMsY0FBYztlQUN0QixPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVE7ZUFDekIsT0FBTyxDQUFDLGNBQWMsQ0FBQztRQUU5QixJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxZQUFZO1lBQUUsT0FBTztRQUU1QyxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsZ0NBQW9CLEVBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsb0NBQW9DLENBQUMsQ0FBQztRQUUzRCxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDMUMsTUFBTSxjQUFjLEdBQUcsSUFBQSxxQkFBUyxFQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV2RCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FB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