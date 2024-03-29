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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbGlzdHMvcm9sZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxxREFBbUg7QUFDbkgsdUNBQTBFO0FBRTFFLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSxnREFBZ0Q7UUFDeEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsS0FBSztLQUNsQixDQUFvRCxDQUFDO0FBS3RELE1BQXFCLFlBQWEsU0FBUSx5QkFBc0I7SUFDNUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFLE9BQU87WUFDZCxXQUFXLEVBQUUsNEVBQTRFO1lBQ3pGLG1CQUFtQixFQUFFLHlEQUF5RDtZQUM5RSxNQUFNLEVBQUUsZ0JBQWdCO1lBQ3hCLFFBQVEsRUFBRSxDQUFDLGNBQWMsQ0FBQztZQUMxQixTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxNQUFNLEVBQWM7UUFDbEUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFbkMsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMzRixNQUFNLFdBQVcsR0FBRyxXQUFXLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQ2pGLE1BQU0sVUFBVSxHQUFHLENBQUMsV0FBVztZQUMzQixDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQXdDO1lBQ3BGLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFWCxNQUFNLFVBQVUsR0FBRyxXQUFXLElBQUksVUFBVSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssT0FBTyxDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLFVBQVUsSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtZQUN0QyxNQUFNLElBQUEsYUFBSyxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQzVCLEtBQUssRUFBRSxNQUFNO2dCQUNiLEtBQUssRUFBRSxNQUFNO2dCQUNiLFdBQVcsRUFBRSw2QkFBNkI7YUFDN0MsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDO1FBQy9HLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDUixNQUFNLElBQUEsYUFBSyxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQzVCLEtBQUssRUFBRSxNQUFNO2dCQUNiLEtBQUssRUFBRSxNQUFNO2dCQUNiLFdBQVcsRUFBRSwyQkFBMkI7YUFDM0MsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLElBQUksR0FBRyxXQUFXLEVBQUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ3RELE1BQU0sTUFBTSxHQUFHLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztlQUM3RCxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFN0MsTUFBTSxJQUFBLHFCQUFhLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBRTtZQUNoQyxNQUFNLEVBQUUsRUFBRTtZQUNWLFVBQVUsRUFBRSxHQUFHLElBQUksUUFBUSxJQUFBLGlCQUFTLEVBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM1RCxhQUFhLEVBQUUsTUFBTTtZQUNyQixjQUFjLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUF2REQsK0JBdURDIn0=