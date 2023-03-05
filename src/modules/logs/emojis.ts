import { EmbedBuilder } from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { isGuildModuleEnabled } from '../../utils';

/** Handles all of the emoji logs. */
export default function (client: CommandoClient<true>): void {
    client.on('emojiCreate', async emoji => {
        const { guild, name, id, url } = emoji;
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'emojis');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/emojis#create".');

        const author = await emoji.fetchAuthor().catch(() => null);

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({
                name: 'Created emoji',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(author
                ? `**${author.toString()} added an emoji:** ${name}`
                : `**Added emoji:** ${name}`
            )
            .setThumbnail(url)
            .setFooter({ text: `Emoji ID: ${id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('emojiDelete', async emoji => {
        const { guild, name, id, url } = emoji;
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'emojis');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/emojis#delete".');

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
                name: 'Deleted emoji',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(`**Name:** ${name}`)
            .setThumbnail(url)
            .setFooter({ text: `Emoji ID: ${id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
        const { guild, id, url } = oldEmoji;
        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'emojis');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/emojis#update".');

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: 'Updated emoji',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .addFields({
                name: 'Name',
                value: `${oldEmoji.name} ➜ ${newEmoji.name}`,
            })
            .setThumbnail(url)
            .setFooter({ text: `Emoji ID: ${id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });
}
