"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'member',
        prompt: 'What member do you want to change/remove the nick?',
        type: 'member',
    }, {
        key: 'nickname',
        prompt: 'What will be their new nickname? Type `remove` to remove their current nickname.',
        type: 'string',
        max: 32,
    }];
class NickCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'nick',
            aliases: ['nickname', 'setnick'],
            group: 'mod',
            description: 'Change the nickname of a member or remove it.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`member\` can be either a member's name, mention or ID.
                \`nick\` will be the member's new nickname.
                Setting \`nick\` as \`remove\` will remove the member's current nickname.
            `,
            format: 'nick [member] [nick]',
            examples: [
                'nick Pixoll Cool coder',
                'nick Pixoll remove',
            ],
            clientPermissions: ['ManageNicknames'],
            userPermissions: ['ManageNicknames'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { member: passedMember, nickname }) {
        const { author, guild } = context;
        const member = await guild.members.fetch(passedMember.id).catch(() => null);
        if (!member) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }
        const { tag, username } = member.user;
        if (!member.manageable) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: `Unable to change ${member.toString()}'s nickname`,
                fieldValue: 'Please check the role hierarchy or server ownership.',
            }));
            return;
        }
        const isRemove = nickname.toLowerCase() === 'remove';
        const toApply = isRemove ? username : nickname;
        const wasApplied = await member.setNickname(toApply, `${author.tag} changed nickname via "${this.name}" command.`).catch(() => false).then(v => !!v);
        if (!wasApplied) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'An error occurred when trying to change that member\'s nickname. Please try again.',
            }));
            return;
        }
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: isRemove
                ? `Removed \`${tag}\`'s nickname.`
                : `Changed \`${tag}\`'s nickname to \`${nickname}\``,
        }));
    }
}
exports.default = NickCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmljay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2Qvbmljay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQyxxREFBNkY7QUFDN0YsdUNBQWdEO0FBRWhELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSxvREFBb0Q7UUFDNUQsSUFBSSxFQUFFLFFBQVE7S0FDakIsRUFBRTtRQUNDLEdBQUcsRUFBRSxVQUFVO1FBQ2YsTUFBTSxFQUFFLGtGQUFrRjtRQUMxRixJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxFQUFFO0tBQ1YsQ0FBVSxDQUFDO0FBS1osTUFBcUIsV0FBWSxTQUFRLHlCQUFzQjtJQUMzRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO1lBQ2hDLEtBQUssRUFBRSxLQUFLO1lBQ1osV0FBVyxFQUFFLCtDQUErQztZQUM1RCxtQkFBbUIsRUFBRSxJQUFBLHlCQUFXLEVBQUE7Ozs7YUFJL0I7WUFDRCxNQUFNLEVBQUUsc0JBQXNCO1lBQzlCLFFBQVEsRUFBRTtnQkFDTix3QkFBd0I7Z0JBQ3hCLG9CQUFvQjthQUN2QjtZQUNELGlCQUFpQixFQUFFLENBQUMsaUJBQWlCLENBQUM7WUFDdEMsZUFBZSxFQUFFLENBQUMsaUJBQWlCLENBQUM7WUFDcEMsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQWM7UUFDMUYsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDbEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxNQUFNLElBQUEsYUFBSyxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQzVCLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxPQUFPO2dCQUNkLFdBQVcsRUFBRSxzQ0FBc0M7YUFDdEQsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7WUFDcEIsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUM1QixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxTQUFTLEVBQUUsb0JBQW9CLE1BQU0sQ0FBQyxRQUFRLEVBQUUsYUFBYTtnQkFDN0QsVUFBVSxFQUFFLHNEQUFzRDthQUNyRSxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsS0FBSyxRQUFRLENBQUM7UUFFckQsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUMvQyxNQUFNLFVBQVUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxXQUFXLENBQ3ZDLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLDBCQUEwQixJQUFJLENBQUMsSUFBSSxZQUFZLENBQ3hFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2IsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUM1QixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxXQUFXLEVBQUUsb0ZBQW9GO2FBQ3BHLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO1lBQzVCLEtBQUssRUFBRSxPQUFPO1lBQ2QsS0FBSyxFQUFFLE9BQU87WUFDZCxXQUFXLEVBQUUsUUFBUTtnQkFDakIsQ0FBQyxDQUFDLGFBQWEsR0FBRyxnQkFBZ0I7Z0JBQ2xDLENBQUMsQ0FBQyxhQUFhLEdBQUcsc0JBQXNCLFFBQVEsSUFBSTtTQUMzRCxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7Q0FDSjtBQXZFRCw4QkF1RUMifQ==