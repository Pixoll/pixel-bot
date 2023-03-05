"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
class BotListCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'bot-list',
            aliases: ['bots', 'botlist'],
            group: 'lists',
            description: 'Displays the bot list of the server.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { guild } = context;
        const members = guild.members.cache;
        const botList = members.filter(m => m.user.bot)
            .sort((a, b) => (0, utils_1.abcOrder)(a.user.tag, b.user.tag))
            .map(bot => `${bot.toString()} ${bot.user.tag}`);
        await (0, utils_1.generateEmbed)(context, botList, {
            number: 20,
            authorName: `There's ${(0, utils_1.pluralize)('bot', botList.length)}`,
            useDescription: true,
        });
    }
}
exports.default = BotListCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm90LWxpc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbGlzdHMvYm90LWxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBMEU7QUFDMUUsdUNBQWlFO0FBRWpFLE1BQXFCLGNBQWUsU0FBUSx5QkFBYTtJQUNyRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFVBQVU7WUFDaEIsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQztZQUM1QixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxzQ0FBc0M7WUFDbkQsU0FBUyxFQUFFLElBQUk7WUFDZix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCO1FBQzFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDMUIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDcEMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2FBQzFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUEsZ0JBQVEsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2hELEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUVyRCxNQUFNLElBQUEscUJBQWEsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFO1lBQ2xDLE1BQU0sRUFBRSxFQUFFO1lBQ1YsVUFBVSxFQUFFLFdBQVcsSUFBQSxpQkFBUyxFQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDekQsY0FBYyxFQUFFLElBQUk7U0FDdkIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBekJELGlDQXlCQyJ9