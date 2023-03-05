"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'modLogId',
        label: 'mod-log ID',
        prompt: 'What is the ID of the mod log you want to change the duration?',
        type: 'string',
        max: 16,
    }, {
        key: 'reason',
        prompt: 'What will be the new reason of the mod log?',
        type: 'string',
        max: 512,
    }];
class ReasonCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'reason',
            group: 'mod-logs',
            description: 'Change the reason of a moderation log.',
            details: (0, common_tags_1.stripIndent) `
                ${(0, common_tags_1.oneLine) `
                    \`mod-log ID\` has to be a valid mod log ID.
                    To see all the mod logs in this server use the \`mod-logs\` command.
                `}
                \`new reason\` will be the new reason of the moderation log.
            `,
            format: 'reason [mod-log ID] [new reason]',
            examples: ['reason 186b2a4d2590270f Being racist'],
            userPermissions: ['Administrator'],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { modLogId, reason }) {
        const { guild } = context;
        const { moderations, active } = guild.database;
        const modLog = await moderations.fetch(modLogId);
        if (!modLog) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That ID is either invalid or it does not exist.',
            }));
            return;
        }
        const activeLog = await active.fetch(modLogId);
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: 'update mod log reason',
            target: modLogId,
            reason,
        });
        if (!confirmed)
            return;
        await moderations.update(modLog, { reason });
        if (activeLog)
            await active.update(activeLog, { reason });
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `Updated reason for mod log \`${modLogId}\``,
            fieldValue: `**New reason:** ${reason}`,
        }));
    }
}
exports.default = ReasonCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhc29uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21vZC1sb2dzL3JlYXNvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUFtRDtBQUNuRCxxREFBNkY7QUFDN0YsdUNBQW1FO0FBRW5FLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsVUFBVTtRQUNmLEtBQUssRUFBRSxZQUFZO1FBQ25CLE1BQU0sRUFBRSxnRUFBZ0U7UUFDeEUsSUFBSSxFQUFFLFFBQVE7UUFDZCxHQUFHLEVBQUUsRUFBRTtLQUNWLEVBQUU7UUFDQyxHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSw2Q0FBNkM7UUFDckQsSUFBSSxFQUFFLFFBQVE7UUFDZCxHQUFHLEVBQUUsR0FBRztLQUNYLENBQVUsQ0FBQztBQUtaLE1BQXFCLGFBQWMsU0FBUSx5QkFBc0I7SUFDN0QsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLFVBQVU7WUFDakIsV0FBVyxFQUFFLHdDQUF3QztZQUNyRCxPQUFPLEVBQUUsSUFBQSx5QkFBVyxFQUFBO2tCQUNkLElBQUEscUJBQU8sRUFBQTs7O2lCQUdSOzthQUVKO1lBQ0QsTUFBTSxFQUFFLGtDQUFrQztZQUMxQyxRQUFRLEVBQUUsQ0FBQyxzQ0FBc0MsQ0FBQztZQUNsRCxlQUFlLEVBQUUsQ0FBQyxlQUFlLENBQUM7WUFDbEMsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBYztRQUM1RSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzFCLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUUvQyxNQUFNLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNULE1BQU0sSUFBQSxnQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLGtCQUFVLEVBQUM7Z0JBQy9CLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxPQUFPO2dCQUNkLFdBQVcsRUFBRSxpREFBaUQ7YUFDakUsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFL0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLHNCQUFjLEVBQUMsT0FBTyxFQUFFO1lBQzVDLE1BQU0sRUFBRSx1QkFBdUI7WUFDL0IsTUFBTSxFQUFFLFFBQVE7WUFDaEIsTUFBTTtTQUNULENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTztRQUV2QixNQUFNLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUM3QyxJQUFJLFNBQVM7WUFBRSxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUUxRCxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO1lBQy9CLEtBQUssRUFBRSxPQUFPO1lBQ2QsS0FBSyxFQUFFLE9BQU87WUFDZCxTQUFTLEVBQUUsZ0NBQWdDLFFBQVEsSUFBSTtZQUN2RCxVQUFVLEVBQUUsbUJBQW1CLE1BQU0sRUFBRTtTQUMxQyxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7Q0FDSjtBQXZERCxnQ0F1REMifQ==