"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
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
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no active polls.',
            }));
            return;
        }
        await (0, functions_1.generateEmbed)(context, pollsData.toJSON(), {
            number: 5,
            authorName: `There's ${(0, functions_1.pluralize)('active poll', pollsData.size)}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            title: 'Poll',
            keys: ['channel', 'duration', 'endsAt'],
        });
    }
}
exports.default = PollsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbGlzdHMvcG9sbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBMEU7QUFDMUUscURBQXVGO0FBRXZGLE1BQXFCLFlBQWEsU0FBUSx5QkFBYTtJQUNuRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxzRkFBc0Y7WUFDbkcsU0FBUyxFQUFFLElBQUk7WUFDZix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCO1FBQzFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDMUIsTUFBTSxTQUFTLEdBQUcsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN6RCxJQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLE1BQU0sSUFBQSxvQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLHNCQUFVLEVBQUM7Z0JBQy9CLEtBQUssRUFBRSxNQUFNO2dCQUNiLEtBQUssRUFBRSxNQUFNO2dCQUNiLFdBQVcsRUFBRSw0QkFBNEI7YUFDNUMsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLElBQUEseUJBQWEsRUFBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQzdDLE1BQU0sRUFBRSxDQUFDO1lBQ1QsVUFBVSxFQUFFLFdBQVcsSUFBQSxxQkFBUyxFQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDakUsYUFBYSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFDcEQsS0FBSyxFQUFFLE1BQU07WUFDYixJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQztTQUMxQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUEvQkQsK0JBK0JDIn0=