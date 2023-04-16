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
            .map(member => member.user)
            .sort((0, utils_1.alphabeticalOrder)({
            sortKey: 'tag',
        }))
            .map(bot => `${bot.toString()} ${bot.tag}`);
        await (0, utils_1.generateEmbed)(context, botList, {
            number: 20,
            authorName: `There's ${(0, utils_1.pluralize)('bot', botList.length)}`,
            useDescription: true,
        });
    }
}
exports.default = BotListCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm90LWxpc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbGlzdHMvYm90LWxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBMEU7QUFDMUUsdUNBQTBFO0FBRTFFLE1BQXFCLGNBQWUsU0FBUSx5QkFBYTtJQUNyRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFVBQVU7WUFDaEIsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQztZQUM1QixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxzQ0FBc0M7WUFDbkQsU0FBUyxFQUFFLElBQUk7WUFDZix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCO1FBQzFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDMUIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDcEMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2FBQzFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7YUFDMUIsSUFBSSxDQUFDLElBQUEseUJBQWlCLEVBQUM7WUFDcEIsT0FBTyxFQUFFLEtBQUs7U0FDakIsQ0FBQyxDQUFDO2FBQ0YsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFaEQsTUFBTSxJQUFBLHFCQUFhLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRTtZQUNsQyxNQUFNLEVBQUUsRUFBRTtZQUNWLFVBQVUsRUFBRSxXQUFXLElBQUEsaUJBQVMsRUFBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3pELGNBQWMsRUFBRSxJQUFJO1NBQ3ZCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQTVCRCxpQ0E0QkMifQ==