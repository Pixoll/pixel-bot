import { EmbedBuilder } from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { isGuildModuleEnabled, timestamp, customEmoji } from '../../utils/functions';

/** Handles all of the member logs. */
export default function (client: CommandoClient<true>): void {
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        const { guild, premiumSinceTimestamp: boostTime2, user, id } = newMember;
        const { premiumSinceTimestamp: boostTime1, partial } = oldMember;
        if (!guild.available || partial || boostTime1 === boostTime2) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'boosts');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/boosts".');

        const action = boostTime1 === null ? 'started' : 'stopped';
        const emoji = action === 'started' ? customEmoji('boost') : '';

        const embed = new EmbedBuilder()
            .setColor('#f47fff')
            .setAuthor({
                name: user.tag,
                iconURL: newMember.displayAvatarURL({ forceStatic: false }),
            })
            .setDescription(`${user.toString()} ${action} boosting ${emoji}`)
            .setFooter({ text: `User ID: ${id}` })
            .setTimestamp();

        if (action === 'stopped' && boostTime1) embed.addFields({
            name: 'Boosted for',
            value: timestamp(boostTime1, 'R'),
        });

        guild.queuedLogs.push(embed);
    });
}
