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
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That user is not part of this server',
            }));
            return;
        }
        if (!member.manageable) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'An error occurred when trying to change that member\'s nickname. Please try again.',
            }));
            return;
        }
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: isRemove
                ? `Removed \`${tag}\`'s nickname.`
                : `Changed \`${tag}\`'s nickname to \`${nickname}\``,
        }));
    }
}
exports.default = NickCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmljay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2Qvbmljay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQyxxREFBNkY7QUFDN0YsdUNBQW1EO0FBRW5ELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxrREFBa0Q7UUFDMUQsSUFBSSxFQUFFLE1BQU07S0FDZixFQUFFO1FBQ0MsR0FBRyxFQUFFLFVBQVU7UUFDZixNQUFNLEVBQUUsa0ZBQWtGO1FBQzFGLElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEVBQUU7S0FDVixDQUFVLENBQUM7QUFLWixNQUFxQixXQUFZLFNBQVEseUJBQXNCO0lBQzNELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUM7WUFDaEMsS0FBSyxFQUFFLEtBQUs7WUFDWixXQUFXLEVBQUUsNkNBQTZDO1lBQzFELG1CQUFtQixFQUFFLElBQUEseUJBQVcsRUFBQTs7OzthQUkvQjtZQUNELE1BQU0sRUFBRSxvQkFBb0I7WUFDNUIsUUFBUSxFQUFFO2dCQUNOLHdCQUF3QjtnQkFDeEIsb0JBQW9CO2FBQ3ZCO1lBQ0QsaUJBQWlCLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztZQUN0QyxlQUFlLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztZQUNwQyxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFjO1FBQzFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQ2xDLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQy9CLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxXQUFXLEVBQUUsc0NBQXNDO2FBQ3RELENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7WUFDcEIsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsU0FBUyxFQUFFLG9CQUFvQixJQUFJLENBQUMsUUFBUSxFQUFFLGFBQWE7Z0JBQzNELFVBQVUsRUFBRSxzREFBc0Q7YUFDckUsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLEtBQUssUUFBUSxDQUFDO1FBRXJELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFDL0MsTUFBTSxVQUFVLEdBQUcsTUFBTSxNQUFNLENBQUMsV0FBVyxDQUN2QyxPQUFPLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRywwQkFBMEIsSUFBSSxDQUFDLElBQUksWUFBWSxDQUN4RSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNiLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQy9CLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxPQUFPO2dCQUNkLFdBQVcsRUFBRSxvRkFBb0Y7YUFDcEcsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO1lBQy9CLEtBQUssRUFBRSxPQUFPO1lBQ2QsS0FBSyxFQUFFLE9BQU87WUFDZCxXQUFXLEVBQUUsUUFBUTtnQkFDakIsQ0FBQyxDQUFDLGFBQWEsR0FBRyxnQkFBZ0I7Z0JBQ2xDLENBQUMsQ0FBQyxhQUFhLEdBQUcsc0JBQXNCLFFBQVEsSUFBSTtTQUMzRCxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7Q0FDSjtBQXZFRCw4QkF1RUMifQ==