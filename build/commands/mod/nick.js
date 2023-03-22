"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'user',
        prompt: 'What user do you want to change/remove the nick?',
        type: 'user',
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
            description: 'Change the nickname of a user or remove it.',
            detailedDescription: (0, common_tags_1.stripIndent) `
                \`user\` can be either a user's name, mention or ID.
                \`nick\` will be the user's new nickname.
                Setting \`nick\` as \`remove\` will remove the user's current nickname.
            `,
            format: 'nick [user] [nick]',
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
    async run(context, { user, nickname }) {
        const { author, guild } = context;
        const { tag, username } = user;
        const member = await guild.members.fetch(user).catch(() => null);
        if (!member) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }
        if (!member.manageable) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                fieldName: `Unable to change ${user.toString()}'s nickname`,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmljay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2Qvbmljay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQyxxREFBNkY7QUFDN0YsdUNBQWdEO0FBRWhELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxrREFBa0Q7UUFDMUQsSUFBSSxFQUFFLE1BQU07S0FDZixFQUFFO1FBQ0MsR0FBRyxFQUFFLFVBQVU7UUFDZixNQUFNLEVBQUUsa0ZBQWtGO1FBQzFGLElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEVBQUU7S0FDVixDQUFVLENBQUM7QUFLWixNQUFxQixXQUFZLFNBQVEseUJBQXNCO0lBQzNELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUM7WUFDaEMsS0FBSyxFQUFFLEtBQUs7WUFDWixXQUFXLEVBQUUsNkNBQTZDO1lBQzFELG1CQUFtQixFQUFFLElBQUEseUJBQVcsRUFBQTs7OzthQUkvQjtZQUNELE1BQU0sRUFBRSxvQkFBb0I7WUFDNUIsUUFBUSxFQUFFO2dCQUNOLHdCQUF3QjtnQkFDeEIsb0JBQW9CO2FBQ3ZCO1lBQ0QsaUJBQWlCLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztZQUN0QyxlQUFlLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztZQUNwQyxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFjO1FBQzFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ2xDLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQy9CLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxNQUFNLElBQUEsYUFBSyxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQzVCLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxPQUFPO2dCQUNkLFdBQVcsRUFBRSxzQ0FBc0M7YUFDdEQsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRTtZQUNwQixNQUFNLElBQUEsYUFBSyxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQzVCLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxPQUFPO2dCQUNkLFNBQVMsRUFBRSxvQkFBb0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxhQUFhO2dCQUMzRCxVQUFVLEVBQUUsc0RBQXNEO2FBQ3JFLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxLQUFLLFFBQVEsQ0FBQztRQUVyRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQy9DLE1BQU0sVUFBVSxHQUFHLE1BQU0sTUFBTSxDQUFDLFdBQVcsQ0FDdkMsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsMEJBQTBCLElBQUksQ0FBQyxJQUFJLFlBQVksQ0FDeEUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDYixNQUFNLElBQUEsYUFBSyxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQzVCLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxPQUFPO2dCQUNkLFdBQVcsRUFBRSxvRkFBb0Y7YUFDcEcsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLElBQUEsYUFBSyxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7WUFDNUIsS0FBSyxFQUFFLE9BQU87WUFDZCxLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxRQUFRO2dCQUNqQixDQUFDLENBQUMsYUFBYSxHQUFHLGdCQUFnQjtnQkFDbEMsQ0FBQyxDQUFDLGFBQWEsR0FBRyxzQkFBc0IsUUFBUSxJQUFJO1NBQzNELENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztDQUNKO0FBdkVELDhCQXVFQyJ9