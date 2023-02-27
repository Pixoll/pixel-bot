"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_ms_1 = require("better-ms");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
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
/** A command that can be run in a client */
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
        await (0, functions_1.replyAll)(context, stats);
    }
}
exports.default = StatsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvaW5mby9zdGF0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFxQztBQUNyQywyQ0FBMEM7QUFDMUMscURBQTBFO0FBQzFFLHFEQUFpRDtBQUVqRDs7OztHQUlHO0FBQ0gsU0FBUyxXQUFXLENBQUMsS0FBYSxFQUFFLFFBQVEsR0FBRyxDQUFDO0lBQzVDLElBQUksS0FBSyxLQUFLLENBQUM7UUFBRSxPQUFPLEdBQUcsQ0FBQztJQUU1QixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDZixNQUFNLEVBQUUsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUV2QyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BELE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FDcEIsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQ3ZDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFYixPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBRUQsNENBQTRDO0FBQzVDLE1BQXFCLFlBQWEsU0FBUSx5QkFBTztJQUM3QyxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSxzQ0FBc0M7WUFDbkQsT0FBTyxFQUFFLElBQUk7WUFDYix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCO1FBQ3BDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDM0IsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDaEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDbkMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRTdFLE1BQU0sWUFBWSxHQUFHLElBQUEsb0JBQVEsRUFBQyxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRXZFLHlCQUF5QjtRQUN6QixNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNoRCxNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFdEMsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzNCLFFBQVEsQ0FBQyxTQUFTLENBQUM7YUFDbkIsU0FBUyxDQUFDO1lBQ1AsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDM0YsQ0FBQzthQUNELFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxTQUFTO1lBQ2YsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ25DLE1BQU0sRUFBRSxJQUFJO1NBQ2YsRUFBRTtZQUNDLElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFLEtBQUs7WUFDWixNQUFNLEVBQUUsSUFBSTtTQUNmLEVBQUU7WUFDQyxJQUFJLEVBQUUsY0FBYztZQUNwQixLQUFLLEVBQUUsR0FBRyxVQUFVLElBQUksU0FBUyxLQUFLO1lBQ3RDLE1BQU0sRUFBRSxJQUFJO1NBQ2YsRUFBRTtZQUNDLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLFlBQVk7WUFDbkIsTUFBTSxFQUFFLElBQUk7U0FDZixDQUFDO2FBQ0QsWUFBWSxFQUFFLENBQUM7UUFFcEIsTUFBTSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENBQUM7Q0FDSjtBQWxERCwrQkFrREMifQ==