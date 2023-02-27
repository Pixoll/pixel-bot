import { stripIndent } from 'common-tags';
import { EmbedBuilder } from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { isGuildModuleEnabled } from '../../utils/functions';

/** Handles all of the sticker logs. */
export default function (client: CommandoClient<true>): void {
    client.on('stickerCreate', async sticker => {
        const { guild, url, id, description, name, tags } = sticker;
        if (!guild) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'stickers');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/stickers#create".');

        const user = await sticker.fetchUser().catch(() => null);

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({
                name: 'Created sticker',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(user
                ? `**${user.toString()} added a sticker:** ${name}`
                : `**Added a sticker:** ${name}`
            )
            .addFields({
                name: 'Information',
                value: stripIndent`
                **Related emoji:** ${tags || 'None'}
                **Description:** ${description || 'No description.'}
                `,
            })
            .setThumbnail(url)
            .setFooter({ text: `Sticker ID: ${id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('stickerDelete', async sticker => {
        const { guild, url, id, description, name, tags } = sticker;
        if (!guild) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'stickers');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/stickers#delete".');

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
                name: 'Deleted sticker',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(stripIndent`
                **Name:** ${name}
                **Related emoji:** ${tags || 'None'}
                **Description:** ${description || 'No description.'}
            `)
            .setThumbnail(url)
            .setFooter({ text: `Sticker ID: ${id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('stickerUpdate', async (oldSticker, newSticker) => {
        const { guild, url, id } = newSticker;
        if (!guild) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'stickers');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/sticker#update".');

        const { name: name1, description: description1, tags: tags1 } = oldSticker;
        const { name: name2, description: description2, tags: tags2 } = newSticker;

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: 'Updated sticker',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setThumbnail(url)
            .setFooter({ text: `Sticker ID: ${id}` })
            .setTimestamp();

        if (name1 !== name2) embed.addFields({
            name: 'Name',
            value: `${name1} ➜ ${name2}`,
        });

        if (description1 !== description2) embed.addFields({
            name: 'Description',
            value: stripIndent`
            **Before**
            ${description1 || 'No description.'}
            **After**
            ${description2 || 'No description.'}
            `,
        });

        if (tags1 !== tags2) embed.addFields({
            name: 'Related emoji',
            value: `${tags1 || 'None'} ➜ ${tags2 || 'None'}`,
        });

        if (embed.data.fields?.length !== 0) guild.queuedLogs.push(embed);
    });
}
