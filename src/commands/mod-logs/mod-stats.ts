import { stripIndent } from 'common-tags';
import { EmbedBuilder, Collection } from 'discord.js';
import {
    Command,
    CommandContext,
    CommandoClient,
    CommandoUser,
    ModerationSchema,
    ModerationType,
    ParseRawArguments,
} from 'pixoll-commando';
import { code, replyAll } from '../../utils';

/**
 * Get's the difference in days between the specified date and now.
 * @param date The date in `Date` format or a string.
 */
function getDayDifference(date: Date): number {
    const string = date.toISOString().split('T')[0];
    const array = string.split(/\/|,|-/, 3).map(s => +s) as Tuple<number, 3>;
    const newDate = new Date(...array);
    const difference = Date.now() - newDate.getTime();
    const daysDifference = Math.trunc(difference / 86_400_000);
    return daysDifference;
}

const args = [{
    key: 'user',
    prompt: 'What moderator do you want to get the statistics from?',
    type: 'user',
    required: false,
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class ModStatsCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'mod-stats',
            aliases: ['modstats'],
            group: 'mod-logs',
            description: 'Displays your moderation statistics or for a moderator or admin.',
            details: stripIndent`
                If \`user\` is not specified, I will show your own moderation statistics.
                \`user\` can be a user's username, ID or mention.
            `,
            format: 'modstats <user>',
            examples: ['modstats Pixoll'],
            modPermissions: true,
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }

    public async run(context: CommandContext<true>, { user }: ParsedArgs): Promise<void> {
        const { author, guild } = context;
        const db = guild.database.moderations;
        user ??= author as CommandoUser;

        const stats = await db.fetchMany({ modId: user.id });

        const pad = 10;
        const header = 'Type'.padEnd(pad, ' ') + '7 days'.padEnd(pad, ' ') + '30 days'.padEnd(pad, ' ') + 'All time';

        const mutes = getStats(stats, 'mute', 'Mutes', pad);
        const bans = getStats(stats, ['ban', 'temp-ban'], 'Bans', pad);
        const kicks = getStats(stats, 'kick', 'Kicks', pad);
        const warns = getStats(stats, 'warn', 'Warns', pad);
        const total = getStats(stats, ['mute', 'ban', 'temp-ban', 'kick', 'warn'], 'Total', pad);

        const table = code(`${header}\n\n${mutes}\n${bans}\n${kicks}\n${warns}\n${total}`);

        const embed = new EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
                name: `${user.username}'s moderation statistics`, iconURL: user.displayAvatarURL({ forceStatic: false }),
            })
            .setDescription(table)
            .setFooter({ text: `User ID: ${user.id}` })
            .setTimestamp();

        await replyAll(context, embed);
    }
}

/**
 * Filters the stats by type
 * @param stats The stats to filter
 * @param filter The type of the punishment
 * @param rowName The name of the row
 * @param pad The padding for the content
 */
function getStats(
    stats: Collection<string, ModerationSchema>, filter: ModerationType | ModerationType[], rowName: string, pad: number
): string {
    if (typeof filter === 'string') filter = [filter];

    const seven = stats.filter(stat =>
        filter.includes(stat.type) && getDayDifference(stat.createdAt) <= 7
    ).size.toString();
    const thirty = stats.filter(stat =>
        filter.includes(stat.type) && getDayDifference(stat.createdAt) <= 30
    ).size.toString();
    const all = stats.filter(stat => filter.includes(stat.type)).size.toString();

    return rowName.padEnd(pad, ' ') + seven.padEnd(pad, ' ') + thirty.padEnd(pad, ' ') + all;
}
