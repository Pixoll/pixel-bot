"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utils_1 = require("../../utils");
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
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'messages');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/messages#delete".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
            name: 'Deleted message',
            iconURL: author.displayAvatarURL({ forceStatic: false }),
        })
            .setDescription(`Sent by ${author.toString()} in ${channel.toString()}`)
            .setFooter({ text: `Author ID: ${author.id}` })
            .setTimestamp();
        if (content)
            embed.addFields({
                name: 'Message',
                value: (0, utils_1.limitStringLength)(content, 1024),
            });
        if (attachments.size !== 0) {
            const atts = attachments.map(({ name, proxyURL, size, height, url }) => {
                const bytes = formatBytes(size);
                const download = !height ? `- Download ${(0, utils_1.hyperlink)('here', url)}` : '';
                return `**>** ${(0, utils_1.hyperlink)(name ?? 'UNNAMED', proxyURL)} - ${bytes} ${download}`;
            });
            embed.addFields({
                name: 'Files',
                value: atts.join('\n'),
            });
        }
        if (stickers.size !== 0) {
            const sticks = stickers.map(({ name, url }) => `**>** ${(0, utils_1.hyperlink)(name, url)}`);
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
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'messages');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/messages#deleteBulk".');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Orange')
            .setAuthor({
            name: 'Deleted multiple messages',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(`Deleted **${(0, utils_1.pluralize)('message', messages.size)}** in ${channel.toString()}`)
            .setFooter({ text: `Channel ID: ${channel.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
    client.on('messageUpdate', async (oldMessage, partialNewMessage) => {
        const { content: content1 } = oldMessage;
        const newMessage = await (0, utils_1.fetchPartial)(partialNewMessage);
        if (!newMessage)
            return;
        const { guild, channel, author, content: content2, url } = newMessage;
        if (!guild || author.bot || content1 === content2)
            return;
        const isEnabled = await (0, utils_1.isGuildModuleEnabled)(guild, 'audit-logs', 'messages');
        if (!isEnabled)
            return;
        client.emit('debug', 'Running event "logs/messages#update".');
        const oldContent = content1 !== null
            ? (0, utils_1.limitStringLength)(content1, 1024) || '`Empty`'
            : '`Couldn\'t get old message content.`';
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('Blue')
            .setAuthor({
            name: 'Edited message',
            iconURL: author.displayAvatarURL({ forceStatic: false }),
        })
            .setDescription(`Sent by ${author.toString()} in ${channel.toString()} ${(0, utils_1.hyperlink)('Jump to message', url)}`)
            .addFields({
            name: 'Before',
            value: oldContent,
        }, {
            name: 'After',
            value: (0, utils_1.limitStringLength)(content2, 1024),
        })
            .setFooter({ text: `Author ID: ${author.id}` })
            .setTimestamp();
        guild.queuedLogs.push(embed);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9sb2dzL21lc3NhZ2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQTBDO0FBRTFDLHVDQUEwRztBQUUxRzs7Ozs7R0FLRztBQUNILFNBQVMsV0FBVyxDQUFDLEtBQWEsRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsR0FBRyxJQUFJO0lBQzdELElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtRQUNiLElBQUksUUFBUTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQzNCLE9BQU8sR0FBRyxDQUFDO0tBQ2Q7SUFFRCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDZixNQUFNLEVBQUUsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUN2QyxNQUFNLEtBQUssR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUU1QyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BELE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FDcEIsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQ3ZDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFYixJQUFJLFFBQVE7UUFBRSxPQUFPLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQzVDLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFFRCx1Q0FBdUM7QUFDdkMsbUJBQXlCLE1BQTRCO0lBQ2pELE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtRQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUFFLE9BQU87UUFFL0IsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUNwRixJQUFJLE9BQU8sSUFBSSxNQUFNLENBQUMsR0FBRztZQUFFLE9BQU87UUFFbEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLDRCQUFvQixFQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUUsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHVDQUF1QyxDQUFDLENBQUM7UUFFOUQsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxRQUFRLENBQUM7YUFDbEIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLGlCQUFpQjtZQUN2QixPQUFPLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQzNELENBQUM7YUFDRCxjQUFjLENBQUMsV0FBVyxNQUFNLENBQUMsUUFBUSxFQUFFLE9BQU8sT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7YUFDdkUsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLGNBQWMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7YUFDOUMsWUFBWSxFQUFFLENBQUM7UUFFcEIsSUFBSSxPQUFPO1lBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQztnQkFDekIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsS0FBSyxFQUFFLElBQUEseUJBQWlCLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQzthQUMxQyxDQUFDLENBQUM7UUFFSCxJQUFJLFdBQVcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ3hCLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFO2dCQUNuRSxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2hDLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxjQUFjLElBQUEsaUJBQVMsRUFBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUN2RSxPQUFPLFNBQVMsSUFBQSxpQkFBUyxFQUFDLElBQUksSUFBSSxTQUFTLEVBQUUsUUFBUSxDQUFDLE1BQU0sS0FBSyxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ3BGLENBQUMsQ0FBQyxDQUFDO1lBRUgsS0FBSyxDQUFDLFNBQVMsQ0FBQztnQkFDWixJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDekIsQ0FBQyxDQUFDO1NBQ047UUFFRCxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsU0FBUyxJQUFBLGlCQUFTLEVBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVoRixLQUFLLENBQUMsU0FBUyxDQUFDO2dCQUNaLElBQUksRUFBRSxVQUFVO2dCQUNoQixLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDM0IsQ0FBQyxDQUFDO1NBQ047UUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxFQUFDLFFBQVEsRUFBQyxFQUFFO1FBQzVDLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTztRQUVuQixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsNEJBQW9CLEVBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsU0FBUztZQUFFLE9BQU87UUFFdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsMkNBQTJDLENBQUMsQ0FBQztRQUVsRSxNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDM0IsUUFBUSxDQUFDLFFBQVEsQ0FBQzthQUNsQixTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsMkJBQTJCO1lBQ2pDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksU0FBUztTQUM5RCxDQUFDO2FBQ0QsY0FBYyxDQUFDLGFBQWEsSUFBQSxpQkFBUyxFQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7YUFDN0YsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLGVBQWUsT0FBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7YUFDaEQsWUFBWSxFQUFFLENBQUM7UUFFcEIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLEVBQUU7UUFDL0QsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxVQUFVLENBQUM7UUFDekMsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFBLG9CQUFZLEVBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsVUFBVTtZQUFFLE9BQU87UUFFeEIsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsVUFBVSxDQUFDO1FBQ3RFLElBQUksQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLEdBQUcsSUFBSSxRQUFRLEtBQUssUUFBUTtZQUFFLE9BQU87UUFFMUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLDRCQUFvQixFQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUUsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHVDQUF1QyxDQUFDLENBQUM7UUFFOUQsTUFBTSxVQUFVLEdBQUcsUUFBUSxLQUFLLElBQUk7WUFDaEMsQ0FBQyxDQUFDLElBQUEseUJBQWlCLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLFNBQVM7WUFDaEQsQ0FBQyxDQUFDLHNDQUFzQyxDQUFDO1FBRTdDLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsTUFBTSxDQUFDO2FBQ2hCLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxnQkFBZ0I7WUFDdEIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztTQUMzRCxDQUFDO2FBQ0QsY0FBYyxDQUFDLFdBQVcsTUFBTSxDQUFDLFFBQVEsRUFBRSxPQUFPLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxJQUFBLGlCQUFTLEVBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQzthQUM1RyxTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxVQUFVO1NBQ3BCLEVBQUU7WUFDQyxJQUFJLEVBQUUsT0FBTztZQUNiLEtBQUssRUFBRSxJQUFBLHlCQUFpQixFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUM7U0FDM0MsQ0FBQzthQUNELFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxjQUFjLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO2FBQzlDLFlBQVksRUFBRSxDQUFDO1FBRXBCLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQTlHRCw0QkE4R0MifQ==