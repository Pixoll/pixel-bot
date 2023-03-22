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
            detailedDescription: '`role` can be either a role\'s name, mention or ID.',
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtYmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9saXN0cy9tZW1iZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQTZGO0FBQzdGLHVDQUFvRjtBQUVwRixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxNQUFNLEVBQUUsZ0RBQWdEO1FBQ3hELElBQUksRUFBRSxNQUFNO0tBQ2YsQ0FBVSxDQUFDO0FBS1osTUFBcUIsY0FBZSxTQUFRLHlCQUFzQjtJQUM5RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFNBQVM7WUFDZixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSx1Q0FBdUM7WUFDcEQsbUJBQW1CLEVBQUUscURBQXFEO1lBQzFFLE1BQU0sRUFBRSxnQkFBZ0I7WUFDeEIsUUFBUSxFQUFFLENBQUMsZUFBZSxDQUFDO1lBQzNCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkIsRUFBRSxFQUFFLElBQUksRUFBYztRQUNoRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUEsZ0JBQVEsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3hFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUU5RCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDNUIsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsV0FBVyxFQUFFLFNBQVMsSUFBSSxDQUFDLElBQUkseUJBQXlCO2FBQzNELENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMxQixNQUFNLElBQUEscUJBQWEsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFO1lBQ2xDLE1BQU0sRUFBRSxFQUFFO1lBQ1YsVUFBVSxFQUFFLFdBQVcsSUFBQSxpQkFBUyxFQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRTtZQUM1RSxhQUFhLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUNwRCxjQUFjLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFwQ0QsaUNBb0NDIn0=