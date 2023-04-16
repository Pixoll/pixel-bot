"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
class InvitesCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'invites',
            group: 'lists',
            description: 'Displays a list of all the invites of this server, ordered by most to least used.',
            clientPermissions: ['ManageGuild'],
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { guild } = context;
        const invites = await guild.invites.fetch().catch(() => null);
        if (!invites || invites.size === 0) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There are no invites in this server.',
            }));
            return;
        }
        const invitesList = invites.map(invite => ({
            uses: invite.uses ?? 0,
            inviter: invite.inviter
                ? `${invite.inviter.toString()} ${invite.inviter.tag}`
                : 'Inviter is unavailable.',
            channel: invite.channel?.toString(),
            link: invite.url,
            code: invite.code,
            expires: (0, utils_1.timestamp)(invite.expiresTimestamp, 'R', true) ?? 'Never',
        })).sort((a, b) => b.uses - a.uses);
        await (0, utils_1.generateEmbed)(context, invitesList, {
            authorName: `There's ${(0, utils_1.pluralize)('invite', invitesList.length)}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            keyTitle: { suffix: 'link' },
        });
    }
}
exports.default = InvitesCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52aXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9saXN0cy9pbnZpdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQTBFO0FBQzFFLHVDQUFxRjtBQUVyRixNQUFxQixjQUFlLFNBQVEseUJBQWE7SUFDckQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxTQUFTO1lBQ2YsS0FBSyxFQUFFLE9BQU87WUFDZCxXQUFXLEVBQUUsbUZBQW1GO1lBQ2hHLGlCQUFpQixFQUFFLENBQUMsYUFBYSxDQUFDO1lBQ2xDLFNBQVMsRUFBRSxJQUFJO1lBQ2Ysd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QjtRQUMxQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRTFCLE1BQU0sT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtZQUNoQyxNQUFNLElBQUEsYUFBSyxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQzVCLEtBQUssRUFBRSxNQUFNO2dCQUNiLEtBQUssRUFBRSxNQUFNO2dCQUNiLFdBQVcsRUFBRSxzQ0FBc0M7YUFDdEQsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN2QyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDO1lBQ3RCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztnQkFDbkIsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDdEQsQ0FBQyxDQUFDLHlCQUF5QjtZQUMvQixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUU7WUFDbkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxHQUFHO1lBQ2hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtZQUNqQixPQUFPLEVBQUUsSUFBQSxpQkFBUyxFQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksT0FBTztTQUNwRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVwQyxNQUFNLElBQUEscUJBQWEsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFO1lBQ3RDLFVBQVUsRUFBRSxXQUFXLElBQUEsaUJBQVMsRUFBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2hFLGFBQWEsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQ3BELFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUU7U0FDL0IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBMUNELGlDQTBDQyJ9