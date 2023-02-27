import { ChannelType, EmbedBuilder, VoiceBasedChannelTypes } from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { isGuildModuleEnabled } from '../../utils/functions';

const channelTypeMap: Record<VoiceBasedChannelTypes, string> = {
    [ChannelType.GuildStageVoice]: 'Stage',
    [ChannelType.GuildVoice]: 'Voice',
};

/** Handles all of the voice logs. */
export default function (client: CommandoClient<true>): void {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        const { guild, member, id } = oldState;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'voice');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/voice".');

        const { channel: channel1, serverMute: mute1, serverDeaf: deaf1 } = oldState;
        const { channel: channel2, serverMute: mute2, serverDeaf: deaf2 } = newState;
        const { user } = member ?? {};
        if (!user) return;

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: user.tag,
                iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .setFooter({ text: `User ID: ${id}` })
            .setTimestamp();

        if (!channel1 && channel2) {
            embed.setColor('Green')
                .setDescription(`${user.toString()} joined ${channelTypeMap[channel2.type]} channel ${channel2.toString()}`);
        }

        if (!channel2 && channel1) {
            embed.setColor('Orange')
                .setDescription(`${user.toString()} left ${channelTypeMap[channel1.type]} channel ${channel1.toString()}`);
        }

        if (channel1 && channel2 && channel1.id !== channel2.id) embed.addFields({
            name: `Switched ${channelTypeMap[channel1.type]} channels`,
            value: `${channel1.toString()} ➜ ${channel2.toString()}`,
        });

        if (typeof mute1 === 'boolean' && typeof mute2 === 'boolean' && mute1 !== mute2) {
            embed.setDescription(`${user.toString()} has been server ${mute2 ? 'muted' : 'unmuted'}`);
        }

        if (typeof deaf1 === 'boolean' && typeof deaf2 === 'boolean' && deaf1 !== deaf2) {
            embed.setDescription(`${user.toString()} has been server ${deaf2 ? 'deafened' : 'undeafened'}`);
        }

        if (embed.data.description || embed.data.fields?.length !== 0) {
            guild.queuedLogs.push(embed);
        }
    });
}
