"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
class PollsCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'polls',
            group: 'lists',
            description: 'Displays all the on-going polls on this server. Use the `poll` command to add polls.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { guild } = context;
        const pollsData = await guild.database.polls.fetchMany();
        if (pollsData.size === 0) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no active polls.',
            }));
            return;
        }
        const polls = pollsData.map(poll => ({
            endsAt: poll.duration,
            ...pixoll_commando_1.Util.omit(poll, ['duration']),
        }));
        await (0, utils_1.generateEmbed)(context, polls, {
            number: 5,
            authorName: `There's ${(0, utils_1.pluralize)('active poll', pollsData.size)}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            title: 'Poll',
            keys: ['channel', 'endsAt'],
        });
    }
}
exports.default = PollsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbGlzdHMvcG9sbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBZ0Y7QUFDaEYsdUNBQTBFO0FBRTFFLE1BQXFCLFlBQWEsU0FBUSx5QkFBYTtJQUNuRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxzRkFBc0Y7WUFDbkcsU0FBUyxFQUFFLElBQUk7WUFDZix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCO1FBQzFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDMUIsTUFBTSxTQUFTLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN6RCxJQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDNUIsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsV0FBVyxFQUFFLDRCQUE0QjthQUM1QyxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUTtZQUNyQixHQUFHLHNCQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ25DLENBQUMsQ0FBQyxDQUFDO1FBRUosTUFBTSxJQUFBLHFCQUFhLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBRTtZQUNoQyxNQUFNLEVBQUUsQ0FBQztZQUNULFVBQVUsRUFBRSxXQUFXLElBQUEsaUJBQVMsRUFBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2pFLGFBQWEsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQ3BELEtBQUssRUFBRSxNQUFNO1lBQ2IsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQztTQUM5QixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFwQ0QsK0JBb0NDIn0=