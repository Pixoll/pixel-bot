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
            details: (0, common_tags_1.stripIndent) `
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmljay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2Qvbmljay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQyxxREFBNkY7QUFDN0YsdUNBQW1EO0FBRW5ELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxrREFBa0Q7UUFDMUQsSUFBSSxFQUFFLE1BQU07S0FDZixFQUFFO1FBQ0MsR0FBRyxFQUFFLFVBQVU7UUFDZixNQUFNLEVBQUUsa0ZBQWtGO1FBQzFGLElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEVBQUU7S0FDVixDQUFVLENBQUM7QUFLWixNQUFxQixXQUFZLFNBQVEseUJBQXNCO0lBQzNELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUM7WUFDaEMsS0FBSyxFQUFFLEtBQUs7WUFDWixXQUFXLEVBQUUsNkNBQTZDO1lBQzFELE9BQU8sRUFBRSxJQUFBLHlCQUFXLEVBQUE7Ozs7YUFJbkI7WUFDRCxNQUFNLEVBQUUsb0JBQW9CO1lBQzVCLFFBQVEsRUFBRTtnQkFDTix3QkFBd0I7Z0JBQ3hCLG9CQUFvQjthQUN2QjtZQUNELGlCQUFpQixFQUFFLENBQUMsaUJBQWlCLENBQUM7WUFDdEMsZUFBZSxFQUFFLENBQUMsaUJBQWlCLENBQUM7WUFDcEMsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBYztRQUMxRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUNsQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztRQUMvQixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsV0FBVyxFQUFFLHNDQUFzQzthQUN0RCxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFO1lBQ3BCLE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQy9CLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxPQUFPO2dCQUNkLFNBQVMsRUFBRSxvQkFBb0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxhQUFhO2dCQUMzRCxVQUFVLEVBQUUsc0RBQXNEO2FBQ3JFLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxLQUFLLFFBQVEsQ0FBQztRQUVyRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQy9DLE1BQU0sVUFBVSxHQUFHLE1BQU0sTUFBTSxDQUFDLFdBQVcsQ0FDdkMsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsMEJBQTBCLElBQUksQ0FBQyxJQUFJLFlBQVksQ0FDeEUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDYixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxXQUFXLEVBQUUsb0ZBQW9GO2FBQ3BHLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztZQUMvQixLQUFLLEVBQUUsT0FBTztZQUNkLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLFFBQVE7Z0JBQ2pCLENBQUMsQ0FBQyxhQUFhLEdBQUcsZ0JBQWdCO2dCQUNsQyxDQUFDLENBQUMsYUFBYSxHQUFHLHNCQUFzQixRQUFRLElBQUk7U0FDM0QsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0NBQ0o7QUF2RUQsOEJBdUVDIn0=