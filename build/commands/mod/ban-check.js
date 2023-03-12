"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'user',
        prompt: 'What user do you want to check their ban?',
        type: 'user',
    }];
class BanCheckCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'ban-check',
            aliases: ['bancheck', 'checkban'],
            group: 'mod',
            description: 'Check if a user is banned.',
            detailedDescription: '`user` has to be a user\'s username, ID or mention.',
            format: 'ban-check [user]',
            examples: ['ban-check Pixoll'],
            clientPermissions: ['BanMembers'],
            userPermissions: ['BanMembers'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { user }) {
        const { guild } = context;
        const ban = await guild.bans.fetch(user).catch(() => null);
        if (!ban) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: `${user.toString()} is not banned.`,
            }));
            return;
        }
        const reason = ban.reason?.replace(/%20/g, ' ') || 'No reason given.';
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Blue',
            fieldName: `${user.tag} is banned`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
}
exports.default = BanCheckCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFuLWNoZWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21vZC9iYW4tY2hlY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBNkY7QUFDN0YsdUNBQW1EO0FBRW5ELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSwyQ0FBMkM7UUFDbkQsSUFBSSxFQUFFLE1BQU07S0FDZixDQUFVLENBQUM7QUFLWixNQUFxQixlQUFnQixTQUFRLHlCQUFzQjtJQUMvRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFdBQVc7WUFDakIsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQztZQUNqQyxLQUFLLEVBQUUsS0FBSztZQUNaLFdBQVcsRUFBRSw0QkFBNEI7WUFDekMsbUJBQW1CLEVBQUUscURBQXFEO1lBQzFFLE1BQU0sRUFBRSxrQkFBa0I7WUFDMUIsUUFBUSxFQUFFLENBQUMsa0JBQWtCLENBQUM7WUFDOUIsaUJBQWlCLEVBQUUsQ0FBQyxZQUFZLENBQUM7WUFDakMsZUFBZSxFQUFFLENBQUMsWUFBWSxDQUFDO1lBQy9CLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkIsRUFBRSxFQUFFLElBQUksRUFBYztRQUNoRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRTFCLE1BQU0sR0FBRyxHQUFHLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDTixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsTUFBTTtnQkFDYixXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLGlCQUFpQjthQUNuRCxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSSxrQkFBa0IsQ0FBQztRQUV0RSxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO1lBQy9CLEtBQUssRUFBRSxNQUFNO1lBQ2IsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsWUFBWTtZQUNsQyxVQUFVLEVBQUUsZUFBZSxNQUFNLEVBQUU7U0FDdEMsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0NBQ0o7QUF2Q0Qsa0NBdUNDIn0=