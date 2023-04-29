import { stripIndent, oneLine } from 'common-tags';
import {
    EmbedBuilder,
    GuildMember,
    PermissionOverwrites,
    escapeMarkdown,
    NonThreadGuildBasedChannel,
    ChannelType,
    OverwriteType,
} from 'discord.js';
import { CommandoClient, Util } from 'pixoll-commando';
import { compareArrays, limitStringLength, customEmoji, isGuildModuleEnabled, yesOrNo } from '../../utils';
import { ms } from 'better-ms';

const channelTypeMap: Record<NonThreadGuildBasedChannel['type'], string> = {
    [ChannelType.GuildAnnouncement]: 'News',
    [ChannelType.GuildCategory]: 'Category',
    [ChannelType.GuildForum]: 'Forum',
    [ChannelType.GuildStageVoice]: 'Stage',
    [ChannelType.GuildText]: 'Text',
    [ChannelType.GuildVoice]: 'Voice',
};

const overwriteTypeMap: Record<OverwriteType, Lowercase<keyof typeof OverwriteType>> = {
    [OverwriteType.Member]: 'member',
    [OverwriteType.Role]: 'role',
};

type ManagerKey = `${Lowercase<keyof typeof OverwriteType>}s`;

const rtcRegionMap: Record<string, string> = {
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
function rtcRegion(region: string | null): string {
    if (!region) return 'Automatic';
    return rtcRegionMap[region];
}

/**
 * Formats the {@link PermissionOverwrites} into an array of string
 * @param perms The permissions to format
 */
function format(perms?: PermissionOverwrites): [string[], string[]] {
    return [
        perms?.deny.toArray().map(perm => Util.permissions[perm]) || [],
        perms?.allow.toArray().map(perm => Util.permissions[perm]) || [],
    ];
}

/** Handles all of the channel logs. */
export default function (client: CommandoClient<true>): void {
    client.on('channelCreate', async channel => {
        const { guild, id, type, parent, permissionOverwrites } = channel;
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'channels');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/channels#create".');

        const category = parent ? `under the category \`${parent.name}\`` : '';

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({
                name: `Created ${channelTypeMap[type].toLowerCase()} channel`,
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(`${channel.toString()} ${category}`)
            .setFooter({ text: `Channel ID: ${id}` })
            .setTimestamp();

        const perms: string[] = [];
        for (const perm of permissionOverwrites.cache.toJSON()) {
            const targetManager = overwriteTypeMap[perm.type] + 's' as ManagerKey;
            const target = await guild[targetManager].fetch(perm.id).catch(() => null);
            const [deny, allow] = format(perm);
            if (deny.length === 0 && allow.length === 0) continue;

            let base = oneLine`
                **${Util.capitalize(overwriteTypeMap[perm.type])}:** ${target?.toString()}
                ${target instanceof GuildMember ? target.user.tag : ''}
            `;

            if (deny.length !== 0) base += `\n${customEmoji('cross')} **Denied:** ${deny.join(', ')}`;
            if (allow.length !== 0) base += `\n${customEmoji('check')} **Allowed:** ${allow.join(', ')}`;

            perms.push(base);
        }

        if (perms.length !== 0) {
            embed.addFields({
                name: 'Permissions',
                value: perms.shift() as string,
            });

            for (const perm of perms) embed.addFields({
                name: '\u2800',
                value: perm,
            });
        }

        guild.queuedLogs.push(embed);
    });

    client.on('channelDelete', async channel => {
        if (channel.isDMBased()) return;
        const { guild, id, name, type, parent } = channel;
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'channels');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/channels#delete".');

        const category = parent ? `under the category \`${parent.name}\`` : '';

        const embed = new EmbedBuilder()
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

    client.on('channelPinsUpdate', async channel => {
        if (channel.isDMBased()) return;
        const { guild, id } = channel;
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'channels');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/channels#pinsUpdate".');

        const embed = new EmbedBuilder()
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
        if (oldChannel.isDMBased() || newChannel.isDMBased()) return;

        const { guild } = oldChannel;
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'channels');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/channels#update".');

        const {
            name: name1, parent: parent1, permissionOverwrites: permissions1, permissionsLocked: locked1, id,
        } = oldChannel;
        const {
            name: name2, parent: parent2, permissionOverwrites: permissions2, permissionsLocked: locked2,
        } = newChannel;

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: `Updated ${channelTypeMap[oldChannel.type].toLowerCase()} channel`,
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(oldChannel.toString())
            .setFooter({ text: `Channel ID: ${id}` })
            .setTimestamp();

        if (name1 !== name2) embed.addFields({
            name: 'Name',
            value: `${name1} ➜ ${name2}`,
        });

        if (parent1 !== parent2) embed.addFields({
            name: 'Category',
            value: `${parent1?.name || 'None'} ➜ ${parent2?.name || 'None'}`,
        });

        if (locked1 !== locked2) embed.addFields({
            name: 'Synched permissions',
            value: yesOrNo(locked1),
        });

        const cache1 = permissions1.cache;
        const cache2 = permissions2.cache;
        let checked;
        if (cache1.size !== cache2.size) {
            const action = cache1.size > cache2.size ? 'Removed' : 'Added';

            const diff = cache1.difference(cache2).toJSON()[0];

            const targetManager = overwriteTypeMap[diff.type] + 's' as ManagerKey;
            const target = await guild[targetManager].fetch(diff.id).catch(() => null);
            if (target) {
                const mention = target.toString();
                const name = escapeMarkdown(target instanceof GuildMember ? target.user.tag : target.name);
                const emoji = customEmoji(action === 'Added' ? 'check' : 'cross');

                embed.addFields({
                    name: `${emoji} ${action} permissions`,
                    value: `**${Util.capitalize(overwriteTypeMap[diff.type])}:** ${mention} ${name}`,
                });
            }

            checked = true;
        }

        for (const perms1 of cache1.toJSON()) {
            const perms2 = cache2.get(perms1.id);
            if (perms1.deny.bitfield === perms2?.deny.bitfield && perms1.allow.bitfield === perms2?.allow.bitfield) continue;
            if (checked) break;

            const targetManager = overwriteTypeMap[perms1.type] + 's' as ManagerKey;
            const target = await guild[targetManager].fetch(perms1.id).catch(() => null);

            const mention = target?.toString();
            const name = target
                ? escapeMarkdown(target instanceof GuildMember ? target.user.tag : target.name)
                : '';

            const [deny1, allow1] = format(perms1);
            const [deny2, allow2] = format(perms2);

            const [denied, removed1] = compareArrays(deny1, deny2);
            const [allowed, removed2] = compareArrays(allow1, allow2);

            const [neutral1] = compareArrays(denied, removed2);
            const [neutral2] = compareArrays(allowed, removed1);
            const neutral = [...neutral1, ...neutral2];

            embed.addFields({
                name: 'Updated permissions',
                value: `**${Util.capitalize(overwriteTypeMap[perms1.type])}:** ${mention} ${name}`,
            });
            const field = embed.data.fields?.find(f => f.name === 'Updated permissions');

            const addValue = (value: string): void => {
                if (!field) return;
                field.value += ('\n' + value);
            };

            if (denied.length !== 0) addValue(`${customEmoji('cross')} **Denied:** ${denied.join(', ')}`);
            if (allowed.length !== 0) addValue(`${customEmoji('check')} **Allowed:** ${allowed.join(', ')}`);
            if (neutral.length !== 0) addValue(`${customEmoji('neutral')} **Neutral:** ${neutral.join(', ')}`);

            checked = true;
        }

        if (
            oldChannel.isTextBased() && newChannel.isTextBased()
            && !oldChannel.isVoiceBased() && !newChannel.isVoiceBased()
        ) {
            const { nsfw: nsfw1, topic: topic1, defaultAutoArchiveDuration: autoArchive1 } = oldChannel;
            const { nsfw: nsfw2, topic: topic2, defaultAutoArchiveDuration: autoArchive2 } = newChannel;

            if (oldChannel.type !== newChannel.type) embed.addFields({
                name: 'Type',
                value: `${channelTypeMap[oldChannel.type]} ➜ ${channelTypeMap[newChannel.type]}`,
            });
            if (nsfw1 !== nsfw2) embed.addFields({
                name: 'NSFW',
                value: yesOrNo(nsfw1),
            });
            if (topic1 && topic2 && topic1 !== topic2) {
                const slice1 = limitStringLength(topic1, 475) || 'None';
                const slice2 = limitStringLength(topic2, 475) || 'None';

                embed.addFields({
                    name: 'Topic',
                    value: stripIndent`
                    **Before**\n${slice1}

                    **After**\n${slice2}
                    `,
                });
            }
            if (autoArchive1 !== autoArchive2) {
                const str1 = typeof autoArchive1 === 'number'
                    ? ms(autoArchive1 * 60_000, { long: true })
                    : Util.capitalize(autoArchive1 ?? '');
                const str2 = typeof autoArchive2 === 'number'
                    ? ms(autoArchive2 * 60_000, { long: true })
                    : Util.capitalize(autoArchive2 ?? '');
                embed.addFields({
                    name: 'Archive after inactivity',
                    value: `${str1} ➜ ${str2}`,
                });
            }

            if (oldChannel.type === ChannelType.GuildText && newChannel.type === ChannelType.GuildText) {
                const rate1 = oldChannel.rateLimitPerUser;
                const rate2 = newChannel.rateLimitPerUser;
                if (rate1 !== rate2) {
                    const slowmode1 = rate1 ? ms(rate1 * 1000, { long: true }) : 'Off';
                    const slowmode2 = rate2 ? ms(rate2 * 1000, { long: true }) : 'Off';
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

        if (embed.data.fields?.length !== 0) guild.queuedLogs.push(embed);
    });
}
