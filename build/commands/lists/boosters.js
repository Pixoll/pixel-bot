"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
class BoostersCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'boosters',
            aliases: ['boosts'],
            group: 'lists',
            description: 'Displays a list of the members that have boosted the server.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { guild } = context;
        const members = guild.members.cache;
        const boosters = members.filter(member => member.roles.premiumSubscriberRole)
            .sort((a, b) => (0, utils_1.abcOrder)(a.user.tag, b.user.tag))
            .map(m => `${m.toString()} ${m.user.tag}`);
        if (boosters.length === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no boosters in this server.',
            }));
            return;
        }
        await (0, utils_1.generateEmbed)(context, boosters, {
            number: 20,
            authorName: `There's ${(0, utils_1.pluralize)('booster', boosters.length)}`,
            useDescription: true,
        });
    }
}
exports.default = BoostersCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vc3RlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbGlzdHMvYm9vc3RlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBMEU7QUFDMUUsdUNBQXVGO0FBRXZGLE1BQXFCLGVBQWdCLFNBQVEseUJBQWE7SUFDdEQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxVQUFVO1lBQ2hCLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNuQixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSw4REFBOEQ7WUFDM0UsU0FBUyxFQUFFLElBQUk7WUFDZix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCO1FBQzFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDMUIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDcEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUM7YUFDeEUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBQSxnQkFBUSxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDaEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRS9DLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDdkIsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsV0FBVyxFQUFFLHVDQUF1QzthQUN2RCxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sSUFBQSxxQkFBYSxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUU7WUFDbkMsTUFBTSxFQUFFLEVBQUU7WUFDVixVQUFVLEVBQUUsV0FBVyxJQUFBLGlCQUFTLEVBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM5RCxjQUFjLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFsQ0Qsa0NBa0NDIn0=