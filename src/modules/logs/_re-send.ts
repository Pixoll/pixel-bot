import { Embed } from 'discord.js';
import { CommandoClient, CommandoifiedMessage } from 'pixoll-commando';
import { getLogsChannel } from './_index';

/** Re-sends audit-logs when deleted. */
export default function (client: CommandoClient<true>): void {
    client.on('messageDelete', async message => {
        if (message.partial) return;
        const { guild, author, embeds, channelId } = message;
        if (!guild || client.user.id !== author.id || embeds.length === 0) return;

        client.emit('debug', 'Running event "logs/_re-send#messageDelete".');

        const logsChannel = await getLogsChannel(guild);
        if (!logsChannel || logsChannel.id !== channelId) return;

        await logsChannel.send({ embeds }).catch(() => null);
    });

    client.on('messageDeleteBulk', async messages => {
        const notPartial = messages.filter((m): m is CommandoifiedMessage => !m.partial);
        if (notPartial.size === 0) return;

        const { guild, author, channelId } = notPartial.toJSON()[0];
        if (!guild || client.user.id !== author.id) return;

        client.emit('debug', 'Running event "logs/_re-send#messageDeleteBulk".');

        const logsChannel = await getLogsChannel(guild);
        if (!logsChannel || logsChannel.id !== channelId) return;

        const embeds = notPartial.reduce<Embed[]>((acc, msg) => acc.concat(msg.embeds), []);
        while (embeds.length !== 0) {
            const toSend = embeds.splice(0, 10);
            await logsChannel.send({ embeds: toSend }).catch(() => null);
        }
    });

    client.on('messageUpdate', async (oldMessage, newMessage) => {
        if (oldMessage.partial || newMessage.partial) return;
        const { guild, author, embeds, channelId, channel } = oldMessage;
        if (
            !guild || client.user.id !== author.id || embeds.length === 0 || embeds.length === newMessage.embeds.length
        ) return;

        client.emit('debug', 'Running event "logs/_re-send#messageUpdate".');

        const logsChannel = await getLogsChannel(guild);
        if (!logsChannel || logsChannel.id !== channelId || channel.type !== logsChannel.type) return;

        await newMessage?.delete().catch(() => null);
        await channel.send({ embeds }).catch(() => null);
    });
}
