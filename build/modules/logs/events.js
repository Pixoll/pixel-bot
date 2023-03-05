"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
const eventStatusMap = {
    [discord_js_1.GuildScheduledEventStatus.Scheduled]: 'Scheduled',
    [discord_js_1.GuildScheduledEventStatus.Active]: 'Active',
    [discord_js_1.GuildScheduledEventStatus.Completed]: 'Completed',
    [discord_js_1.GuildScheduledEventStatus.Canceled]: 'Canceled',
};
/** Handles all of the events logs. */
function default_1(client) {
    client.on('guildScheduledEventCreate', async (event) => {
        const { guild, id, name, channel, creator, description, scheduledEndAt, scheduledStartAt, url, entityMetadata, } = event;
        if (!guild)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'events');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/events#create".');
        const embedDescription = (0, common_tags_1.stripIndent) `
            **Name:** ${name}
            ${channel ? `**Channel:** ${channel.toString()}` : `**Location:** ${entityMetadata?.location}`}
            **Creator:** ${creator?.toString()} ${creator?.tag}
            **Starting:** ${(0, utils_1.timestamp)(scheduledStartAt ?? 0)} (${(0, utils_1.timestamp)(scheduledStartAt ?? 0, 'R')})
            ${scheduledEndAt ? `**Ending:** ${(0, utils_1.timestamp)(scheduledEndAt)} (${(0, utils_1.timestamp)(scheduledEndAt, 'R')})` : ''}
        `;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Green')
            .setAuthor({
            name: 'Created event',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            url,
        })
            .setDescription(embedDescription)
            .setFooter({ text: `Event ID: ${id}` })
            .setTimestamp();
        if (description)
            embed.addFields({
                name: 'Description',
                value: description,
            });
        guild.queuedLogs.push(embed);
    });
    client.on('guildScheduledEventDelete', async (event) => {
        const { guild, id, name, channel, creator, scheduledEndAt, scheduledStartAt, url, entityMetadata } = event;
        if (!guild)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'events');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/events#delete".');
        const embedDescription = (0, common_tags_1.stripIndent) `
            **Name:** ${name}
            ${channel ? `**Channel:** ${channel.toString()}` : `**Location:** ${entityMetadata?.location}`}
            **Creator:** ${creator?.toString()} ${creator?.tag}
            **Starting:** ${(0, utils_1.timestamp)(scheduledStartAt ?? 0)} (${(0, utils_1.timestamp)(scheduledStartAt ?? 0, 'R')})
            ${scheduledEndAt ? `**Ending:** ${(0, utils_1.timestamp)(scheduledEndAt)} (${(0, utils_1.timestamp)(scheduledEndAt, 'R')})` : ''}
        `;
        const embed = new discord_js_1.EmbedBuilder()
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
        if (!guild)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'events');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/events#update".');
        const { name: name1, description: description1, channel: channel1, entityMetadata: metadata1, scheduledStartAt: startAt1, scheduledEndAt: endAt1, status: status1, } = oldEvent ?? {};
        const { name: name2, description: description2, channel: channel2, entityMetadata: metadata2, scheduledStartAt: startAt2, scheduledEndAt: endAt2, status: status2, } = newEvent;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: 'Updated event',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            url,
        })
            .setFooter({ text: `Event ID: ${id}` })
            .setTimestamp();
        if (name1 !== name2)
            embed.addFields({
                name: 'Name',
                value: `${name1} ➜ ${name2}`,
            });
        if (description1 !== description2)
            embed.addFields({
                name: 'Description',
                value: `${description1 || 'None'} ➜ ${description2 || 'None'}`,
            });
        if (startAt1 !== startAt2)
            embed.addFields({
                name: 'Starting date',
                value: `${(0, utils_1.timestamp)(startAt1 ?? 0)} ➜ ${(0, utils_1.timestamp)(startAt2 ?? 0)}`,
            });
        if (endAt1 !== endAt2)
            embed.addFields({
                name: 'Ending date',
                value: `${(0, utils_1.timestamp)(endAt1 ?? 0) || 'None'} ➜ ${(0, utils_1.timestamp)(endAt2 ?? 0)}`,
            });
        if (status1 !== status2)
            embed.addFields({
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
        if (embed.data.fields?.length !== 0)
            guild.queuedLogs.push(embed);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZHVsZXMvbG9ncy9ldmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBQXFFO0FBRXJFLHVDQUE4RDtBQUU5RCxNQUFNLGNBQWMsR0FBOEM7SUFDOUQsQ0FBQyxzQ0FBeUIsQ0FBQyxTQUFTLENBQUMsRUFBRSxXQUFXO0lBQ2xELENBQUMsc0NBQXlCLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUTtJQUM1QyxDQUFDLHNDQUF5QixDQUFDLFNBQVMsQ0FBQyxFQUFFLFdBQVc7SUFDbEQsQ0FBQyxzQ0FBeUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxVQUFVO0NBQ25ELENBQUM7QUFFRixzQ0FBc0M7QUFDdEMsbUJBQXlCLE1BQTRCO0lBQ2pELE1BQU0sQ0FBQyxFQUFFLENBQUMsMkJBQTJCLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ25ELE1BQU0sRUFDRixLQUFLLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLGNBQWMsR0FDeEcsR0FBRyxLQUFLLENBQUM7UUFDVixJQUFJLENBQUMsS0FBSztZQUFFLE9BQU87UUFFbkIsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLDRCQUFvQixFQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHFDQUFxQyxDQUFDLENBQUM7UUFFNUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLHlCQUFXLEVBQUE7d0JBQ3BCLElBQUk7Y0FDZCxPQUFPLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxD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