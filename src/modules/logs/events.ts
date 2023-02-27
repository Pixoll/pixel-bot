import { stripIndent } from 'common-tags';
import { EmbedBuilder, GuildScheduledEventStatus } from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { isGuildModuleEnabled, timestamp } from '../../utils/functions';

const eventStatusMap: Record<GuildScheduledEventStatus, string> = {
    [GuildScheduledEventStatus.Scheduled]: 'Scheduled',
    [GuildScheduledEventStatus.Active]: 'Active',
    [GuildScheduledEventStatus.Completed]: 'Completed',
    [GuildScheduledEventStatus.Canceled]: 'Canceled',
};

/** Handles all of the events logs. */
export default function (client: CommandoClient<true>): void {
    client.on('guildScheduledEventCreate', async (event) => {
        const {
            guild, id, name, channel, creator, description, scheduledEndAt, scheduledStartAt, url, entityMetadata,
        } = event;
        if (!guild) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'events');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/events#create".');

        const embedDescription = stripIndent`
            **Name:** ${name}
            ${channel ? `**Channel:** ${channel.toString()}` : `**Location:** ${entityMetadata?.location}`}
            **Creator:** ${creator?.toString()} ${creator?.tag}
            **Starting:** ${timestamp(scheduledStartAt ?? 0)} (${timestamp(scheduledStartAt ?? 0, 'R')})
            ${scheduledEndAt ? `**Ending:** ${timestamp(scheduledEndAt)} (${timestamp(scheduledEndAt, 'R')})` : ''}
        `;

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({
                name: 'Created event',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
                url,
            })
            .setDescription(embedDescription)
            .setFooter({ text: `Event ID: ${id}` })
            .setTimestamp();

        if (description) embed.addFields({
            name: 'Description',
            value: description,
        });

        guild.queuedLogs.push(embed);
    });

    client.on('guildScheduledEventDelete', async (event) => {
        const { guild, id, name, channel, creator, scheduledEndAt, scheduledStartAt, url, entityMetadata } = event;
        if (!guild) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'events');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/events#delete".');

        const embedDescription = stripIndent`
            **Name:** ${name}
            ${channel ? `**Channel:** ${channel.toString()}` : `**Location:** ${entityMetadata?.location}`}
            **Creator:** ${creator?.toString()} ${creator?.tag}
            **Starting:** ${timestamp(scheduledStartAt ?? 0)} (${timestamp(scheduledStartAt ?? 0, 'R')})
            ${scheduledEndAt ? `**Ending:** ${timestamp(scheduledEndAt)} (${timestamp(scheduledEndAt, 'R')})` : ''}
        `;

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
                name: 'Deleted event',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
                url,
            })
            .setDescription(embedDescription)
            .setFooter({ text: `Event ID: ${id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('guildScheduledEventUpdate', async (oldEvent, newEvent) => {
        const { guild, id, url } = newEvent;
        if (!guild) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'events');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/events#update".');

        const {
            name: name1, description: description1, channel: channel1, entityMetadata: metadata1, scheduledStartAt: startAt1,
            scheduledEndAt: endAt1, status: status1,
        } = oldEvent ?? {};
        const {
            name: name2, description: description2, channel: channel2, entityMetadata: metadata2, scheduledStartAt: startAt2,
            scheduledEndAt: endAt2, status: status2,
        } = newEvent;

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: 'Updated event',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
                url,
            })
            .setFooter({ text: `Event ID: ${id}` })
            .setTimestamp();

        if (name1 !== name2) embed.addFields({
            name: 'Name',
            value: `${name1} ➜ ${name2}`,
        });

        if (description1 !== description2) embed.addFields({
            name: 'Description',
            value: `${description1 || 'None'} ➜ ${description2 || 'None'}`,
        });

        if (startAt1 !== startAt2) embed.addFields({
            name: 'Starting date',
            value: `${timestamp(startAt1 ?? 0)} ➜ ${timestamp(startAt2 ?? 0)}`,
        });

        if (endAt1 !== endAt2) embed.addFields({
            name: 'Ending date',
            value: `${timestamp(endAt1 ?? 0) || 'None'} ➜ ${timestamp(endAt2 ?? 0)}`,
        });

        if (status1 !== status2) embed.addFields({
            name: 'Status',
            value: `${eventStatusMap[status1 ?? 1]} ➜ ${eventStatusMap[status2]}`,
        });

        if (channel1 !== channel2) {
            const type = (channel1 && channel2) || channel2 ? 'Channel' : 'Location';
            const target1 = channel1?.toString() ?? metadata1?.location ?? null;
            const target2 = channel2?.toString() ?? metadata2?.location ?? null;

            embed.addFields({
                name: type,
                value: `${target1} ➜ ${target2}`,
            });
        }

        if (embed.data.fields?.length !== 0) guild.queuedLogs.push(embed);
    });
}
