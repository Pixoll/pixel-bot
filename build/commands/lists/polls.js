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
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbGlzdHMvcG9sbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBZ0Y7QUFDaEYsdUNBQTZFO0FBRTdFLE1BQXFCLFlBQWEsU0FBUSx5QkFBYTtJQUNuRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxzRkFBc0Y7WUFDbkcsU0FBUyxFQUFFLElBQUk7WUFDZix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCO1FBQzFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDMUIsTUFBTSxTQUFTLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN6RCxJQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQy9CLEtBQUssRUFBRSxNQUFNO2dCQUNiLEtBQUssRUFBRSxNQUFNO2dCQUNiLFdBQVcsRUFBRSw0QkFBNEI7YUFDNUMsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDckIsR0FBRyxzQkFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNuQyxDQUFDLENBQUMsQ0FBQztRQUVKLE1BQU0sSUFBQSxxQkFBYSxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUU7WUFDaEMsTUFBTSxFQUFFLENBQUM7WUFDVCxVQUFVLEVBQUUsV0FBVyxJQUFBLGlCQUFTLEVBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqRSxhQUFhLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUNwRCxLQUFLLEVBQUUsTUFBTTtZQUNiLElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUM7U0FDOUIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBcENELCtCQW9DQyJ9