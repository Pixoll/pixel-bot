"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
class BansCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'bans',
            group: 'mod-logs',
            description: 'Displays all the bans of the server.',
            clientPermissions: ['BanMembers'],
            userPermissions: ['BanMembers'],
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { guild } = context;
        const bans = await guild.bans.fetch().catch(() => null);
        if (!bans || bans.size === 0) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no bans in this server.',
            }));
            return;
        }
        const bansList = bans.map(({ user, reason }) => ({
            tag: user.tag,
            id: user.id,
            reason: reason?.replace(/%20/g, ' ') || 'No reason given.',
        })).sort((a, b) => (0, utils_1.abcOrder)(a.tag.toUpperCase(), b.tag.toUpperCase()));
        await (0, utils_1.generateEmbed)(context, bansList, {
            authorName: `${guild.name} has  ${(0, utils_1.pluralize)('ban', bansList.length)}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            keyTitle: { suffix: 'tag' },
        });
    }
}
exports.default = BansCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2QtbG9ncy9iYW5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQTBFO0FBQzFFLHVDQUFvRjtBQVFwRixNQUFxQixXQUFZLFNBQVEseUJBQWE7SUFDbEQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osS0FBSyxFQUFFLFVBQVU7WUFDakIsV0FBVyxFQUFFLHNDQUFzQztZQUNuRCxpQkFBaUIsRUFBRSxDQUFDLFlBQVksQ0FBQztZQUNqQyxlQUFlLEVBQUUsQ0FBQyxZQUFZLENBQUM7WUFDL0IsU0FBUyxFQUFFLElBQUk7WUFDZix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCO1FBQzFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFMUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQzFCLE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDNUIsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsV0FBVyxFQUFFLG1DQUFtQzthQUNuRCxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNsRCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDWCxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksa0JBQWtCO1NBQzdELENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUNkLElBQUEsZ0JBQVEsRUFBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FDckQsQ0FBQztRQUVGLE1BQU0sSUFBQSxxQkFBYSxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUU7WUFDbkMsVUFBVSxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksU0FBUyxJQUFBLGlCQUFTLEVBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNyRSxhQUFhLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUNwRCxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFO1NBQzlCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXhDRCw4QkF3Q0MifQ==