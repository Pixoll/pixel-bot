"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
class ModeratorsCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'moderators',
            aliases: ['mods'],
            group: 'lists',
            description: 'Displays a list of all moderators of this server with their mod roles.',
            details: 'Use the `admins` command for a list of the server\'s admins',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { guild } = context;
        const members = guild.members.cache;
        const mods = members.filter(member => (0, utils_1.isModerator)(member, true) && !member.user.bot);
        if (mods.size === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no moderators, try running the `administrators` command instead.',
            }));
            return;
        }
        const modsList = mods.sort((a, b) => b.roles.highest.position - a.roles.highest.position)
            .map(member => ({
            tag: member.user.tag,
            list: member.roles.cache.filter(m => (0, utils_1.isModerator)(m, true)).sort((a, b) => b.position - a.position)
                .map(r => r.name).join(', ') || 'None',
        }));
        await (0, utils_1.generateEmbed)(context, modsList, {
            authorName: `There's ${(0, utils_1.pluralize)('moderator', modsList.length)}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            keyTitle: { suffix: 'tag' },
        });
    }
}
exports.default = ModeratorsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZXJhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9saXN0cy9tb2RlcmF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQTBFO0FBQzFFLHVDQUEwRjtBQUUxRixNQUFxQixpQkFBa0IsU0FBUSx5QkFBYTtJQUN4RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFlBQVk7WUFDbEIsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ2pCLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLHdFQUF3RTtZQUNyRixPQUFPLEVBQUUsNkRBQTZEO1lBQ3RFLFNBQVMsRUFBRSxJQUFJO1lBQ2Ysd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QjtRQUMxQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRTFCLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ3BDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFBLG1CQUFXLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyRixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ2pCLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQy9CLEtBQUssRUFBRSxNQUFNO2dCQUNiLEtBQUssRUFBRSxNQUFNO2dCQUNiLFdBQVcsRUFBRSw0RUFBNEU7YUFDNUYsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQzthQUNwRixHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ1osR0FBRyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRztZQUNwQixJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBQSxtQkFBVyxFQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztpQkFDN0YsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNO1NBQzdDLENBQUMsQ0FBQyxDQUFDO1FBRVIsTUFBTSxJQUFBLHFCQUFhLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRTtZQUNuQyxVQUFVLEVBQUUsV0FBVyxJQUFBLGlCQUFTLEVBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNoRSxhQUFhLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUNwRCxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFO1NBQzlCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXhDRCxvQ0F3Q0MifQ==