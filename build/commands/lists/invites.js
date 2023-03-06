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
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52aXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9saXN0cy9pbnZpdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQTBFO0FBQzFFLHVDQUF3RjtBQUV4RixNQUFxQixjQUFlLFNBQVEseUJBQWE7SUFDckQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxTQUFTO1lBQ2YsS0FBSyxFQUFFLE9BQU87WUFDZCxXQUFXLEVBQUUsbUZBQW1GO1lBQ2hHLGlCQUFpQixFQUFFLENBQUMsYUFBYSxDQUFDO1lBQ2xDLFNBQVMsRUFBRSxJQUFJO1lBQ2Ysd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QjtRQUMxQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRTFCLE1BQU0sT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtZQUNoQyxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsTUFBTTtnQkFDYixXQUFXLEVBQUUsc0NBQXNDO2FBQ3RELENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQztZQUN0QixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87Z0JBQ25CLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7Z0JBQ3RELENBQUMsQ0FBQyx5QkFBeUI7WUFDL0IsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFO1lBQ25DLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRztZQUNoQixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7WUFDakIsT0FBTyxFQUFFLElBQUEsaUJBQVMsRUFBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLE9BQU87U0FDcEUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFcEMsTUFBTSxJQUFBLHFCQUFhLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRTtZQUN0QyxVQUFVLEVBQUUsV0FBVyxJQUFBLGlCQUFTLEVBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNoRSxhQUFhLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUNwRCxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFO1NBQy9CLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQTFDRCxpQ0EwQ0MifQ==