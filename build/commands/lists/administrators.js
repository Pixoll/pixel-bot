"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
class AdministratorsCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'administrators',
            aliases: ['admins'],
            group: 'lists',
            description: 'Displays a list of all administrators of the server with their admin roles.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { guild } = context;
        const members = guild.members.cache;
        const admins = members.filter(member => member.permissions.has('Administrator') && !member.user.bot);
        if (!admins || admins.size === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no administrators, try running the `moderators` command instead.',
            }));
            return;
        }
        const adminsList = admins.sort((a, b) => b.roles.highest.position - a.roles.highest.position)
            .map(member => ({
            tag: member.user.tag,
            list: '**Roles:** ' + (member.roles.cache.filter(r => r.permissions.has('Administrator'))
                .sort((a, b) => b.position - a.position).map(r => r.name).join(', ') || 'None'),
        }));
        await (0, utils_1.generateEmbed)(context, adminsList, {
            authorName: `There's ${(0, utils_1.pluralize)('administrator', adminsList.length)}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            keyTitle: { suffix: 'tag' },
        });
    }
}
exports.default = AdministratorsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW5pc3RyYXRvcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbGlzdHMvYWRtaW5pc3RyYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBMEU7QUFDMUUsdUNBQTZFO0FBRTdFLE1BQXFCLHFCQUFzQixTQUFRLHlCQUFhO0lBQzVELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsZ0JBQWdCO1lBQ3RCLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNuQixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSw2RUFBNkU7WUFDMUYsU0FBUyxFQUFFLElBQUk7WUFDZix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCO1FBQzFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDMUIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFFcEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyRyxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQzlCLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQy9CLEtBQUssRUFBRSxNQUFNO2dCQUNiLEtBQUssRUFBRSxNQUFNO2dCQUNiLFdBQVcsRUFBRSw0RUFBNEU7YUFDNUYsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQzthQUN4RixHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ1osR0FBRyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRztZQUNwQixJQUFJLEVBQUUsYUFBYSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7aUJBQ3BGLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDO1NBQ3RGLENBQUMsQ0FBQyxDQUFDO1FBRVIsTUFBTSxJQUFBLHFCQUFhLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRTtZQUNyQyxVQUFVLEVBQUUsV0FBVyxJQUFBLGlCQUFTLEVBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN0RSxhQUFhLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUNwRCxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFO1NBQzlCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXZDRCx3Q0F1Q0MifQ==