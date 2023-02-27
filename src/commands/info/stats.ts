import { prettyMs } from 'better-ms';
import { EmbedBuilder } from 'discord.js';
import { Command, CommandContext, CommandoClient } from 'pixoll-commando';
import { replyAll } from '../../utils/functions';

/**
 * Formats the bytes to its most divisible point
 * @param bytes The bytes to format
 * @param decimal The amount od decimals to display
 */
function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0';

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const float = parseFloat(
        (bytes / Math.pow(k, i)).toFixed(dm)
    ).toString();

    return float;
}

/** A command that can be run in a client */
export default class StatsCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'stats',
            group: 'info',
            description: 'Displays some statistics of the bot.',
            guarded: true,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext): Promise<void> {
        const { client } = context;
        const { user, uptime } = client;
        const guilds = client.guilds.cache;
        const users = guilds.reduce((a, g) => a + g.memberCount, 0).toLocaleString();

        const uptimeString = prettyMs(uptime, { verbose: true, unitCount: 2 });

        // The memory usage in MB
        const { heapUsed, rss } = process.memoryUsage();
        const usedMemory = formatBytes(heapUsed, 2);
        const maxMemory = formatBytes(rss, 2);

        const stats = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `${user.username}'s stats`, iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .addFields({
                name: 'Servers',
                value: guilds.size.toLocaleString(),
                inline: true,
            }, {
                name: 'Users',
                value: users,
                inline: true,
            }, {
                name: 'Memory usage',
                value: `${usedMemory}/${maxMemory} MB`,
                inline: true,
            }, {
                name: 'Uptime',
                value: uptimeString,
                inline: true,
            })
            .setTimestamp();

        await replyAll(context, stats);
    }
}
