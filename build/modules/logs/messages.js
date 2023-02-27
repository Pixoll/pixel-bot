"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const functions_1 = require("../../utils/functions");
/**
 * Formats the bytes to its most divisible point
 * @param bytes The bytes to format
 * @param decimals The amount od decimals to display
 * @param showUnit Whether to display the units or not
 */
function formatBytes(bytes, decimals = 2, showUnit = true) {
    if (bytes === 0) {
        if (showUnit)
            return '0 B';
        return '0';
    }
    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const float = parseFloat((bytes / Math.pow(k, i)).toFixed(dm)).toString();
    if (showUnit)
        return `${float} ${sizes[i]}`;
    return float;
}
/** Handles all of the message logs. */
function default_1(client) {
    client.on('messageDelete', async (message) => {
        if (!message.inGuild())
            return;
        const { guild, author, content, attachments, channel, partial, stickers } = message;
        if (partial || author.bot)
            return;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'messages');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/messages#delete".');
        const deleted = (0, functions_1.sliceDots)(content, 1024);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
            name: 'Deleted message', iconURL: author.displayAvatarURL({ forceStatic: false }),
        })
            .setDescription(`Sent by ${author.toString()} in ${channel.toString()}`)
            .setFooter({ text: `Author ID: ${author.id}` })
            .setTimestamp();
        if (deleted)
            embed.addFields({
                name: 'Message',
                value: deleted,
            });
        if (attachments.size !== 0) {
            const atts = attachments.map(({ name, proxyURL, size, height, url }) => {
                const bytes = formatBytes(size);
                const download = !height ? `- Download [here](${url})` : '';
                return `**>** [${name}](${proxyURL}) - ${bytes} ${download}`;
            });
            embed.addFields({
                name: 'Files',
                value: atts.join('\n'),
            });
        }
        if (stickers.size !== 0) {
            const sticks = stickers.map(({ name, url }) => `**>** [${name}](${url})`);
            embed.addFields({
                name: 'Stickers',
                value: sticks.join('\n'),
            });
        }
        guild.queuedLogs.push(embed);
    });
    client.on('messageDeleteBulk', async (messages) => {
        const { guild, channel } = messages.toJSON()[0];
        if (!guild)
            return;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'messages');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/messages#deleteBulk".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
            name: 'Deleted multiple messages',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(`Deleted **${(0, functions_1.pluralize)('message', messages.size)}** in ${channel.toString()}`)
            .setFooter({ text: `Channel ID: ${channel.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('messageUpdate', async (oldMessage, partialNewMessage) => {
        const { content: content1 } = oldMessage;
        const newMessage = await (0, functions_1.fetchPartial)(partialNewMessage);
        if (!newMessage)
            return;
        const { guild, channel, author, content: content2, url } = newMessage;
        if (!guild || author.bot || content1 === content2)
            return;
        const isEnabled = await (0, functions_1.isGuildModuleEnabled)(guild, 'audit-logs', 'messages');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/messages#update".');
        const oldContent = content1 !== null
            ? (0, functions_1.sliceDots)(content1, 1024) || '`Empty`'
            : '`Couldn\'t get old message content.`';
        const newContent = (0, functions_1.sliceDots)(content2, 1024);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: 'Edited message', iconURL: author.displayAvatarURL({ forceStatic: false }),
        })
            .setDescription(`Sent by ${author.toString()} in ${channel.toString()} [Jump to message](${url})`)
            .addFields({
            name: 'Before',
            value: oldContent,
        }, {
            name: 'After',
            value: newContent,
        })
            .setFooter({ text: `Author ID: ${author.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9sb2dzL21lc3NhZ2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQTBDO0FBRTFDLHFEQUFpRztBQUVqRzs7Ozs7R0FLRztBQUNILFNBQVMsV0FBVyxDQUFDLEtBQWEsRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsR0FBRyxJQUFJO0lBQzdELElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtRQUNiLElBQUksUUFBUTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQzNCLE9BQU8sR0FBRyxDQUFDO0tBQ2Q7SUFFRCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDZixNQUFNLEVBQUUsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUN2QyxNQUFNLEtBQUssR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUU1QyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BELE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FDcEIsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQ3ZDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFYixJQUFJLFFBQVE7UUFBRSxPQUFPLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQzVDLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFFRCx1Q0FBdUM7QUFDdkMsbUJBQXlC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