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
            detailedDescription: (0, common_tags_1.stripIndent) `
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `Updated reason for mod log \`${modLogId}\``,
            fieldValue: `**New reason:** ${reason}`,
        }));
    }
    async runAutocomplete(interaction) {
        const { guild, options } = interaction;
        const query = options.getFocused().toLowerCase();
        const documents = await guild?.database.moderations.fetchMany();
        const choices = documents
            ?.map(doc => ({
            name: `[${pixoll_commando_1.Util.capitalize(doc.type)}] ${doc._id} (${doc.userTag})`,
            value: doc._id,
        }))
            .filter(doc => doc.name.toLowerCase().includes(query))
            .slice(0, 25) ?? [];
        await interaction.respond(choices);
    }
}
exports.default = ReasonCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhc29uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21vZC1sb2dzL3JlYXNvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUFtRDtBQUVuRCxxREFPeUI7QUFDekIsdUNBQWdFO0FBRWhFLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsVUFBVTtRQUNmLEtBQUssRUFBRSxZQUFZO1FBQ25CLE1BQU0sRUFBRSxnRUFBZ0U7UUFDeEUsSUFBSSxFQUFFLFFBQVE7UUFDZCxHQUFHLEVBQUUsRUFBRTtLQUNWLEVBQUU7UUFDQyxHQUFHLEVBQUUsUUFBUTtRQUNiLE1BQU0sRUFBRSw2Q0FBNkM7UUFDckQsSUFBSSxFQUFFLFFBQVE7UUFDZCxHQUFHLEVBQUUsR0FBRztLQUNYLENBQVUsQ0FBQztBQUtaLE1BQXFCLGFBQWMsU0FBUSx5QkFBc0I7SUFDN0QsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLFVBQVU7WUFDakIsV0FBVyxFQUFFLHdDQUF3QztZQUNyRCxtQkFBbUIsRUFBRSxJQUFBLHlCQUFXLEVBQUE7a0JBQzFCLElBQUEscUJBQU8sRUFBQTs7O2lCQUdSOzthQUVKO1lBQ0QsTUFBTSxFQUFFLGtDQUFrQztZQUMxQyxRQUFRLEVBQUUsQ0FBQyxzQ0FBc0MsQ0FBQztZQUNsRCxlQUFlLEVBQUUsQ0FBQyxlQUFlLENBQUM7WUFDbEMsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBYztRQUM1RSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzFCLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUUvQyxNQUFNLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNULE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztnQkFDNUIsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsV0FBVyxFQUFFLGlEQUFpRDthQUNqRSxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUUvQyxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsc0JBQWMsRUFBQyxPQUFPLEVBQUU7WUFDNUMsTUFBTSxFQUFFLHVCQUF1QjtZQUMvQixNQUFNLEVBQUUsUUFBUTtZQUNoQixNQUFNO1NBQ1QsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLElBQUksU0FBUztZQUFFLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRTFELE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztZQUM1QixLQUFLLEVBQUUsT0FBTztZQUNkLEtBQUssRUFBRSxPQUFPO1lBQ2QsU0FBUyxFQUFFLGdDQUFnQyxRQUFRLElBQUk7WUFDdkQsVUFBVSxFQUFFLG1CQUFtQixNQUFNLEVBQUU7U0FDMUMsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBRWUsS0FBSyxDQUFDLGVBQWUsQ0FBQyxXQUE0QztRQUM5RSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLFdBQVcsQ0FBQztRQUN2QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDakQsTUFBTSxTQUFTLEdBQUcsTUFBTSxLQUFLLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoRSxNQUFNLE9BQU8sR0FBRyxTQUFTO1lBQ3JCLEVBQUUsR0FBRyxDQUFxQixHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDOUIsSUFBSSxFQUFFLElBQUksc0JBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLE9BQU8sR0FBRztZQUNsRSxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUc7U0FDakIsQ0FBQyxDQUFDO2FBQ0YsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDckQsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDeEIsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7Q0FDSjtBQXJFRCxnQ0FxRUMifQ==