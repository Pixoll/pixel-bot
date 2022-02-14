/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');
const { CommandoClient } = require('pixoll-commando');
const { isModuleEnabled } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/**
 * Parses a channel type
 * @param {string} type The type to parse
 * @returns {string}
 */
function vcType(type) {
    switch (type) {
        case 'GUILD_VOICE': return 'voice';
        case 'GUILD_STAGE_VOICE': return 'stage';
    }
}

/**
 * Handles all of the voice logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        const { guild, member, id } = oldState;

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'voice');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/voice".');

        const { channel: channel1, serverMute: mute1, serverDeaf: deaf1 } = oldState;
        const { channel: channel2, serverMute: mute2, serverDeaf: deaf2 } = newState;
        const { user } = member;

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({
                name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true })
            })
            .setFooter({ text: `User ID: ${id}` })
            .setTimestamp();

        if (!channel1 && channel2) {
            embed.setColor('GREEN')
                .setDescription(`${user.toString()} joined ${vcType(channel2.type)} channel ${channel2.toString()}`);
        }

        if (!channel2 && channel1) {
            embed.setColor('ORANGE')
                .setDescription(`${user.toString()} left ${vcType(channel1.type)} channel ${channel1.toString()}`);
        }

        if (channel1 && channel2 && channel1.id !== channel2.id) {
            embed.addField(`Switched ${vcType(channel1.type)} channels`, `${channel1.toString()} ➜ ${channel2.toString()}`);
        }

        if (typeof mute1 === 'boolean' && typeof mute2 === 'boolean' && mute1 !== mute2) {
            embed.setDescription(`${user.toString()} has been server ${mute2 ? 'muted' : 'unmuted'}`);
        }

        if (typeof deaf1 === 'boolean' && typeof deaf2 === 'boolean' && deaf1 !== deaf2) {
            embed.setDescription(`${user.toString()} has been server ${deaf2 ? 'deafened' : 'undeafened'}`);
        }

        if (embed.description || embed.fields.length !== 0) {
            guild.queuedLogs.push(embed);
        }
    });
};
