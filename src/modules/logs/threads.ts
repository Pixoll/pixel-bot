import { oneLine, stripIndent } from 'common-tags';
import { ChannelType, EmbedBuilder, ThreadAutoArchiveDuration, ThreadChannel } from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { isGuildModuleEnabled, timestamp, yesOrNo } from '../../utils';
import { ms } from 'better-ms';

type RelevantChannelTypes = NonNullable<ThreadChannel['parent']>['type'] | ThreadChannel['type'];

const channelTypeMap: Record<RelevantChannelTypes, string> = {
    [ChannelType.AnnouncementThread]: 'Announcement thread',
    [ChannelType.PublicThread]: 'Public thread',
    [ChannelType.PrivateThread]: 'Private thread',
    [ChannelType.GuildAnnouncement]: 'News',
    [ChannelType.GuildForum]: 'Forum',
    [ChannelType.GuildText]: 'Text',
};

const threadAutoArchiveDurationMap: Record<ThreadAutoArchiveDuration, string> = {
    [ThreadAutoArchiveDuration.OneDay]: 'One day',
    [ThreadAutoArchiveDuration.OneHour]: 'One hour',
    [ThreadAutoArchiveDuration.OneWeek]: 'One week',
    [ThreadAutoArchiveDuration.ThreeDays]: 'Three days',
};

/** Handles all of the thread logs. */
export default function (client: CommandoClient<true>): void {
    client.on('threadCreate', async thread => {
        const { guild, type, parent, id, autoArchiveDuration } = thread;
        if (thread.joinable && !thread.joined) {
            await thread.join().catch(() => false);
        }

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'threads');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/threads#create".');

        const { guildMember } = await thread.fetchOwner() ?? {};
        const channelType = channelTypeMap[type];

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({
                name: `Created ${channelType} channel`,
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(stripIndent`
                ${oneLine`
                ${guildMember?.toString()} created ${channelType} ${thread.toString()}
                ${parent ? `under ${channelTypeMap[parent.type]} channel ${parent.toString()}` : ''}
                `}
                ${autoArchiveDuration ? oneLine`
                **Auto-archiving ${timestamp(Date.now() + (autoArchiveDuration * 60_000), 'R')}**
                ` : ''}
            `)
            .setFooter({ text: `Thread ID: ${id} • Parent ID: ${parent?.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('threadDelete', async thread => {
        const { guild, type, parent, id, name, members } = thread;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'threads');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/threads#delete".');

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
                name: `Deleted ${channelTypeMap[type]} channel`,
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(stripIndent`
                ${parent ? `\`#${name}\` under ${channelTypeMap[parent.type]} channel ${parent.toString()}` : ''}
                **Member count:** ${members.cache.size}
            `)
            .setFooter({ text: `Thread ID: ${id} • Parent ID: ${parent?.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('threadUpdate', async (oldThread, newThread) => {
        const { guild } = newThread;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'threads');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/threads#update".');

        const {
            autoArchiveDuration: autoArchive1, archived: archived1, name: name1, locked: locked1,
            rateLimitPerUser: rateLimit1,
        } = oldThread;
        const {
            autoArchiveDuration: autoArchive2, archived: archived2, name: name2, locked: locked2,
            rateLimitPerUser: rateLimit2, id, parentId, type,
        } = newThread;

        const embed = new EmbedBuilder()
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

        if (archived1 !== archived2) embed.addFields({
            name: 'Archived',
            value: yesOrNo(archived1),
        });

        if (name1 !== name2) embed.addFields({
            name: 'Name',
            value: `${name1} ➜ ${name2}`,
        });

        if (locked1 !== locked2) embed.addFields({
            name: 'Anyone can unarchive',
            value: yesOrNo(locked2),
        });

        if (rateLimit1 !== rateLimit2) {
            const slowmode1 = rateLimit1 ? ms(rateLimit1 * 1000, { long: true }) : 'Off';
            const slowmode2 = rateLimit2 ? ms(rateLimit2 * 1000, { long: true }) : 'Off';
            embed.addFields({
                name: 'Slowmode',
                value: `${slowmode1} ➜ ${slowmode2}`,
            });
        }

        if (embed.data.fields?.length !== 0) guild.queuedLogs.push(embed);
    });
}
