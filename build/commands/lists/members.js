"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'role',
        prompt: 'What role do you want to get the members from?',
        type: 'role',
    }];
class MembersCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'members',
            group: 'lists',
            description: 'Displays a list of members in a role.',
            details: '`role` can be either a role\'s name, mention or ID.',
            format: 'members [role]',
            examples: ['members Staff'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { role }) {
        const members = role.members.sort((a, b) => (0, utils_1.abcOrder)(a.user.tag, b.user.tag))
            .map(member => `${member.toString()} ${member.user.tag}`);
        if (members.length === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: `The \`${role.name}\` role has no members.`,
            }));
            return;
        }
        const { guild } = context;
        await (0, utils_1.generateEmbed)(context, members, {
            number: 20,
            authorName: `There's ${(0, utils_1.pluralize)('member', members.length)} in ${role.name}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            useDescription: true,
        });
    }
}
exports.default = MembersCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtYmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9saXN0cy9tZW1iZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQTZGO0FBQzdGLHVDQUF1RjtBQUV2RixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxNQUFNLEVBQUUsZ0RBQWdEO1FBQ3hELElBQUksRUFBRSxNQUFNO0tBQ2YsQ0FBVSxDQUFDO0FBS1osTUFBcUIsY0FBZSxTQUFRLHlCQUFzQjtJQUM5RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFNBQVM7WUFDZixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSx1Q0FBdUM7WUFDcEQsT0FBTyxFQUFFLHFEQUFxRDtZQUM5RCxNQUFNLEVBQUUsZ0JBQWdCO1lBQ3hCLFFBQVEsRUFBRSxDQUFDLGVBQWUsQ0FBQztZQUMzQixTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxJQUFJLEVBQWM7UUFDaEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFBLGdCQUFRLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN4RSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFOUQsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN0QixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsTUFBTTtnQkFDYixXQUFXLEVBQUUsU0FBUyxJQUFJLENBQUMsSUFBSSx5QkFBeUI7YUFDM0QsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzFCLE1BQU0sSUFBQSxxQkFBYSxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUU7WUFDbEMsTUFBTSxFQUFFLEVBQUU7WUFDVixVQUFVLEVBQUUsV0FBVyxJQUFBLGlCQUFTLEVBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQzVFLGFBQWEsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQ3BELGNBQWMsRUFBRSxJQUFJO1NBQ3ZCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXBDRCxpQ0FvQ0MifQ==