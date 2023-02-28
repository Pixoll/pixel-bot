"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
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
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Role,
                    name: 'role',
                    description: 'The role to get the members from.',
                    required: true,
                }],
        });
    }
    async run(context, { role }) {
        const members = role.members.sort((a, b) => (0, functions_1.abcOrder)(a.user.tag, b.user.tag))
            .map(member => `${member.toString()} ${member.user.tag}`);
        if (members.length === 0) {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: `The \`${role.name}\` role has no members.`,
            }));
            return;
        }
        const { guild } = context;
        await (0, functions_1.generateEmbed)(context, members, {
            number: 20,
            authorName: `There's ${(0, functions_1.pluralize)('member', members.length)} in ${role.name}`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            useDescription: true,
        });
    }
}
exports.default = MembersCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtYmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9saXN0cy9tZW1iZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQTBEO0FBQzFELHFEQUE2RjtBQUM3RixxREFBaUc7QUFFakcsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLGdEQUFnRDtRQUN4RCxJQUFJLEVBQUUsTUFBTTtLQUNmLENBQVUsQ0FBQztBQUtaLE1BQXFCLGNBQWUsU0FBUSx5QkFBc0I7SUFDOUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxTQUFTO1lBQ2YsS0FBSyxFQUFFLE9BQU87WUFDZCxXQUFXLEVBQUUsdUNBQXVDO1lBQ3BELE9BQU8sRUFBRSxxREFBcUQ7WUFDOUQsTUFBTSxFQUFFLGdCQUFnQjtZQUN4QixRQUFRLEVBQUUsQ0FBQyxlQUFlLENBQUM7WUFDM0IsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1NBQ1AsRUFBRTtZQUNDLE9BQU8sRUFBRSxDQUFDO29CQUNOLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxJQUFJO29CQUN2QyxJQUFJLEVBQUUsTUFBTTtvQkFDWixXQUFXLEVBQUUsbUNBQW1DO29CQUNoRCxRQUFRLEVBQUUsSUFBSTtpQkFDakIsQ0FBQztTQUNMLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxJQUFJLEVBQWM7UUFDaEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFBLG9CQUFRLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN4RSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFOUQsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN0QixNQUFNLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxzQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsTUFBTTtnQkFDYixXQUFXLEVBQUUsU0FBUyxJQUFJLENBQUMsSUFBSSx5QkFBeUI7YUFDM0QsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzFCLE1BQU0sSUFBQSx5QkFBYSxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUU7WUFDbEMsTUFBTSxFQUFFLEVBQUU7WUFDVixVQUFVLEVBQUUsV0FBVyxJQUFBLHFCQUFTLEVBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQzVFLGFBQWEsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQ3BELGNBQWMsRUFBRSxJQUFJO1NBQ3ZCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQTFDRCxpQ0EwQ0MifQ==