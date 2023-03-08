import { EmbedBuilder } from 'discord.js';
import { CommandoClient } from 'pixoll-commando';
import { limitStringLength, isGuildModuleEnabled, pluralize, fetchPartial, hyperlink } from '../../utils';

/**
 * Formats the bytes to its most divisible point
 * @param bytes The bytes to format
 * @param decimals The amount od decimals to display
 * @param showUnit Whether to display the units or not
 */
function formatBytes(bytes: number, decimals = 2, showUnit = true): string {
    if (bytes === 0) {
        if (showUnit) return '0 B';
        return '0';
    }

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const float = parseFloat(
        (bytes / Math.pow(k, i)).toFixed(dm)
    ).toString();

    if (showUnit) return `${float} ${sizes[i]}`;
    return float;
}

/** Handles all of the message logs. */
export default function (client: CommandoClient<true>): void {
    client.on('messageDelete', async message => {
        if (!message.inGuild()) return;

        const { guild, author, content, attachments, channel, partial, stickers } = message;
        if (partial || author.bot) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'messages');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/messages#delete".');

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
                name: 'Deleted message', iconURL: author.displayAvatarURL({ forceStatic: false }),
            })
            .setDescription(`Sent by ${author.toString()} in ${channel.toString()}`)
            .setFooter({ text: `Author ID: ${author.id}` })
            .setTimestamp();

        if (content) embed.addFields({
            name: 'Message',
            value: limitStringLength(content, 1024),
        });

        if (attachments.size !== 0) {
            const atts = attachments.map(({ name, proxyURL, size, height, url }) => {
                const bytes = formatBytes(size);
                const download = !height ? `- Download ${hyperlink('here', url)}` : '';
                return `**>** ${hyperlink(name ?? 'UNNAMED', proxyURL)} - ${bytes} ${download}`;
            });

            embed.addFields({
                name: 'Files',
                value: atts.join('\n'),
            });
        }

        if (stickers.size !== 0) {
            const sticks = stickers.map(({ name, url }) => `**>** ${hyperlink(name, url)}`);

            embed.addFields({
                name: 'Stickers',
                value: sticks.join('\n'),
            });
        }

        guild.queuedLogs.push(embed);
    });

    client.on('messageDeleteBulk', async messages => {
        const { guild, channel } = messages.toJSON()[0];
        if (!guild) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'messages');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/messages#deleteBulk".');

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
                name: 'Deleted multiple messages',
                iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            })
            .setDescription(`Deleted **${pluralize('message', messages.size)}** in ${channel.toString()}`)
            .setFooter({ text: `Channel ID: ${channel.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });

    client.on('messageUpdate', async (oldMessage, partialNewMessage) => {
        const { content: content1 } = oldMessage;
        const newMessage = await fetchPartial(partialNewMessage);
        if (!newMessage) return;

        const { guild, channel, author, content: content2, url } = newMessage;
        if (!guild || author.bot || content1 === content2) return;

        const isEnabled = await isGuildModuleEnabled(guild, 'audit-logs', 'messages');
        if (!isEnabled) return;

        client.emit('debug', 'Running event "logs/messages#update".');

        const oldContent = content1 !== null
            ? limitStringLength(content1, 1024) || '`Empty`'
            : '`Couldn\'t get old message content.`';

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
                name: 'Edited message', iconURL: author.displayAvatarURL({ forceStatic: false }),
            })
            .setDescription(`Sent by ${author.toString()} in ${channel.toString()} ${hyperlink('Jump to message', url)}`)
            .addFields({
                name: 'Before',
                value: oldContent,
            }, {
                name: 'After',
                value: limitStringLength(content2, 1024),
            })
            .setFooter({ text: `Author ID: ${author.id}` })
            .setTimestamp();

        guild.queuedLogs.push(embed);
    });
}
