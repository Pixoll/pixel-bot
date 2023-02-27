import { stripIndent } from 'common-tags';
import { AuditLogEvent, EmbedBuilder } from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { fetchPartial, isGuildModuleEnabled, timestamp } from '../../utils/functions';

/** Handles all of the moderation logs. */
export default function (client: CommandoClient<true>): void {
    client.on('guildMemberRemove', async partialMember => {
        const member = await fetchPartial(partialMember);
        if (!member) return;

        const { guild, user, id } = member;
        if (!guild.available || id === client.user.id) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'moderation');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/moderation#kick".');

        const kickLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null);
        const kickLog = kickLogs?.entries.first();
        if (!kickLog || kickLog.action !== AuditLogEvent.MemberKick) return;

        const { executor, reason, target } = kickLog;
        if (!target || !('id' in target) || target.id !== id) return;

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
                name: 'Kicked user', iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription(stripIndent`
                ${executor?.toString()} kicked ${user.toString()} ${user.tag}
                **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setFooter({ text: `User ID: ${id} • Mod ID: ${executor?.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('guildBanAdd', async partialBanLog => {
        const banLog = await fetchPartial(partialBanLog);
        if (!banLog || !banLog.guild.available) return;

        const { guild, user, reason } = banLog;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'moderation');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/moderation#banAdd".');

        const banLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null);
        const banLog2 = banLogs?.entries.first();

        let moderator = null;
        if (
            banLog2 && banLog2.action === AuditLogEvent.MemberBanAdd && banLog2.target
            && 'id' in banLog2.target && banLog2.target.id === user.id
        ) {
            const { executor } = banLog2;
            moderator = executor ? `${executor.toString()} ` : null;
        }

        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({
                name: 'Banned user', iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription(stripIndent`
                ${moderator ? moderator + 'banned' : 'Banned'} ${user.toString()} ${user.tag}
                **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setImage('https://media.giphy.com/media/fe4dDMD2cAU5RfEaCU/giphy.gif')
            .setFooter({ text: `User ID: ${user.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('guildBanRemove', async partialUnbanLog => {
        const unbanLog = await fetchPartial(partialUnbanLog);
        if (!unbanLog || !unbanLog.guild.available) return;

        const { guild, user } = unbanLog;
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'moderation');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/moderation#banRemove".');

        const unbanLogs = await guild.fetchAuditLogs({ limit: 1 }).catch(() => null);
        const unbanLog2 = unbanLogs?.entries.first();

        let reason, moderator;
        if (
            unbanLog2 && unbanLog2.action === AuditLogEvent.MemberBanRemove && unbanLog2.target
            && 'id' in unbanLog2.target && unbanLog2.target.id === user.id
        ) {
            const { executor } = unbanLog2 || {};
            reason = unbanLog2.reason;
            moderator = executor ? `${executor.toString()} ` : null;
        }

        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({
                name: 'Unbanned user', iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription(stripIndent`
                ${moderator ? moderator + 'unbanned' : 'Unbanned'} ${user.toString()} ${user.tag}
                **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setFooter({ text: `User ID: ${user.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('guildMemberMute', async (guild, mod, user, reason, expiresAt) => {
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'moderation');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/moderation#mute".');

        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({
                name: 'Muted member', iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription(stripIndent`
                ${mod.toString()} muted ${user.toString()} ${user.tag}
                **Expires:** ${timestamp(expiresAt, 'R')}
                **Reason:** ${reason}
            `)
            .setFooter({ text: `User ID: ${user.id} • Mod ID: ${mod.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('guildMemberTimeout', async (guild, mod, user, reason, expiresAt) => {
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'moderation');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/moderation#timeout".');

        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({
                name: 'Timed-out member', iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription(stripIndent`
                ${mod.toString()} timed-out ${user.toString()} ${user.tag}
                **Expires:** ${timestamp(expiresAt, 'R')}
                **Reason:** ${reason}
            `)
            .setFooter({ text: `User ID: ${user.id} • Mod ID: ${mod.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('guildMemberUnmute', async (guild, mod, user, reason) => {
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'moderation');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/moderation#unmute".');

        const modFooter = mod ? ` • Mod ID: ${mod.id}` : '';

        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({
                name: 'Unmuted member', iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription(stripIndent`
                ${mod.toString()} unmuted ${user.toString()} ${user.tag}
                **Reason:** ${reason}
            `)
            .setFooter({ text: `User ID: ${user.id}` + modFooter })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('guildMemberWarn', async (guild, mod, user, reason) => {
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'moderation');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/moderation#warn".');

        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setAuthor({
                name: 'Warned member', iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 1024 }))
            .setDescription(stripIndent`
                ${mod.toString()} warned ${user.toString()} ${user.tag}
                **Reason:** ${reason}
            `)
            .setFooter({ text: `User ID: ${user.id} • Mod ID: ${mod.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });
}
