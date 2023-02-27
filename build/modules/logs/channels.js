"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
const lodash_1 = require("lodash");
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
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'channels');
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
                **${(0, lodash_1.capitalize)(overwriteTypeMap[perm.type])}:** ${target?.toString()}
                ${target instanceof discord_js_1.GuildMember ? target.user.tag : ''}
            `;
            if (deny.length !== 0)
                base += `\n${(0, functions_1.customEmoji)('cross')} **Denied:** ${deny.join(', ')}`;
            if (allow.length !== 0)
                base += `\n${(0, functions_1.customEmoji)('check')} **Allowed:** ${allow.join(', ')}`;
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
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'channels');
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
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'channels');
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
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'channels');
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
                value: (0, functions_1.yesOrNo)(locked1),
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
                const emoji = (0, functions_1.customEmoji)(action === 'Added' ? 'check' : 'cross');
                embed.addFields({
                    name: `${emoji} ${action} permissions`,
                    value: `**${(0, lodash_1.capitalize)(overwriteTypeMap[diff.type])}:** ${mention} ${name}`,
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
            const [denied, removed1] = (0, functions_1.compareArrays)(deny1, deny2);
            const [allowed, removed2] = (0, functions_1.compareArrays)(allow1, allow2);
            const [neutral1] = (0, functions_1.compareArrays)(denied, removed2);
            const [neutral2] = (0, functions_1.compareArrays)(allowed, removed1);
            const neutral = [...neutral1, ...neutral2];
            embed.addFields({
                name: 'Updated permissions',
                value: `**${(0, lodash_1.capitalize)(overwriteTypeMap[perms1.type])}:** ${mention} ${name}`,
            });
            const field = embed.data.fields?.find(f => f.name === 'Updated permissions');
            const addValue = (value) => {
                if (!field)
                    return;
                field.value += ('\n' + value);
            };
            if (denied.length !== 0)
                addValue(`${(0, functions_1.customEmoji)('cross')} **Denied:** ${denied.join(', ')}`);
            if (allowed.length !== 0)
                addValue(`${(0, functions_1.customEmoji)('check')} **Allowed:** ${allowed.join(', ')}`);
            if (neutral.length !== 0)
                addValue(`${(0, functions_1.customEmoji)('neutral')} **Neutral:** ${neutral.join(', ')}`);
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
                    value: (0, functions_1.yesOrNo)(nsfw1),
                });
            if (topic1 && topic2 && topic1 !== topic2) {
                const slice1 = (0, functions_1.sliceDots)(topic1, 500) || 'None';
                const slice2 = (0, functions_1.sliceDots)(topic2, 500) || 'None';
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
                    : (0, lodash_1.capitalize)(autoArchive1);
                const str2 = typeof autoArchive2 === 'number'
                    ? (0, better_ms_1.ms)(autoArchive2 * 60000, { long: true })
                    : (0, lodash_1.capitalize)(autoArchive2);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbm5lbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9sb2dzL2NoYW5uZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQW1EO0FBQ25ELDJDQVFvQjtBQUNwQixxREFBdUQ7QUFDdkQscURBQTZHO0FBQzdHLG1DQUFvQztBQUNwQyx5Q0FBK0I7QUFFL0IsTUFBTSxjQUFjLEdBQXVEO0lBQ3ZFLENBQUMsd0JBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLE1BQU07SUFDdkMsQ0FBQyx3QkFBVyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFVBQVU7SUFDdkMsQ0FBQyx3QkFBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLE9BQU87SUFDakMsQ0FBQyx3QkFBVyxDQUFDLGVBQWUsQ0FBQyxFQUFFLE9BQU87SUFDdEMsQ0FBQyx3QkFBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU07SUFDL0IsQ0FBQyx3QkFBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLE9BQU87Q0FDcEMsQ0FBQztBQUVGLE1BQU0sZ0JBQWdCLEdBQWlFO0lBQ25GLENBQUMsMEJBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRO0lBQ2hDLENBQUMsMEJBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNO0NBQy9CLENBQUM7QUFJRixNQUFNLFlBQVksR0FBMkI7SUFDekMsTUFBTSxFQUFFLFFBQVE7SUFDaEIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsUUFBUSxFQUFFLFdBQVc7SUFDckIsS0FBSyxFQUFFLE9BQU87SUFDZCxLQUFLLEVBQUUsT0FBTztJQUNkLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLFNBQVMsRUFBRSxXQUFXO0lBQ3RCLFdBQVcsRUFBRSxjQUFjO0lBQzNCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLFlBQVksRUFBRSxZQUFZO0lBQzFCLFNBQVMsRUFBRSxTQUFTO0lBQ3BCLFVBQVUsRUFBRSxVQUFVO0lBQ3RCLFNBQVMsRUFBRSxTQUFTO0NBQ3ZCLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxTQUFTLFNBQVMsQ0FBQyxNQUFxQjtJQUNwQyxJQUFJLENBQUMsTUFBTTtRQUFFLE9BQU8sV0FBVyxDQUFDO0lBQ2hDLE9BQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLE1BQU0sQ0FBQyxLQUE0QjtJQUN4QyxPQUFPO1FBQ0gsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxzQkFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUU7UUFDL0QsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxzQkFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUU7S0FDbkUsQ0FBQztBQUNOLENBQUM7QUFFRCx1Q0FBdUM7QUFDdkMsbUJBQXlCLE1BQTRCO0lBQ2pELE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtRQUN2QyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLG9CQUFvQixFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ2xFLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSxnQ0FBb0IsRUFBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUV2QixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO1FBRTlELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsd0JBQXdCLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRXZFLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsT0FBTyxDQUFDO2FBQ2pCLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxXQUFXLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsVUFBVTtZQUM3RCxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLFNBQVM7U0FDOUQsQ0FBQzthQUNELGNBQWMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxRQUFRLEVBQUUsQ0FBQzthQUNuRCxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLEVBQUUsRUFBRSxDQUFDO2FBQ3hDLFlBQVksRUFBRSxDQUFDO1FBRXBCLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNqQixLQUFLLE1BQU0sSUFBSSxJQUFJLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNwRCxNQUFNLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBaUIsQ0FBQztZQUN0RSxNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuQyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxTQUFTO1lBRXRELElBQUksSUFBSSxHQUFHLElBQUEscUJBQU8sRUFBQTtvQkFDVixJQUFBLG1CQUFVLEVBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sTUFBTSxFQUFFLFFBQVEsRUFBRTtrQkFDbEUsTUFBTSxZQUFZLHdCQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO2FBQ3pELENBQUM7WUFFRixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxJQUFJLElBQUksS0FBSyxJQUFBLHVCQUFXLEVBQUMsT0FBTyxDQUFDLGdCQUFnQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDMUYsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsSUFBSSxJQUFJLEtBQUssSUFBQSx1QkFBVyxFQUFDLE9BQU8sQ0FBQyxpQkFBaUIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBRTdGLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDcEI7UUFFRCxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3BCLEtBQUssQ0FBQyxTQUFTLENBQUM7Z0JBQ1osSUFBSSxFQUFFLGFBQWE7Z0JBQ25CLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFZO2FBQ2pDLENBQUMsQ0FBQztZQUVILEtBQUssTUFBTSxJQUFJLElBQUksS0FBSztnQkFBRSxLQUFLLENBQUMsU0FBUyxDQUFDO29CQUN0QyxJQUFJLEVBQUUsUUFBUTtvQkFDZCxLQUFLLEVBQUUsSUFBSTtpQkFDZCxDQUFDLENBQUM7U0FDTjtRQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO1FBQ3ZDLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUFFLE9BQU87UUFDaEMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDbEQsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLGdDQUFvQixFQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUUsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHVDQUF1QyxDQUFDLENBQUM7UUFFOUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFdkUsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxRQUFRLENBQUM7YUFDbEIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLFdBQVcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxVQUFVO1lBQzdELE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksU0FBUztTQUM5RCxDQUFDO2FBQ0QsY0FBYyxDQUFDLE1BQU0sSUFBSSxNQUFNLFFBQVEsRUFBRSxDQUFDO2FBQzFDLFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsRUFBRSxFQUFFLENBQUM7YUFDeEMsWUFBWSxFQUFFLENBQUM7UUFFcEIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtRQUMzQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFBRSxPQUFPO1FBQ2hDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzlCLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSxnQ0FBb0IsRUFBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUV2QixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSwyQ0FBMkMsQ0FBQyxDQUFDO1FBRWxFLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsTUFBTSxDQUFDO2FBQ2hCLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxzQkFBc0I7WUFDNUIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksU0FBUztTQUN0RSxDQUFDO2FBQ0QsY0FBYyxDQUFDLG1DQUFtQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQzthQUN2RSxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLEVBQUUsRUFBRSxDQUFDO2FBQ3hDLFlBQVksRUFBRSxDQUFDO1FBRXBCLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsRUFBRTtRQUN4RCxJQUFJLFVBQVUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxVQUFVLENBQUMsU0FBUyxFQUFFO1lBQUUsT0FBTztRQUU3RCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsVUFBVSxDQUFDO1FBQzdCLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSxnQ0FBb0IsRUFBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUV2QixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO1FBRTlELE1BQU0sRUFDRixJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxFQUFFLEdBQ25HLEdBQUcsVUFBVSxDQUFDO1FBQ2YsTUFBTSxFQUNGLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxHQUMvRixHQUFHLFVBQVUsQ0FBQztRQUVmLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsTUFBTSxDQUFDO2FBQ2hCLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxXQUFXLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLFVBQVU7WUFDeEUsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxTQUFTO1NBQzlELENBQUM7YUFDRCxjQUFjLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3JDLFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsRUFBRSxFQUFFLENBQUM7YUFDeEMsWUFBWSxFQUFFLENBQUM7UUFFcEIsSUFBSSxLQUFLLEtBQUssS0FBSztZQUFFLEtBQUssQ0FBQyxTQUFTLENBQUM7Z0JBQ2pDLElBQUksRUFBRSxNQUFNO2dCQUNaLEtBQUssRUFBRSxHQUFHLEtBQUssTUFBTSxLQUFLLEVBQUU7YUFDL0IsQ0FBQyxDQUFDO1FBRUgsSUFBSSxPQUFPLEtBQUssT0FBTztZQUFFLEtBQUssQ0FBQyxTQUFTLENBQUM7Z0JBQ3JDLElBQUksRUFBRSxVQUFVO2dCQUNoQixLQUFLLEVBQUUsR0FBRyxPQUFPLEVBQUUsSUFBSSxJQUFJLE1BQU0sTUFBTSxPQUFPLEVBQUUsSUFBSSxJQUFJLE1BQU0sRUFBRTthQUNuRSxDQUFDLENBQUM7UUFFSCxJQUFJLE9BQU8sS0FBSyxPQUFPO1lBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQztnQkFDckMsSUFBSSxFQUFFLHFCQUFxQjtnQkFDM0IsS0FBSyxFQUFFLElBQUEsbUJBQU8sRUFBQyxPQUFPLENBQUM7YUFDMUIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUNsQyxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO1FBQ2xDLElBQUksT0FBTyxDQUFDO1FBQ1osSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDN0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztZQUUvRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRW5ELE1BQU0sYUFBYSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFpQixDQUFDO1lBQ3RFLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNFLElBQUksTUFBTSxFQUFFO2dCQUNSLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbEMsTUFBTSxJQUFJLEdBQUcsSUFBQSwyQkFBYyxFQUFDLE1BQU0sWUFBWSx3QkFBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzRixNQUFNLEtBQUssR0FBRyxJQUFBLHVCQUFXLEVBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFbEUsS0FBSyxDQUFDLFNBQVMsQ0FBQztvQkFDWixJQUFJLEVBQUUsR0FBRyxLQUFLLElBQUksTUFBTSxjQUFjO29CQUN0QyxLQUFLLEVBQUUsS0FBSyxJQUFBLG1CQUFVLEVBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sT0FBTyxJQUFJLElBQUksRUFBRTtpQkFDOUUsQ0FBQyxDQUFDO2FBQ047WUFFRCxPQUFPLEdBQUcsSUFBSSxDQUFDO1NBQ2xCO1FBRUQsS0FBSyxNQUFNLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDbEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsS0FBSyxNQUFNLEVBQUUsS0FBSyxDQUFDLFFBQVE7Z0JBQUUsU0FBUztZQUNqSCxJQUFJLE9BQU87Z0JBQUUsTUFBTTtZQUVuQixNQUFNLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBaUIsQ0FBQztZQUN4RSxNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3RSxNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUM7WUFDbkMsTUFBTSxJQUFJLEdBQUcsTUFBTTtnQkFDZixDQUFDLENBQUMsSUFBQSwyQkFBYyxFQUFDLE1BQU0sWUFBWSx3QkFBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDL0UsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVULE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXZDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUcsSUFBQSx5QkFBYSxFQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLElBQUEseUJBQWEsRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFMUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUEseUJBQWEsRUFBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUEseUJBQWEsRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDcEQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLFFBQVEsRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDO1lBRTNDLEtBQUssQ0FBQyxTQUFTLENBQUM7Z0JBQ1osSUFBSSxFQUFFLHFCQUFxQjtnQkFDM0IsS0FBSyxFQUFFLEtBQUssSUFBQSxtQkFBVSxFQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLE9BQU8sSUFBSSxJQUFJLEVBQUU7YUFDaEYsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxxQkFBcUIsQ0FBQyxDQUFDO1lBRTdFLE1BQU0sUUFBUSxHQUFHLENBQUMsS0FBYSxFQUFRLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxLQUFLO29CQUFFLE9BQU87Z0JBQ25CLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDO1lBRUYsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsUUFBUSxDQUFDLEdBQUcsSUFBQSx1QkFBVyxFQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDOUYsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsUUFBUSxDQUFDLEdBQUcsSUFBQSx1QkFBVyxFQUFDLE9BQU8sQ0FBQyxpQkFBaUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakcsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsUUFBUSxDQUFDLEdBQUcsSUFBQSx1QkFBVyxFQUFDLFNBQVMsQ0FBQyxpQkFBaUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFbkcsT0FBTyxHQUFHLElBQUksQ0FBQztTQUNsQjtRQUVELElBQ0ksVUFBVSxDQUFDLFdBQVcsRUFBRSxJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUU7ZUFDakQsQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLEVBQzdEO1lBQ0UsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSwwQkFBMEIsRUFBRSxZQUFZLEVBQUUsR0FBRyxVQUFVLENBQUM7WUFDNUYsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSwwQkFBMEIsRUFBRSxZQUFZLEVBQUUsR0FBRyxVQUFVLENBQUM7WUFFNUYsSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxJQUFJO2dCQUFFLEtBQUssQ0FBQyxTQUFTLENBQUM7b0JBQ3JELElBQUksRUFBRSxNQUFNO29CQUNaLEtBQUssRUFBRSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtpQkFDbkYsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxLQUFLLEtBQUssS0FBSztnQkFBRSxLQUFLLENBQUMsU0FBUyxDQUFDO29CQUNqQyxJQUFJLEVBQUUsTUFBTTtvQkFDWixLQUFLLEVBQUUsSUFBQSxtQkFBTyxFQUFDLEtBQUssQ0FBQztpQkFDeEIsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUU7Z0JBQ3ZDLE1BQU0sTUFBTSxHQUFHLElBQUEscUJBQVMsRUFBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDO2dCQUNoRCxNQUFNLE1BQU0sR0FBRyxJQUFBLHFCQUFTLEVBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQztnQkFFaEQsS0FBSyxDQUFDLFNBQVMsQ0FBQztvQkFDWixJQUFJLEVBQUUsT0FBTztvQkFDYixLQUFLLEVBQUUsSUFBQSx5QkFBVyxFQUFBO2tDQUNKLE1BQU07O2lDQUVQLE1BQU07cUJBQ2xCO2lCQUNKLENBQUMsQ0FBQzthQUNOO1lBQ0QsSUFBSSxZQUFZLEtBQUssWUFBWSxFQUFFO2dCQUMvQixNQUFNLElBQUksR0FBRyxPQUFPLFlBQVksS0FBSyxRQUFRO29CQUN6QyxDQUFDLENBQUMsSUFBQSxjQUFFLEVBQUMsWUFBWSxHQUFHLEtBQU0sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztvQkFDM0MsQ0FBQyxDQUFDLElBQUEsbUJBQVUsRUFBQyxZQUFZLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxZQUFZLEtBQUssUUFBUTtvQkFDekMsQ0FBQyxDQUFDLElBQUEsY0FBRSxFQUFDLFlBQVksR0FBRyxLQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7b0JBQzNDLENBQUMsQ0FBQyxJQUFBLG1CQUFVLEVBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQy9CLEtBQUssQ0FBQyxTQUFTLENBQUM7b0JBQ1osSUFBSSxFQUFFLDBCQUEwQjtvQkFDaEMsS0FBSyxFQUFFLEdBQUcsSUFBSSxNQUFNLElBQUksRUFBRTtpQkFDN0IsQ0FBQyxDQUFDO2FBQ047WUFFRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssd0JBQVcsQ0FBQyxTQUFTLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyx3QkFBVyxDQUFDLFNBQVMsRUFBRTtnQkFDeEYsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDO2dCQUMxQyxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzFDLElBQUksS0FBSyxLQUFLLEtBQUssRUFBRTtvQkFDakIsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQUUsRUFBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztvQkFDbkUsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQUUsRUFBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztvQkFDbkUsS0FBSyxDQUFDLFNBQVMsQ0FBQzt3QkFDWixJQUFJLEVBQUUsVUFBVTt3QkFDaEIsS0FBSyxFQUFFLEdBQUcsU0FBUyxNQUFNLFNBQVMsRUFBRTtxQkFDdkMsQ0FBQyxDQUFDO2lCQUNOO2FBQ0o7WUFFRCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ2pDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM3QixPQUFPO2FBQ1Y7U0FDSjtRQUVELElBQUksVUFBVSxDQUFDLFlBQVksRUFBRSxJQUFJLFVBQVUsQ0FBQyxZQUFZLEVBQUUsRUFBRTtZQUN4RCxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUM7WUFDaEYsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDO1lBRWhGLElBQUksUUFBUSxLQUFLLFFBQVEsRUFBRTtnQkFDdkIsS0FBSyxDQUFDLFNBQVMsQ0FBQztvQkFDWixJQUFJLEVBQUUsU0FBUztvQkFDZixLQUFLLEVBQUUsUUFBUSxHQUFHLElBQUksR0FBRyxTQUFTLEdBQUcsUUFBUSxHQUFHLElBQUksR0FBRyxNQUFNO2lCQUNoRSxDQUFDLENBQUM7YUFDTjtZQUNELElBQUksT0FBTyxLQUFLLE9BQU8sRUFBRTtnQkFDckIsS0FBSyxDQUFDLFNBQVMsQ0FBQztvQkFDWixJQUFJLEVBQUUsaUJBQWlCO29CQUN2QixLQUFLLEVBQUUsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2lCQUN6RCxDQUFDLENBQUM7YUFDTjtZQUNELElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRTtnQkFDbkIsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7Z0JBQzFELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO2dCQUMxRCxLQUFLLENBQUMsU0FBUyxDQUFDO29CQUNaLElBQUksRUFBRSxZQUFZO29CQUNsQixLQUFLLEVBQUUsR0FBRyxTQUFTLE1BQU0sU0FBUyxFQUFFO2lCQUN2QyxDQUFDLENBQUM7YUFDTjtZQUVELElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDakMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzdCLE9BQU87YUFDVjtTQUNKO1FBRUQsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEtBQUssQ0FBQztZQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3RFLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQXhTRCw0QkF3U0MifQ==