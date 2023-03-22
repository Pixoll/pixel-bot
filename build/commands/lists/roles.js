"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'member',
        prompt: 'What member do you want to get the roles from?',
        type: 'member',
        required: false,
    }];
class RolesCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'roles',
            group: 'lists',
            description: 'Displays a list of roles in the server, or the roles of a specific member.',
            detailedDescription: '`member` can be either a member\'s name, mention or ID.',
            format: 'roles <member>',
            examples: ['roles Pixoll'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { member }) {
        const { guild, guildId } = context;
        const guildMember = member ? await guild.members.fetch(member.id).catch(() => null) : null;
        const memberRoles = guildMember?.roles.cache.filter(role => role.id !== guildId);
        const guildRoles = !memberRoles
            ? await guild.roles.fetch().catch(() => null)
            : null;
        const rolesCache = memberRoles ?? guildRoles?.filter(role => role.id !== guildId);
        if (!rolesCache || rolesCache.size === 0) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'I couldn\'t find any roles.',
            }));
            return;
        }
        const roles = rolesCache.sort((a, b) => b.position - a.position).map(r => `${r.toString()} ${r.name}`) ?? null;
        if (!roles) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'This member has no roles.',
            }));
            return;
        }
        const name = guildMember?.user.username ?? guild.name;
        const avatar = guildMember?.displayAvatarURL({ forceStatic: false })
            || guild.iconURL({ forceStatic: false });
        await (0, utils_1.generateEmbed)(context, roles, {
            number: 20,
            authorName: `${name} has ${(0, utils_1.pluralize)('role', roles.length)}`,
            authorIconURL: avatar,
            useDescription: true,
        });
    }
}
exports.default = RolesCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbGlzdHMvcm9sZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxxREFBNkY7QUFDN0YsdUNBQTBFO0FBRTFFLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSxnREFBZ0Q7UUFDeEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsS0FBSztLQUNsQixDQUFVLENBQUM7QUFLWixNQUFxQixZQUFhLFNBQVEseUJBQXNCO0lBQzVELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsT0FBTztZQUNiLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLDRFQUE0RTtZQUN6RixtQkFBbUIsRUFBRSx5REFBeUQ7WUFDOUUsTUFBTSxFQUFFLGdCQUFnQjtZQUN4QixRQUFRLEVBQUUsQ0FBQyxjQUFjLENBQUM7WUFDMUIsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsTUFBTSxFQUFjO1FBQ2xFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRW5DLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDM0YsTUFBTSxXQUFXLEdBQUcsV0FBVyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUNqRixNQUFNLFVBQVUsR0FBRyxDQUFDLFdBQVc7WUFDM0IsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUE2QjtZQUN6RSxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRVgsTUFBTSxVQUFVLEdBQUcsV0FBVyxJQUFJLFVBQVUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQ2xGLElBQUksQ0FBQyxVQUFVLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7WUFDdEMsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUM1QixLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsTUFBTTtnQkFDYixXQUFXLEVBQUUsNkJBQTZCO2FBQzdDLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUMvRyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1IsTUFBTSxJQUFBLGFBQUssRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUM1QixLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsTUFBTTtnQkFDYixXQUFXLEVBQUUsMkJBQTJCO2FBQzNDLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxJQUFJLEdBQUcsV0FBVyxFQUFFLElBQUksQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQztRQUN0RCxNQUFNLE1BQU0sR0FBRyxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7ZUFDN0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRTdDLE1BQU0sSUFBQSxxQkFBYSxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUU7WUFDaEMsTUFBTSxFQUFFLEVBQUU7WUFDVixVQUFVLEVBQUUsR0FBRyxJQUFJLFFBQVEsSUFBQSxpQkFBUyxFQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDNUQsYUFBYSxFQUFFLE1BQU07WUFDckIsY0FBYyxFQUFFLElBQUk7U0FDdkIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBdkRELCtCQXVEQyJ9