"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const better_ms_1 = require("better-ms");
const channelTypeMap = {
    [discord_js_1.ChannelType.GuildAnnouncement]: 'News',
    [discord_js_1.ChannelType.GuildCategory]: 'Category',
    [discord_js_1.ChannelType.GuildForum]: 'Forum',
    [discord_js_1.ChannelType.GuildStageVoice]: 'Stage',
    [discord_js_1.ChannelType.GuildText]: 'Text',
    [discord_js_1.ChannelType.GuildVoice]: 'Voice',
};
const overwriteTypeMap = {
    [discord_js_1.OverwriteType.Member]: 'member',
    [discord_js_1.OverwriteType.Role]: 'role',
};
const rtcRegionMap = {
    brazil: 'Brazil',
    europe: 'Europe',
    hongkong: 'Hong Kong',
    india: 'India',
    japan: 'Japan',
    russia: 'Russia',
    singapore: 'Singapore',
    southafrica: 'South Africa',
    sydney: 'Sydney',
    'us-central': 'US Central',
    'us-east': 'US East',
    'us-south': 'US South',
    'us-west': 'US West',
};
/**
 * Parses a channel region
 * @param region The region to parse
 */
function rtcRegion(region) {
    if (!region)
        return 'Automatic';
    return rtcRegionMap[region];
}
/**
 * Formats the {@link PermissionOverwrites} into an array of string
 * @param perms The permissions to format
 */
