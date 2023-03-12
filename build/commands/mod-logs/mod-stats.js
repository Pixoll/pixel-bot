"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
/**
 * Get's the difference in days between the specified date and now.
 * @param date The date in `Date` format or a string.
 */
function getDayDifference(date) {
    const string = date.toISOString().split('T')[0];
    const array = string.split(/\/|,|-/, 3).map(s => +s);
    const newDate = new Date(...array);
    const difference = Date.now() - newDate.getTime();
    const daysDifference = Math.trunc(difference / 86400000);
    return daysDifference;
}
const args = [{
        key: 'user',
        prompt: 'What moderator do you want to get the statistics from?',
        type: 'user',
        required: false,
    }];
class ModStatsCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'mod-stats',
            aliases: ['modstats'],
            group: 'mod-logs',
            description: 'Displays your moderation statistics or for a moderator or admin.',
            detailedDescription: (0, common_tags_1.stripIndent) `
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
    async run(context, { user }) {
        const { author, guild } = context;
        const db = guild.database.moderations;
        user ??= author;
        const stats = await db.fetchMany({ modId: user.id });
        const pad = 10;
        const header = 'Type'.padEnd(pad, ' ') + '7 days'.padEnd(pad, ' ') + '30 days'.padEnd(pad, ' ') + 'All time';
        const mutes = getStats(stats, 'mute', 'Mutes', pad);
        const bans = getStats(stats, ['ban', 'temp-ban'], 'Bans', pad);
        const kicks = getStats(stats, 'kick', 'Kicks', pad);
        const warns = getStats(stats, 'warn', 'Warns', pad);
        const total = getStats(stats, ['mute', 'ban', 'temp-ban', 'kick', 'warn'], 'Total', pad);
        const table = (0, utils_1.code)(`${header}\n\n${mutes}\n${bans}\n${kicks}\n${warns}\n${total}`);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
            name: `${user.username}'s moderation statistics`, iconURL: user.displayAvatarURL({ forceStatic: false }),
        })
            .setDescription(table)
            .setFooter({ text: `User ID: ${user.id}` })
            .setTimestamp();
        await (0, utils_1.replyAll)(context, embed);
    }
}
exports.default = ModStatsCommand;
/**
 * Filters the stats by type
 * @param stats The stats to filter
 * @param filter The type of the punishment
 * @param rowName The name of the row
 * @param pad The padding for the content
 */
function getStats(stats, filter, rowName, pad) {
    if (typeof filter === 'string')
        filter = [filter];
    const seven = stats.filter(stat => filter.includes(stat.type) && getDayDifference(stat.createdAt) <= 7).size.toString();
    const thirty = stats.filter(stat => filter.includes(stat.type) && getDayDifference(stat.createdAt) <= 30).size.toString();
    const all = stats.filter(stat => filter.includes(stat.type)).size.toString();
    return rowName.padEnd(pad, ' ') + seven.padEnd(pad, ' ') + thirty.padEnd(pad, ' ') + all;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLXN0YXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21vZC1sb2dzL21vZC1zdGF0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FBc0Q7QUFDdEQscURBU3lCO0FBQ3pCLHVDQUE2QztBQUU3Qzs7O0dBR0c7QUFDSCxTQUFTLGdCQUFnQixDQUFDLElBQVU7SUFDaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBcUIsQ0FBQztJQUN6RSxNQUFNLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ25DLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbEQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsUUFBVSxDQUFDLENBQUM7SUFDM0QsT0FBTyxjQUFjLENBQUM7QUFDMUIsQ0FBQztBQUVELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSx3REFBd0Q7UUFDaEUsSUFBSSxFQUFFLE1BQU07UUFDWixRQUFRLEVBQUUsS0FBSztLQUNsQixDQUFVLENBQUM7QUFLWixNQUFxQixlQUFnQixTQUFRLHlCQUFzQjtJQUMvRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFdBQVc7WUFDakIsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFD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