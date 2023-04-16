"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
const better_ms_1 = require("better-ms");
const channelTypeMap = {
    [discord_js_1.ChannelType.AnnouncementThread]: 'Announcement thread',
    [discord_js_1.ChannelType.PublicThread]: 'Public thread',
    [discord_js_1.ChannelType.PrivateThread]: 'Private thread',
    [discord_js_1.ChannelType.GuildAnnouncement]: 'News',
    [discord_js_1.ChannelType.GuildForum]: 'Forum',
    [discord_js_1.ChannelType.GuildText]: 'Text',
};
const threadAutoArchiveDurationMap = {
    [discord_js_1.ThreadAutoArchiveDuration.OneDay]: 'One day',
    [discord_js_1.ThreadAutoArchiveDuration.OneHour]: 'One hour',
    [discord_js_1.ThreadAutoArchiveDuration.OneWeek]: 'One week',
    [discord_js_1.ThreadAutoArchiveDuration.ThreeDays]: 'Three days',
};
/** Handles all of the thread logs. */
function default_1(client) {
    client.on('threadCreate', async (thread) => {
        const { guild, type, parent, id, autoArchiveDuration } = thread;
        if (thread.joinable && !thread.joined) {
            await thread.join().catch(() => false);
        }
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'threads');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/threads#create".');
        const { guildMember } = await thread.fetchOwner() ?? {};
        const channelType = channelTypeMap[type];
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Green')
            .setAuthor({
            name: `Created ${channelType} channel`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription((0, common_tags_1.stripIndent) `
                ${(0, common_tags_1.oneLine) `
                ${guildMember?.toString()} created ${channelType} ${thread.toString()}
                ${parent ? `under ${channelTypeMap[parent.type]} channel ${parent.toString()}` : ''}
                `}
                ${autoArchiveDuration ? (0, common_tags_1.oneLine) `
                **Auto-archiving ${(0, utils_1.timestamp)(Date.now() + (autoArchiveDuration * 60000), 'R')}**
                ` : ''}
            `)
            .setFooter({ text: `Thread ID: ${id} • Parent ID: ${parent?.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('threadDelete', async (thread) => {
        const { guild, type, parent, id, name, members } = thread;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'threads');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/threads#delete".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
            name: `Deleted ${channelTypeMap[type]} channel`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription((0, common_tags_1.stripIndent) `
                ${parent ? `\`#${name}\` under ${channelTypeMap[parent.type]} channel ${parent.toString()}` : ''}
                **Member count:** ${members.cache.size}
            `)
            .setFooter({ text: `Thread ID: ${id} • Parent ID: ${parent?.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('threadUpdate', async (oldThread, newThread) => {
        const { guild } = newThread;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'threads');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/threads#update".');
        const { autoArchiveDuration: autoArchive1, archived: archived1, name: name1, locked: locked1, rateLimitPerUser: rateLimit1, } = oldThread;
        const { autoArchiveDuration: autoArchive2, archived: archived2, name: name2, locked: locked2, rateLimitPerUser: rateLimit2, id, parentId, type, } = newThread;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: `Updated ${channelTypeMap[type]} channel`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(newThread.toString())
            .setFooter({ text: `Thread ID: ${id} • Channel ID: ${parentId}` })
            .setTimestamp();
        if (autoArchive1 !== autoArchive2) {
            const archiveIn1 = autoArchive1 ? threadAutoArchiveDurationMap[autoArchive1] : 'Never';
            const archiveIn2 = autoArchive2 ? threadAutoArchiveDurationMap[autoArchive2] : 'Never';
            embed.addFields({
                name: 'Archive after inactivity',
                value: `${archiveIn1} ➜ ${archiveIn2}`,
            });
        }
        if (archived1 !== archived2)
            embed.addFields({
                name: 'Archived',
                value: (0, utils_1.yesOrNo)(archived1),
            });
        if (name1 !== name2)
            embed.addFields({
                name: 'Name',
                value: `${name1} ➜ ${name2}`,
            });
        if (locked1 !== locked2)
            embed.addFields({
                name: 'Anyone can unarchive',
                value: (0, utils_1.yesOrNo)(locked2),
            });
        if (rateLimit1 !== rateLimit2) {
            const slowmode1 = rateLimit1 ? (0, better_ms_1.ms)(rateLimit1 * 1000, { long: true }) : 'Off';
            const slowmode2 = rateLimit2 ? (0, better_ms_1.ms)(rateLimit2 * 1000, { long: true }) : 'Off';
            embed.addFields({
                name: 'Slowmode',
                value: `${slowmode1} ➜ ${slowmode2}`,
            });
        }
        if (embed.data.fields?.length !== 0)
            guild.queuedLogs.push(embed);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyZWFkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2R1bGVzL2xvZ3MvdGhyZWFkcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUFtRDtBQUNuRCwyQ0FBaUc7QUFFakcsdUNBQXVFO0FBQ3ZFLHlDQUErQjtBQUkvQixNQUFNLGNBQWMsR0FBeUM7SUFDekQsQ0FBQyx3QkFBVyxDQUFDLGtCQUFrQixDQUFDLEVBQUUscUJBQXFCO0lBQ3ZELENBQUMsd0JBQVcsQ0FBQyxZQUFZLENBQUMsRUFBRSxlQUFlO0lBQzNDLENBQUMsd0JBQVcsQ0FBQyxhQUFhLENBQUMsRUFBRSxnQkFBZ0I7SUFDN0MsQ0FBQyx3QkFBVyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsTUFBTTtJQUN2QyxDQUFDLHdCQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsT0FBTztJQUNqQyxDQUFDLHdCQUFXLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTTtDQUNsQyxDQUFDO0FBRUYsTUFBTSw0QkFBNEIsR0FBOEM7SUFDNUUsQ0FBQyxzQ0FBeUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTO0lBQzdDLENBQUMsc0NBQXlCLENBQUMsT0FBTyxDQUFDLEVBQUUsVUFBVTtJQUMvQyxDQUFDLHNDQUF5QixDQUFDLE9BQU8sQ0FBQyxFQUFFLFVBQVU7SUFDL0MsQ0FBQyxzQ0FBeUIsQ0FBQyxTQUFTLENBQUMsRUFBRSxZQUFZO0NBQ3RELENBQUM7QUFFRixzQ0FBc0M7QUFDdEMsbUJBQXlCLE1BQTRCO0lBQ2pELE1BQU0sQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBQyxNQUFNLEVBQUMsRUFBRTtRQUNyQyxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLG1CQUFtQixFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQ2hFLElBQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFN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