function format(perms) {
    return [
        perms?.deny.toArray().map(perm => pixoll_commando_1.Util.permissions[perm]) || [],
        perms?.allow.toArray().map(perm => pixoll_commando_1.Util.permissions[perm]) || [],
    ];
}
/** Handles all of the channel logs. */
function default_1(client) {
    client.on('channelCreate', async (channel) => {
        const { guild, id, type, parent, permissionOverwrites } = channel;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'channels');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/channels#create".');
        const category = parent ? `under the category \`${parent.name}\`` : '';
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Green')
            .setAuthor({
            name: `Created ${channelTypeMap[type].toLowerCase()} channel`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(`${channel.toString()} ${category}`)
            .setFooter({ text: `Channel ID: ${id}` })
            .setTimestamp();
        const perms = [];
        for (const perm of permissionOverwrites.cache.toJSON()) {
            const targetManager = overwriteTypeMap[perm.type] + 's';
            const target = await guild[targetManager].fetch(perm.id).catch(() => null);
            const [deny, allow] = format(perm);
            if (deny.length === 0 && allow.length === 0)
                continue;
            let base = (0, common_tags_1.oneLine) `
                **${pixoll_commando_1.Util.capitalize(overwriteTypeMap[perm.type])}:** ${target?.toString()}
                ${target instanceof discord_js_1.GuildMember ? target.user.tag : ''}
            `;
            if (deny.length !== 0)
                base += `\n${(0, utils_1.customEmoji)('cross')} **Denied:** ${deny.join(', ')}`;
            if (allow.length !== 0)
                base += `\n${(0, utils_1.customEmoji)('check')} **Allowed:** ${allow.join(', ')}`;
            perms.push(base);
        }
        if (perms.length !== 0) {
            embed.addFields({
                name: 'Permissions',
                value: perms.shift(),
            });
            for (const perm of perms)
                embed.addFields({
                    name: '\u2800',
                    value: perm,
                });
        }
        guild.queuedLogs.push(embed);
    });
    client.on('channelDelete', async (channel) => {
        if (channel.isDMBased())
            return;
        const { guild, id, name, type, parent } = channel;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'channels');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/channels#delete".');
        const category = parent ? `under the category \`${parent.name}\`` : '';
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
            name: `Deleted ${channelTypeMap[type].toLowerCase()} channel`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(`\`#${name}\` ${category}`)
            .setFooter({ text: `Channel ID: ${id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('channelPinsUpdate', async (channel) => {
        if (channel.isDMBased())
            return;
        const { guild, id } = channel;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'channels');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/channels#pinsUpdate".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: 'Updated channel pins',
            iconURL: channel.guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(`Pinned or unpinned a message in ${channel.toString()}`)
            .setFooter({ text: `Channel ID: ${id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('channelUpdate', async (oldChannel, newChannel) => {
        if (oldChannel.isDMBased() || newChannel.isDMBased())
            return;
        const { guild } = oldChannel;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'channels');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/channels#update".');
        const { name: name1, parent: parent1, permissionOverwrites: permissions1, permissionsLocked: locked1, id, } = oldChannel;
        const { name: name2, parent: parent2, permissionOverwrites: permissions2, permissionsLocked: locked2, } = newChannel;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: `Updated ${channelTypeMap[oldChannel.type].toLowerCase()} channel`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(oldChannel.toString())
            .setFooter({ text: `Channel ID: ${id}` })
            .setTimestamp();
        if (name1 !== name2)
            embed.addFields({
                name: 'Name',
                value: `${name1} ➜ ${name2}`,
            });
        if (parent1 !== parent2)
            embed.addFields({
                name: 'Category',
                value: `${parent1?.name || 'None'} ➜ ${parent2?.name || 'None'}`,
            });
        if (locked1 !== locked2)
            embed.addFields({
                name: 'Synched permissions',
                value: (0, utils_1.yesOrNo)(locked1),
            });
        const cache1 = permissions1.cache;
        const cache2 = permissions2.cache;
        let checked;
        if (cache1.size !== cache2.size) {
            const action = cache1.size > cache2.size ? 'Removed' : 'Added';
            const diff = cache1.difference(cache2).toJSON()[0];
            const targetManager = overwriteTypeMap[diff.type] + 's';
            const target = await guild[targetManager].fetch(diff.id).catch(() => null);
            if (target) {
                const mention = target.toString();
                const name = (0, discord_js_1.escapeMarkdown)(target instanceof discord_js_1.GuildMember ? target.user.tag : target.name);
                const emoji = (0, utils_1.customEmoji)(action === 'Added' ? 'check' : 'cross');
                embed.addFields({
                    name: `${emoji} ${action} permissions`,
                    value: `**${pixoll_commando_1.Util.capitalize(overwriteTypeMap[diff.type])}:** ${mention} ${name}`,
                });
            }
            checked = true;
        }
        for (const perms1 of cache1.toJSON()) {
            const perms2 = cache2.get(perms1.id);
            if (perms1.deny.bitfield === perms2?.deny.bitfield && perms1.allow.bitfield === perms2?.allow.bitfield)
                continue;
            if (checked)
                break;
            const targetManager = overwriteTypeMap[perms1.type] + 's';
            const target = await guild[targetManager].fetch(perms1.id).catch(() => null);
            const mention = target?.toString();
            const name = target
                ? (0, discord_js_1.escapeMarkdown)(target instanceof discord_js_1.GuildMember ? target.user.tag : target.name)
                : '';
            const [deny1, allow1] = format(perms1);
            const [deny2, allow2] = format(perms2);
            const [denied, removed1] = (0, utils_1.compareArrays)(deny1, deny2);
            const [allowed, removed2] = (0, utils_1.compareArrays)(allow1, allow2);
            const [neutral1] = (0, utils_1.compareArrays)(denied, removed2);
            const [neutral2] = (0, utils_1.compareArrays)(allowed, removed1);
            const neutral = [...neutral1, ...neutral2];
            embed.addFields({
                name: 'Updated permissions',
                value: `**${pixoll_commando_1.Util.capitalize(overwriteTypeMap[perms1.type])}:** ${mention} ${name}`,
            });
            const field = embed.data.fields?.find(f => f.name === 'Updated permissions');
            const addValue = (value) => {
                if (!field)
                    return;
                field.value += ('\n' + value);
            };
            if (denied.length !== 0)
                addValue(`${(0, utils_1.customEmoji)('cross')} **Denied:** ${denied.join(', ')}`);
            if (allowed.length !== 0)
                addValue(`${(0, utils_1.customEmoji)('check')} **Allowed:** ${allowed.join(', ')}`);
            if (neutral.length !== 0)
                addValue(`${(0, utils_1.customEmoji)('neutral')} **Neutral:** ${neutral.join(', ')}`);
            checked = true;
        }
        if (oldChannel.isTextBased() && newChannel.isTextBased()
            && !oldChannel.isVoiceBased() && !newChannel.isVoiceBased()) {
            const { nsfw: nsfw1, topic: topic1, defaultAutoArchiveDuration: autoArchive1 } = oldChannel;
            const { nsfw: nsfw2, topic: topic2, defaultAutoArchiveDuration: autoArchive2 } = newChannel;
            if (oldChannel.type !== newChannel.type)
                embed.addFields({
                    name: 'Type',
                    value: `${channelTypeMap[oldChannel.type]} ➜ ${channelTypeMap[newChannel.type]}`,
                });
            if (nsfw1 !== nsfw2)
                embed.addFields({
                    name: 'NSFW',
                    value: (0, utils_1.yesOrNo)(nsfw1),
                });
            if (topic1 && topic2 && topic1 !== topic2) {
                const slice1 = (0, utils_1.limitStringLength)(topic1, 475) || 'None';
                const slice2 = (0, utils_1.limitStringLength)(topic2, 475) || 'None';
                embed.addFields({
                    name: 'Topic',
                    value: (0, common_tags_1.stripIndent) `
                    **Before**\n${slice1}

                    **After**\n${slice2}
                    `,
                });
            }
            if (autoArchive1 !== autoArchive2) {
                const str1 = typeof autoArchive1 === 'number'
                    ? (0, better_ms_1.ms)(autoArchive1 * 60000, { long: true })
                    : pixoll_commando_1.Util.capitalize(autoArchive1 ?? '');
                const str2 = typeof autoArchive2 === 'number'
                    ? (0, better_ms_1.ms)(autoArchive2 * 60000, { long: true })
                    : pixoll_commando_1.Util.capitalize(autoArchive2 ?? '');
                embed.addFields({
                    name: 'Archive after inactivity',
                    value: `${str1} ➜ ${str2}`,
                });
            }
            if (oldChannel.type === discord_js_1.ChannelType.GuildText && newChannel.type === discord_js_1.ChannelType.GuildText) {
                const rate1 = oldChannel.rateLimitPerUser;
                const rate2 = newChannel.rateLimitPerUser;
                if (rate1 !== rate2) {
                    const slowmode1 = rate1 ? (0, better_ms_1.ms)(rate1 * 1000, { long: true }) : 'Off';
                    const slowmode2 = rate2 ? (0, better_ms_1.ms)(rate2 * 1000, { long: true }) : 'Off';
                    embed.addFields({
                        name: 'Slowmode',
                        value: `${slowmode1} ➜ ${slowmode2}`,
                    });
                }
            }
            if (embed.data.fields?.length !== 0) {
                guild.queuedLogs.push(embed);
                return;
            }
        }
        if (oldChannel.isVoiceBased() && newChannel.isVoiceBased()) {
            const { bitrate: bitrate1, rtcRegion: region1, userLimit: limit1 } = oldChannel;
            const { bitrate: bitrate2, rtcRegion: region2, userLimit: limit2 } = newChannel;
            if (bitrate1 !== bitrate2) {
                embed.addFields({
                    name: 'Bitrate',
                    value: bitrate1 / 1000 + 'kbps ➜ ' + bitrate2 / 1000 + 'kbps',
                });
            }
            if (region1 !== region2) {
                embed.addFields({
                    name: 'Region override',
                    value: `${rtcRegion(region1)} ➜ ${rtcRegion(region2)}`,
                });
            }
            if (limit1 !== limit2) {
                const limitStr1 = limit1 ? `${limit1} users` : 'No limit';
                const limitStr2 = limit2 ? `${limit2} users` : 'No limit';
                embed.addFields({
                    name: 'User limit',
                    value: `${limitStr1} ➜ ${limitStr2}`,
                });
            }
            if (embed.data.fields?.length !== 0) {
                guild.queuedLogs.push(embed);
                return;
            }
        }
        if (embed.data.fields?.length !== 0)
            guild.queuedLogs.push(embed);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9sb2dzL2NoYW5uZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQW1EO0FBQ25ELDJDQVFvQjtBQUNwQixxREFBdUQ7QUFDdkQsdUNBQTJHO0FBQzNHLHlDQUErQjtBQUUvQixNQUFNLGNBQWMsR0FBdUQ7SUFDdkUsQ0FBQyx3QkFBVyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsTUFBTTtJQUN2QyxDQUFDLHdCQUFXLENBQUMsYUFBYSxDQUFDLEVBQUUsVUFBVTtJQUN2QyxDQUFDLHdCQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsT0FBTztJQUNqQyxDQUFDLHdCQUFXLENBQUMsZUFBZSxDQUFDLEVBQUUsT0FBTztJQUN0QyxDQUFDLHdCQUFXLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTTtJQUMvQixDQUFDLHdCQUFXLENBQUMsVUFBVSxDQUFDLEVBQUUsT0FBTztDQUNwQyxDQUFDO0FBRUYsTUFBTSxnQkFBZ0IsR0FBaUU7SUFDbkYsQ0FBQywwQkFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVE7SUFDaEMsQ0FBQywwQkFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU07Q0FDL0IsQ0FBQztBQUlGLE1BQU0sWUFBWSxHQUEyQjtJQUN6QyxNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixRQUFRLEVBQUUsV0FBVztJQUNyQixLQUFLLEVBQUUsT0FBTztJQUNkLEtBQUssRUFBRSxPQUFPO0lBQ2QsTUFBTSxFQUFFLFFBQVE7SUFDaEIsU0FBUyxFQUFFLFdBQVc7SUFDdEIsV0FBVyxFQUFFLGNBQWM7SUFDM0IsTUFBTSxFQUFFLFFBQVE7SUFDaEIsWUFBWSxFQUFFLFlBQVk7SUFDMUIsU0FBUyxFQUFFLFNBQVM7SUFDcEIsVUFBVSxFQUFFLFVBQVU7SUFDdEIsU0FBUyxFQUFFLFNBQVM7Q0FDdkIsQ0FBQztBQUVGOzs7R0FHRztBQUNILFNBQVMsU0FBUyxDQUFDLE1BQXFCO0lBQ3BDLElBQUksQ0FBQyxNQUFNO1FBQUUsT0FBTyxXQUFXLENBQUM7SUFDaEMsT0FBTyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsTUFBTSxDQUFDLEtBQTRCO0lBQ3hDLE9BQU87UUFDSCxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHNCQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRTtRQUMvRCxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHNCQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRTtLQUNuRSxDQUFDO0FBQ04sQ0FBQztBQUVELHVDQUF1QztBQUN2QyxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO1FBQ3ZDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsb0JBQW9CLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDbEUsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLDRCQUFvQixFQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUUsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHVDQUF1QyxDQUFDLENBQUM7UUFFOUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFdkUsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxPQUFPLENBQUM7YUFDakIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLFdBQVcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxVQUFVO1lBQzdELE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksU0FBUztTQUM5RCxDQUFDO2FBQ0QsY0FBYyxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLFFBQVEsRUFBRSxDQUFDO2FBQ25ELFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsRUFBRSxFQUFFLENBQUM7YUFDeEMsWUFBWSxFQUFFLENBQUM7UUFFcEIsTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFDO1FBQzNCLEtBQUssTUFBTSxJQUFJLElBQUksb0JBQW9CLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ3BELE1BQU0sYUFBYSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFpQixDQUFDO1lBQ3RFLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25DLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUFFLFNBQVM7WUFFdEQsSUFBSSxJQUFJLEdBQUcsSUFBQSxxQkFBTyxFQUFBO29CQUNWLHNCQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLE1BQU0sRUFBRSxRQUFRLEVBQUU7a0JBQ3ZFLE1BQU0sWUFBWSx3QkFBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTthQUN6RCxDQUFDO1lBRUYsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsSUFBSSxJQUFJLEtBQUssSUFBQSxtQkFBVyxFQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzFGLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUFFLElBQUksSUFBSSxLQUFLLElBQUEsbUJBQVcsRUFBQyxPQUFPLENBQUMsaUJBQWlCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUU3RixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3BCO1FBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNwQixLQUFLLENBQUMsU0FBUyxDQUFDO2dCQUNaLElBQUksRUFBRSxhQUFhO2dCQUNuQixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBWTthQUNqQyxDQUFDLENBQUM7WUFFSCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUs7Z0JBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQztvQkFDdEMsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsS0FBSyxFQUFFLElBQUk7aUJBQ2QsQ0FBQyxDQUFDO1NBQ047UUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtRQUN2QyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFBRSxPQUFPO1FBQ2hDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ2xELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSw0QkFBb0IsRUFBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUV2QixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO1FBRTlELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsd0JBQXdCLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRXZFLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsUUFBUSxDQUFDO2FBQ2xCLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxXQUFXLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsVUFBVTtZQUM3RCxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLFNBQVM7U0FDOUQsQ0FBQzthQUNELGNBQWMsQ0FBQyxNQUFNLElBQUksTUFBTSxRQUFRLEVBQUUsQ0FBQzthQUMxQyxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLEVBQUUsRUFBRSxDQUFDO2FBQ3hDLFlBQVksRUFBRSxDQUFDO1FBRXBCLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLEVBQUMsT0FBTyxFQUFDLEVBQUU7UUFDM0MsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFO1lBQUUsT0FBTztRQUNoQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUM5QixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsNEJBQW9CLEVBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsMkNBQTJDLENBQUMsQ0FBQztRQUVsRSxNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDM0IsUUFBUSxDQUFDLE1BQU0sQ0FBQzthQUNoQixTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsc0JBQXNCO1lBQzVCLE9BQU8sRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLFNBQVM7U0FDdEUsQ0FBQzthQUNELGNBQWMsQ0FBQyxtQ0FBbUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7YUFDdkUsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxFQUFFLEVBQUUsQ0FBQzthQUN4QyxZQUFZLEVBQUUsQ0FBQztRQUVwQixLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEVBQUU7UUFDeEQsSUFBSSxVQUFVLENBQUMsU0FBUyxFQUFFLElBQUksVUFBVSxDQUFDLFNBQVMsRUFBRTtZQUFFLE9BQU87UUFFN0QsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLFVBQVUsQ0FBQztRQUM3QixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsNEJBQW9CLEVBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsdUNBQXVDLENBQUMsQ0FBQztRQUU5RCxNQUFNLEVBQ0YsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsRUFBRSxHQUNuRyxHQUFHLFVBQVUsQ0FBQztRQUNmLE1BQU0sRUFDRixJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLE9BQU8sR0FDL0YsR0FBRyxVQUFVLENBQUM7UUFFZixNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDM0IsUUFBUSxDQUFDLE1BQU0sQ0FBQzthQUNoQixTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsV0FBVyxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxVQUFVO1lBQ3hFLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksU0FBUztTQUM5RCxDQUFDO2FBQ0QsY0FBYyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNyQyxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLEVBQUUsRUFBRSxDQUFDO2FBQ3hDLFlBQVksRUFBRSxDQUFDO1FBRXBCLElBQUksS0FBSyxLQUFLLEtBQUs7WUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDO2dCQUNqQyxJQUFJLEVBQUUsTUFBTTtnQkFDWixLQUFLLEVBQUUsR0FBRyxLQUFLLE1BQU0sS0FBSyxFQUFFO2FBQy9CLENBQUMsQ0FBQztRQUVILElBQUksT0FBTyxLQUFLLE9BQU87WUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDO2dCQUNyQyxJQUFJLEVBQUUsVUFBVTtnQkFDaEIsS0FBSyxFQUFFLEdBQUcsT0FBTyxFQUFFLElBQUksSUFBSSxNQUFNLE1BQU0sT0FBTyxFQUFFLElBQUksSUFBSSxNQUFNLEVBQUU7YUFDbkUsQ0FBQyxDQUFDO1FBRUgsSUFBSSxPQUFPLEtBQUssT0FBTztZQUFFLEtBQUssQ0FBQyxTQUFTLENBQUM7Z0JBQ3JDLElBQUksRUFBRSxxQkFBcUI7Z0JBQzNCLEtBQUssRUFBRSxJQUFBLGVBQU8sRUFBQyxPQUFPLENBQUM7YUFDMUIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUNsQyxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO1FBQ2xDLElBQUksT0FBTyxDQUFDO1FBQ1osSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDN0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUUvRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRW5ELE1BQU0sYUFBYSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFpQixDQUFDO1lBQ3RFLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNFLElBQUksTUFBTSxFQUFFO2dCQUNSLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbEMsTUFBTSxJQUFJLEdBQUcsSUFBQSwyQkFBYyxFQUFDLE1BQU0sWUFBWSx3QkFBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzRixNQUFNLEtBQUssR0FBRyxJQUFBLG1CQUFXLEVBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFbEUsS0FBSyxDQUFDLFNBQVMsQ0FBQztvQkFDWixJQUFJLEVBQUUsR0FBRyxLQUFLLElBQUksTUFBTSxjQUFjO29CQUN0QyxLQUFLLEVBQUUsS0FBSyxzQkFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxPQUFPLElBQUksSUFBSSxFQUFFO2lCQUNuRixDQUFDLENBQUM7YUFDTjtZQUVELE9BQU8sR0FBRyxJQUFJLENBQUM7U0FDbEI7UUFFRCxLQUFLLE1BQU0sTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNsQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNyQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLE1BQU0sRUFBRSxLQUFLLENBQUMsUUFBUTtnQkFBRSxTQUFTO1lBQ2pILElBQUksT0FBTztnQkFBRSxNQUFNO1lBRW5CLE1BQU0sYUFBYSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFpQixDQUFDO1lBQ3hFLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdFLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBQztZQUNuQyxNQUFNLElBQUksR0FBRyxNQUFNO2dCQUNmLENBQUMsQ0FBQyxJQUFBLDJCQUFjLEVBQUMsTUFBTSxZQUFZLHdCQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUMvRSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRVQsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkMsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFdkMsTUFBTSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsR0FBRyxJQUFBLHFCQUFhLEVBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsSUFBQSxxQkFBYSxFQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUUxRCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBQSxxQkFBYSxFQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBQSxxQkFBYSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNwRCxNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQUcsUUFBUSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUM7WUFFM0MsS0FBSyxDQUFDLFNBQVMsQ0FBQztnQkFDWixJQUFJLEVBQUUscUJBQXFCO2dCQUMzQixLQUFLLEVBQUUsS0FBSyxzQkFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxPQUFPLElBQUksSUFBSSxFQUFFO2FBQ3JGLENBQUMsQ0FBQztZQUNILE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUsscUJBQXFCLENBQUMsQ0FBQztZQUU3RSxNQUFNLFFBQVEsR0FBRyxDQUFDLEtBQWEsRUFBUSxFQUFFO2dCQUNyQyxJQUFJLENBQUMsS0FBSztvQkFBRSxPQUFPO2dCQUNuQixLQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDO1lBQ2xDLENBQUMsQ0FBQztZQUVGLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUFFLFFBQVEsQ0FBQyxHQUFHLElBQUEsbUJBQVcsRUFBQyxPQUFPLENBQUMsZ0JBQWdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzlGLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUFFLFFBQVEsQ0FBQyxHQUFHLElBQUEsbUJBQVcsRUFBQyxPQUFPLENBQUMsaUJBQWlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pHLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUFFLFFBQVEsQ0FBQyxHQUFHLElBQUEsbUJBQVcsRUFBQyxTQUFTLENBQUMsaUJBQWlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRW5HLE9BQU8sR0FBRyxJQUFJLENBQUM7U0FDbEI7UUFFRCxJQUNJLFVBQVUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxVQUFVLENBQUMsV0FBVyxFQUFFO2VBQ2pELENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxFQUM3RDtZQUNFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsMEJBQTBCLEVBQUUsWUFBWSxFQUFFLEdBQUcsVUFBVSxDQUFDO1lBQzVGLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsMEJBQTBCLEVBQUUsWUFBWSxFQUFFLEdBQUcsVUFBVSxDQUFDO1lBRTVGLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsSUFBSTtnQkFBRSxLQUFLLENBQUMsU0FBUyxDQUFDO29CQUNyRCxJQUFJLEVBQUUsTUFBTTtvQkFDWixLQUFLLEVBQUUsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7aUJBQ25GLENBQUMsQ0FBQztZQUNILElBQUksS0FBSyxLQUFLLEtBQUs7Z0JBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQztvQkFDakMsSUFBSSxFQUFFLE1BQU07b0JBQ1osS0FBSyxFQUFFLElBQUEsZUFBTyxFQUFDLEtBQUssQ0FBQztpQkFDeEIsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUU7Z0JBQ3ZDLE1BQU0sTUFBTSxHQUFHLElBQUEseUJBQWlCLEVBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQztnQkFDeEQsTUFBTSxNQUFNLEdBQUcsSUFBQSx5QkFBaUIsRUFBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDO2dCQUV4RCxLQUFLLENBQUMsU0FBUyxDQUFDO29CQUNaLElBQUksRUFBRSxPQUFPO29CQUNiLEtBQUssRUFBRSxJQUFBLHlCQUFXLEVBQUE7a0NBQ0osTUFBTTs7aUNBRVAsTUFBTTtxQkFDbEI7aUJBQ0osQ0FBQyxDQUFDO2FBQ047WUFDRCxJQUFJLFlBQVksS0FBSyxZQUFZLEVBQUU7Z0JBQy9CLE1BQU0sSUFBSSxHQUFHLE9BQU8sWUFBWSxLQUFLLFFBQVE7b0JBQ3pDLENBQUMsQ0FBQyxJQUFBLGNBQUUsRUFBQyxZQUFZLEdBQUcsS0FBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO29CQUMzQyxDQUFDLENBQUMsc0JBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQyxNQUFNLElBQUksR0FBRyxPQUFPLFlBQVksS0FBSyxRQUFRO29CQUN6QyxDQUFDLENBQUMsSUFBQSxjQUFFLEVBQUMsWUFBWSxHQUFHLEtBQU0sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztvQkFDM0MsQ0FBQyxDQUFDLHNCQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDMUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztvQkFDWixJQUFJLEVBQUUsMEJBQTBCO29CQUNoQyxLQUFLLEVBQUUsR0FBRyxJQUFJLE1BQU0sSUFBSSxFQUFFO2lCQUM3QixDQUFDLENBQUM7YUFDTjtZQUVELElBQUksVUFBVSxDQUFDLElBQUksS0FBSyx3QkFBVyxDQUFDLFNBQVMsSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLHdCQUFXLENBQUMsU0FBUyxFQUFFO2dCQUN4RixNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzFDLE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDMUMsSUFBSSxLQUFLLEtBQUssS0FBSyxFQUFFO29CQUNqQixNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBRSxFQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO29CQUNuRSxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBRSxFQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO29CQUNuRSxLQUFLLENBQUMsU0FBUyxDQUFDO3dCQUNaLElBQUksRUFBRSxVQUFVO3dCQUNoQixLQUFLLEVBQUUsR0FBRyxTQUFTLE1BQU0sU0FBUyxFQUFFO3FCQUN2QyxDQUFDLENBQUM7aUJBQ047YUFDSjtZQUVELElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDakMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzdCLE9BQU87YUFDVjtTQUNKO1FBRUQsSUFBSSxVQUFVLENBQUMsWUFBWSxFQUFFLElBQUksVUFBVSxDQUFDLFlBQVksRUFBRSxFQUFFO1lBQ3hELE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxHQUFHLFVBQVUsQ0FBQztZQUNoRixNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUM7WUFFaEYsSUFBSSxRQUFRLEtBQUssUUFBUSxFQUFFO2dCQUN2QixLQUFLLENBQUMsU0FBUyxDQUFDO29CQUNaLElBQUksRUFBRSxTQUFTO29CQUNmLEtBQUssRUFBRSxRQUFRLEdBQUcsSUFBSSxHQUFHLFNBQVMsR0FBRyxRQUFRLEdBQUcsSUFBSSxHQUFHLE1BQU07aUJBQ2hFLENBQUMsQ0FBQzthQUNOO1lBQ0QsSUFBSSxPQUFPLEtBQUssT0FBTyxFQUFFO2dCQUNyQixLQUFLLENBQUMsU0FBUyxDQUFDO29CQUNaLElBQUksRUFBRSxpQkFBaUI7b0JBQ3ZCLEtBQUssRUFBRSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUU7aUJBQ3pELENBQUMsQ0FBQzthQUNOO1lBQ0QsSUFBSSxNQUFNLEtBQUssTUFBTSxFQUFFO2dCQUNuQixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztnQkFDMUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7Z0JBQzFELEtBQUssQ0FBQyxTQUFTLENBQUM7b0JBQ1osSUFBSSxFQUFFLFlBQVk7b0JBQ2xCLEtBQUssRUFBRSxHQUFHLFNBQVMsTUFBTSxTQUFTLEVBQUU7aUJBQ3ZDLENBQUMsQ0FBQzthQUNOO1lBRUQsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNqQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDN0IsT0FBTzthQUNWO1NBQ0o7UUFFRCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sS0FBSyxDQUFDO1lBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdEUsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBeFNELDRCQXdTQyJ9