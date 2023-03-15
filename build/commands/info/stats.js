"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
/**
 * Formats the bytes to its most divisible point
 * @param bytes The bytes to format
 * @param decimal The amount od decimals to display
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0';
    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const float = parseFloat((bytes / Math.pow(k, i)).toFixed(dm)).toString();
    return float;
}
class StatsCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            group: 'info',
            description: 'Displays some statistics of the bot.',
            guarded: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { client } = context;
        const { user, uptime } = client;
        const guilds = client.guilds.cache;
        const users = guilds.reduce((a, g) => a + g.memberCount, 0).toLocaleString();
        const uptimeString = (0, better_ms_1.prettyMs)(uptime, { verbose: true, unitCount: 2 });
        // The memory usage in MB
        const { heapUsed, rss } = process.memoryUsage();
        const usedMemory = formatBytes(heapUsed, 2);
        const maxMemory = formatBytes(rss, 2);
        const stats = new discord_js_1.EmbedBuilder()
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `${user.username}'s stats`,
            iconURL: user.displayAvatarURL({ forceStatic: false }),
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
        await (0, utils_1.replyAll)(context, stats);
    }
}
exports.default = StatsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvaW5mby9zdGF0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFxQztBQUNyQywyQ0FBMEM7QUFDMUMscURBQTBFO0FBQzFFLHVDQUFtRDtBQUVuRDs7OztHQUlHO0FBQ0gsU0FBUyxXQUFXLENBQUMsS0FBYSxFQUFFLFFBQVEsR0FBRyxDQUFDO0lBQzVDLElBQUksS0FBSyxLQUFLLENBQUM7UUFBRSxPQUFPLEdBQUcsQ0FBQztJQUU1QixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDZixNQUFNLEVBQUUsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUV2QyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BELE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FDcEIsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQ3ZDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFYixPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBRUQsTUFBcUIsWUFBYSxTQUFRLHlCQUFPO0lBQzdDLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsT0FBTztZQUNiLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLHNDQUFzQztZQUNuRCxPQUFPLEVBQUUsSUFBSTtZQUNiLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUI7UUFDcEMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMzQixNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUNoQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNuQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFN0UsTUFBTSxZQUFZLEdBQUcsSUFBQSxvQkFBUSxFQUFDLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFdkUseUJBQXlCO1FBQ3pCLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2hELE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDNUMsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV0QyxNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDM0IsUUFBUSxDQUFDLGtCQUFVLENBQUM7YUFDcEIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsVUFBVTtZQUNoQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQ3pELENBQUM7YUFDRCxTQUFTLENBQUM7WUFDUCxJQUFJLEVBQUUsU0FBUztZQUNmLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNuQyxNQUFNLEVBQUUsSUFBSTtTQUNmLEVBQUU7WUFDQyxJQUFJLEVBQUUsT0FBTztZQUNiLEtBQUssRUFBRSxLQUFLO1lBQ1osTUFBTSxFQUFFLElBQUk7U0FDZixFQUFFO1lBQ0MsSUFBSSxFQUFFLGNBQWM7WUFDcEIsS0FBSyxFQUFFLEdBQUcsVUFBVSxJQUFJLFNBQVMsS0FBSztZQUN0QyxNQUFNLEVBQUUsSUFBSTtTQUNmLEVBQUU7WUFDQyxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxZQUFZO1lBQ25CLE1BQU0sRUFBRSxJQUFJO1NBQ2YsQ0FBQzthQUNELFlBQVksRUFBRSxDQUFDO1FBRXBCLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0NBQ0o7QUFuREQsK0JBbURDIn0=