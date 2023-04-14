import { TextChannel } from 'discord.js';
import { CommandoClient, CommandoGuild, CommandoGuildManager } from 'pixoll-commando';

/** Re-sends audit-logs when deleted. */
export default async function (client: CommandoClient<true>): Promise<void> {
    await sendLogs(client);
}

/**
 * Gets the audit-logs channel
 * @param guild The guild to look into
 */
export async function getLogsChannel(guild: CommandoGuild): Promise<TextChannel | null> {
    const data = await guild.database.setup.fetch();
    const channel = guild.channels.resolve(data?.logsChannel ?? '') as TextChannel | null;
    return channel;
}

async function sendLogs(client: CommandoClient<true>): Promise<void> {
    const guilds = (client.guilds as unknown as CommandoGuildManager).cache.toJSON();

    for (const guild of guilds) {
        const logsChannel = await getLogsChannel(guild);
        if (!logsChannel) {
            guild.queuedLogs = [];
            continue;
        }

        while (guild.queuedLogs.length > 0) {
            const embeds = guild.queuedLogs.splice(0, 10);
            await logsChannel.send({ embeds }).catch(() => null);
        }
    }

    setTimeout(async () => await sendLogs(client), 3000);
}
