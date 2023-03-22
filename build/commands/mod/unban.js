"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'user',
        prompt: 'What user do you want to unban?',
        type: 'user',
    }, {
        key: 'reason',
        prompt: 'What is the reason of the unban?',
        type: 'string',
        max: 512,
        default: 'No reason given.',
    }];
class UnbanCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'unban',
            group: 'mod',
            description: 'Unban a user.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`user\` has to be a user's ID or mention.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'unban [user] <reason>',
            examples: [
                'unban 667937325002784768',
                'unban 802267523058761759 Appealed',
            ],
            clientPermissions: ['BanMembers'],
            userPermissions: ['BanMembers'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { user, reason }) {
        reason ??= 'No reason given.';
        const { members, bans, database } = context.guild;
        const { active } = database;
        const isBanned = await bans.fetch(user).catch(() => null);
        if (!isBanned) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not banned.',
            }));
            return;
        }
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: 'unban',
            target: user,
            reason,
        });
        if (!confirmed)
            return;
        await members.unban(user, reason);
        const data = await active.fetch({ type: 'temp-ban', userId: user.id });
        if (data)
            await active.delete(data);
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `${user.tag} has been unbanned`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
}
exports.default = UnbanCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5iYW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kL3VuYmFuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLHFEQUE2RjtBQUM3Rix1Q0FBZ0U7QUFFaEUsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGlDQUFpQztRQUN6QyxJQUFJLEVBQUUsTUFBTTtLQUNmLEVBQUU7UUFDQyxHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSxrQ0FBa0M7UUFDMUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxHQUFHLEVBQUUsR0FBRztRQUNSLE9BQU8sRUFBRSxrQkFBa0I7S0FDOUIsQ0FBVSxDQUFDO0FBS1osTUFBcUIsWUFBYSxTQUFRLHlCQUFzQjtJQUM1RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUUsS0FBSztZQUNaLFdBQVcsRUFBRSxlQUFlO1lBQzVCLG1CQUFtQixFQUFFLElBQUEseUJBQVcsRUFBQTs7O2FBRy9CO1lBQ0QsTUFBTSxFQUFFLHVCQUF1QjtZQUMvQixRQUFRLEVBQUU7Z0JBQ04sMEJBQTBCO2dCQUMxQixtQ0FBbUM7YUFDdEM7WUFDRCxpQkFBaUIsRUFBRSxDQUFDLFlBQVksQ0FBQztZQUNqQyxlQUFlLEVBQUUsQ0FBQyxZQUFZLENBQUM7WUFDL0IsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBYztRQUN4RSxNQUFNLEtBQUssa0JBQWtCLENBQUM7UUFDOUIsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUNsRCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO1FBRTVCLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNYLE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDNUIsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsV0FBVyxFQUFFLDBCQUEwQjthQUMxQyxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSxzQkFBYyxFQUFDLE9BQU8sRUFBRTtZQUM1QyxNQUFNLEVBQUUsT0FBTztZQUNmLE1BQU0sRUFBRSxJQUFJO1lBQ1osTUFBTTtTQUNULENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUV2QixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRWxDLE1BQU0sSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksSUFBSTtZQUFFLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVwQyxNQUFNLElBQUEsYUFBSyxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7WUFDNUIsS0FBSyxFQUFFLE9BQU87WUFDZCxLQUFLLEVBQUUsT0FBTztZQUNkLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLG9CQUFvQjtZQUMxQyxVQUFVLEVBQUUsZUFBZSxNQUFNLEVBQUU7U0FDdEMsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0NBQ0o7QUF6REQsK0JBeURDIn0=