"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _index_1 = require("./_index");
/** Re-sends audit-logs when deleted. */
function default_1(client) {
    client.on('messageDelete', async (message) => {
        if (message.partial)
            return;
        const { guild, author, embeds, channelId } = message;
        if (!guild || client.user.id !== author.id || embeds.length === 0)
            return;
        client.emit('debug', 'Running event "logs/_re-send#messageDelete".');
        const logsChannel = await (0, _index_1.getLogsChannel)(guild);
        if (!logsChannel || logsChannel.id !== channelId)
            return;
        await logsChannel.send({ embeds }).catch(() => null);
    });
    client.on('messageDeleteBulk', async (messages) => {
        const notPartial = messages.filter((m) => !m.partial);
        if (notPartial.size === 0)
            return;
        const { guild, author, channelId } = notPartial.toJSON()[0];
        if (!guild || client.user.id !== author.id)
            return;
        client.emit('debug', 'Running event "logs/_re-send#messageDeleteBulk".');
        const logsChannel = await (0, _index_1.getLogsChannel)(guild);
        if (!logsChannel || logsChannel.id !== channelId)
            return;
        const embeds = notPartial.reduce((acc, msg) => acc.concat(msg.embeds), []);
        while (embeds.length !== 0) {
            const toSend = embeds.splice(0, 10);
            await logsChannel.send({ embeds: toSend }).catch(() => null);
        }
    });
    client.on('messageUpdate', async (oldMessage, newMessage) => {
        if (oldMessage.partial || newMessage.partial)
            return;
        const { guild, author, embeds, channelId, channel } = oldMessage;
        if (!guild || client.user.id !== author.id || embeds.length === 0 || embeds.length === newMessage.embeds.length)
            return;
        client.emit('debug', 'Running event "logs/_re-send#messageUpdate".');
        const logsChannel = await (0, _index_1.getLogsChannel)(guild);
        if (!logsChannel || logsChannel.id !== channelId || channel.type !== logsChannel.type)
            return;
        await newMessage?.delete().catch(() => null);
        await channel.send({ embeds }).catch(() => null);
    });
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3JlLXNlbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9sb2dzL19yZS1zZW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEscUNBQTBDO0FBRTFDLHdDQUF3QztBQUN4QyxtQkFBeUIsTUFBNEI7SUFDakQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO1FBQ3ZDLElBQUksT0FBTyxDQUFDLE9BQU87WUFBRSxPQUFPO1FBQzVCLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDckQsSUFBSSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxNQUFNLENBQUMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU87UUFFMUUsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsOENBQThDLENBQUMsQ0FBQztRQUVyRSxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUEsdUJBQWMsRUFBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxFQUFFLEtBQUssU0FBUztZQUFFLE9BQU87UUFFekQsTUFBTSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekQsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLEtBQUssRUFBQyxRQUFRLEVBQUMsRUFBRTtRQUM1QyxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUE2QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7UUFD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