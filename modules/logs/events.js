/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags');
const { MessageEmbed } = require('discord.js');
const { CommandoClient } = require('pixoll-commando');
const { isModuleEnabled, timestamp } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/**
 * Parses an event status
 * @param {string} status The status to parse
 * @returns {string}
 */
function eventStatus(status) {
    switch (status) {
        case 'SCHEDULED': return 'Scheduled';
        case 'ACTIVE': return 'Active';
        case 'COMPLETED': return 'Completed';
        case 'CANCELED': return 'Canceled';
    }
}

/**
 * Handles all of the events logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildScheduledEventCreate', async (event) => {
        const {
            guild, id, name, channel, creator, description, scheduledEndAt, scheduledStartAt, url, entityMetadata
        } = event;

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'events');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/events#create".');

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor({
                name: 'Created event', iconURL: guild.iconURL({ dynamic: true }), url
            })
            .setDescription(stripIndent`
                **Name:** ${name}
                ${channel ?
                    `**Channel:** ${channel.toString()}` :
                    `**Location:** ${entityMetadata.location}`
                }
                **Creator:** ${creator.toString()} ${creator.tag}
                **Starting:** ${timestamp(scheduledStartAt)} (${timestamp(scheduledStartAt, 'R')})
                ${scheduledEndAt ?
                    `**Ending:** ${timestamp(scheduledEndAt)} (${timestamp(scheduledEndAt, 'R')})` : ''
                }
            `)
            .setFooter({ text: `Event ID: ${id}` })
            .setTimestamp();

        if (description) embed.addField('Description', description);

        guild.queuedLogs.push(embed);
    });

    client.on('guildScheduledEventDelete', async (event) => {
        const { guild, id, name, channel, creator, scheduledEndAt, scheduledStartAt, url, entityMetadata } = event;

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'events');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/events#delete".');

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor({
                name: 'Deleted event', iconURL: guild.iconURL({ dynamic: true }), url
            })
            .setDescription(stripIndent`
                **Name:** ${name}
                ${channel ?
                    `**Channel:** ${channel.toString()}` :
                    `**Location:** ${entityMetadata.location}`
                }
                **Creator:** ${creator.toString()} ${creator.tag}
                **Starting:** ${timestamp(scheduledStartAt)} (${timestamp(scheduledStartAt, 'R')})
                ${scheduledEndAt ?
                    `**Ending:** ${timestamp(scheduledEndAt)} (${timestamp(scheduledEndAt, 'R')})` : ''
                }
            `)
            .setFooter({ text: `Event ID: ${id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('guildScheduledEventUpdate', async (oldEvent, newEvent) => {
        const { guild, id, url } = newEvent;

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'events');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/events#update".');

        const {
            name: name1, description: description1, channel: channel1, entityMetadata: metadata1, scheduledStartAt: startAt1,
            scheduledEndAt: endAt1, status: status1
        } = oldEvent;
        const {
            name: name2, description: description2, channel: channel2, entityMetadata: metadata2, scheduledStartAt: startAt2,
            scheduledEndAt: endAt2, status: status2
        } = newEvent;

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({
                name: 'Updated event', iconURL: guild.iconURL({ dynamic: true }), url
            })
            .setFooter({ text: `Event ID: ${id}` })
            .setTimestamp();

        if (name1 !== name2) embed.addField('Name', `${name1} ➜ ${name2}`);

        if (description1 !== description2) {
            embed.addField('Description', `${description1 || 'None'} ➜ ${description2 || 'None'}`);
        }

        if (startAt1 !== startAt2) embed.addField('Starting date', `${timestamp(startAt1)} ➜ ${timestamp(startAt2)}`);

        if (endAt1 !== endAt2) embed.addField('Ending date', `${timestamp(endAt1) || 'None'} ➜ ${timestamp(endAt2)}`);

        if (status1 !== status2) embed.addField('Status', `${eventStatus(status1)} ➜ ${eventStatus(status2)}`);

        if (channel1 !== channel2) {
            const type = (channel1 && channel2) || channel2 ? 'Channel' : 'Location';
            const target1 = channel1 ?? metadata1.location;
            const target2 = channel2 ?? metadata2.location;

            embed.addField(type, `${target1.toString()} ➜ ${target2.toString()}`);
        }

        if (embed.fields.length !== 0) guild.queuedLogs.push(embed);
    });
};
