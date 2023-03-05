import { ChannelType, EmbedBuilder, GuildTextBasedChannel } from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { isGuildModuleEnabled } from '../../utils';

/** This module manages welcome messages. */
export default function (client: CommandoClient<true>): void {
    client.on('guildMemberAdd', async ({ guild, user }) => {
        if (user.bot) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'welcome');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "modules/welcome".');

        const data = await guild.database.welcome.fetch();
        if (!data) return;

        const channel = guild.channels.resolve(data.channel) as GuildTextBasedChannel | null;

        const format = (str: string): string => str.replace(/{user}/g, user.toString())
            .replace(/{server_name}/g, guild.name)
            .replace(/{member_count}/g, guild.memberCount.toString());

        const embed = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `Welcome to ${guild.name}!`,
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setFooter({ text: 'Enjoy your stay' })
            .setTimestamp();

        if (channel && channel.type !== ChannelType.GuildStageVoice && data.message) {
            embed.setDescription(format(data.message));
            await channel.send({ content: user.toString(), embeds: [embed] });
        }
    });
}
