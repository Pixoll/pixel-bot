"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
/** Handles all of the moderation logs. */
function default_1(client) {
    client.on('guildMemberRemove', async (partialMember) => {
        const member = await (0, utils_1.fetchPartial)(partialMember);
        if (!member)
            return;
        const { guild, user, id } = member;
        if (!guild.available || id === client.user.id)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'moderation');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/moderation#kick".');
        const kickLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null);
        const kickLog = kickLogs?.entries.first();
        if (!kickLog || kickLog.action !== discord_js_1.AuditLogEvent.MemberKick)
            return;
        const { executor, reason, target } = kickLog;
        if (!target || !('id' in target) || target.id !== id)
            return;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
            name: 'Kicked user',
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription((0, common_tags_1.stripIndent) `
                ${executor?.toString()} kicked ${user.toString()} ${user.tag}
                **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setFooter({ text: `User ID: ${id} • Mod ID: ${executor?.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('guildBanAdd', async (partialBanLog) => {
        const banLog = await (0, utils_1.fetchPartial)(partialBanLog);
        if (!banLog || !banLog.guild.available)
            return;
        const { guild, user, reason } = banLog;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'moderation');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/moderation#banAdd".');
        const banLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null);
        const banLog2 = banLogs?.entries.first();
        let moderator = null;
        if (banLog2 && banLog2.action === discord_js_1.AuditLogEvent.MemberBanAdd && banLog2.target
            && 'id' in banLog2.target && banLog2.target.id === user.id) {
            const { executor } = banLog2;
            moderator = executor ? `${executor.toString()} ` : null;
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Gold')
            .setAuthor({
            name: 'Banned user',
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription((0, common_tags_1.stripIndent) `
                ${moderator ? moderator + 'banned' : 'Banned'} ${user.toString()} ${user.tag}
                **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setImage('https://media.giphy.com/media/fe4dDMD2cAU5RfEaCU/giphy.gif')
            .setFooter({ text: `User ID: ${user.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('guildBanRemove', async (partialUnbanLog) => {
        const unbanLog = await (0, utils_1.fetchPartial)(partialUnbanLog);
        if (!unbanLog || !unbanLog.guild.available)
            return;
        const { guild, user } = unbanLog;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'moderation');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/moderation#banRemove".');
        const unbanLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null);
        const unbanLog2 = unbanLogs?.entries.first();
        let reason, moderator;
        if (unbanLog2 && unbanLog2.action === discord_js_1.AuditLogEvent.MemberBanRemove && unbanLog2.target
            && 'id' in unbanLog2.target && unbanLog2.target.id === user.id) {
            const { executor } = unbanLog2 || {};
            reason = unbanLog2.reason;
            moderator = executor ? `${executor.toString()} ` : null;
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Gold')
            .setAuthor({
            name: 'Unbanned user',
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription((0, common_tags_1.stripIndent) `
                ${moderator ? moderator + 'unbanned' : 'Unbanned'} ${user.toString()} ${user.tag}
                **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setFooter({ text: `User ID: ${user.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('guildMemberMute', async (guild, mod, user, reason, expiresAt) => {
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'moderation');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/moderation#mute".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Gold')
            .setAuthor({
            name: 'Muted member',
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription((0, common_tags_1.stripIndent) `
                ${mod.toString()} muted ${user.toString()} ${user.tag}
                **Expires:** ${(0, utils_1.timestamp)(expiresAt, 'R')}
                **Reason:** ${reason}
            `)
            .setFooter({ text: `User ID: ${user.id} • Mod ID: ${mod.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('guildMemberTimeout', async (guild, mod, user, reason, expiresAt) => {
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'moderation');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/moderation#timeout".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Gold')
            .setAuthor({
            name: 'Timed-out member',
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription((0, common_tags_1.stripIndent) `
                ${mod.toString()} timed-out ${user.toString()} ${user.tag}
                **Expires:** ${(0, utils_1.timestamp)(expiresAt, 'R')}
                **Reason:** ${reason}
            `)
            .setFooter({ text: `User ID: ${user.id} • Mod ID: ${mod.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('guildMemberUnmute', async (guild, mod, user, reason) => {
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'moderation');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/moderation#unmute".');
        const modFooter = mod ? ` • Mod ID: ${mod.id}` : '';
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Gold')
            .setAuthor({
            name: 'Unmuted member',
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription((0, common_tags_1.stripIndent) `
                ${mod.toString()} unmuted ${user.toString()} ${user.tag}
                **Reason:** ${reason}
            `)
            .setFooter({ text: `User ID: ${user.id}` + modFooter })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('guildMemberWarn', async (guild, mod, user, reason) => {
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'moderation');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/moderation#warn".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Gold')
            .setAuthor({
            name: 'Warned member',
            iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription((0, common_tags_1.stripIndent) `
                ${mod.toString()} warned ${user.toString()} ${user.tag}
                **Reason:** ${reason}
            `)
            .setFooter({ text: `User ID: ${user.id} • Mod ID: ${mod.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2R1bGVzL2xvZ3MvbW9kZXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FBeUQ7QUFFekQsdUNBQTRFO0FBRTVFLDBDQUEwQztBQUMxQyxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLEVBQUMsYUFBYSxFQUFDLEVBQUU7UUFDakQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLG9CQUFZLEVBQUMsYUFBYSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPO1FBRXBCLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxFQUFFLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQUUsT0FBTztRQUV0RCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsNEJBQW9CLEVBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNoRixJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsdUNBQXVDLENBQUMsQ0FBQztRQUU5RCxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxjQUFjLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUUsTUFBTSxPQUFPLEdBQUcsUUFBUSxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssMEJBQWEsQ0FBQyxVQUFVO1lBQUUs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