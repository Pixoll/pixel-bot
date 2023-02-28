"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
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
            details: '`member` can be either a member\'s name, mention or ID.',
            format: 'roles <member>',
            examples: ['roles Pixoll'],
            guildOnly: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.User,
                    name: 'member',
                    description: 'The member to get the roles from.',
                }],
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
        if (!rolesCache) {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'I couldn\'t find any roles.',
            }));
            return;
        }
        const roles = rolesCache.sort((a, b) => b.position - a.position).map(r => `${r.toString()} ${r.name}`) ?? null;
        if (!roles) {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'This member has no roles.',
            }));
            return;
        }
        const name = guildMember?.user.username ?? guild.name;
        const avatar = guildMember?.displayAvatarURL({ forceStatic: false })
            || guild.iconURL({ forceStatic: false });
        await (0, functions_1.generateEmbed)(context, roles, {
            number: 20,
            authorName: `${name} has ${(0, functions_1.pluralize)('role', roles.length)}`,
            authorIconURL: avatar,
            useDescription: true,
        });
    }
}
exports.default = RolesCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbGlzdHMvcm9sZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBNEU7QUFDNUUscURBQTZGO0FBQzdGLHFEQUF1RjtBQUV2RixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsZ0RBQWdEO1FBQ3hELElBQUksRUFBRSxRQUFRO1FBQ2QsUUFBUSxFQUFFLEtBQUs7S0FDbEIsQ0FBVSxDQUFDO0FBS1osTUFBcUIsWUFBYSxTQUFRLHlCQUFzQjtJQUM1RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSw0RUFBNEU7WUFDekYsT0FBTyxFQUFFLHlEQUF5RDtZQUNsRSxNQUFNLEVBQUUsZ0JBQWdCO1lBQ3hCLFFBQVEsRUFBRSxDQUFDLGNBQWMsQ0FBQztZQUMxQixTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7U0FDUCxFQUFFO1lBQ0MsT0FBTyxFQUFFLENBQUM7b0JBQ04sSUFBSSxFQUFFLHlDQUE0QixDQUFDLElBQUk7b0JBQ3ZDLElBQUksRUFBRSxRQUFRO29CQUNkLFdBQVcsRUFBRSxtQ0FBbUM7aUJBQ25ELENBQUM7U0FDTCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsTUFBTSxFQUFjO1FBQ2xFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRW5DLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDM0YsTUFBTSxXQUFXLEdBQUcsV0FBVyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsQ0FBQztRQUNqRixNQUFNLFVBQVUsR0FBRyxDQUFDLFdBQVc7WUFDM0IsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUE2QjtZQUN6RSxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRVgsTUFBTSxVQUFVLEdBQUcsV0FBVyxJQUFJLFVBQVUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQ2xGLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDYixNQUFNLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxzQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsTUFBTTtnQkFDYixXQUFXLEVBQUUsNkJBQTZCO2FBQzdDLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUMvRyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1IsTUFBTSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsc0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsV0FBVyxFQUFFLDJCQUEyQjthQUMzQyxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sSUFBSSxHQUFHLFdBQVcsRUFBRSxJQUFJLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDdEQsTUFBTSxNQUFNLEdBQUcsV0FBVyxFQUFFLGdCQUFnQixDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO2VBQzdELEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUU3QyxNQUFNLElBQUEseUJBQWEsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFFO1lBQ2hDLE1BQU0sRUFBRSxFQUFFO1lBQ1YsVUFBVSxFQUFFLEdBQUcsSUFBSSxRQUFRLElBQUEscUJBQVMsRUFBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzVELGFBQWEsRUFBRSxNQUFNO1lBQ3JCLGNBQWMsRUFBRSxJQUFJO1NBQ3ZCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQTVERCwrQkE0REMifQ==