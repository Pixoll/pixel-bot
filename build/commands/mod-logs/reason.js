"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const lodash_1 = require("lodash");
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
    async runAutocomplete(interaction) {
        const { guild, options } = interaction;
        const query = options.getFocused().toLowerCase();
        const documents = await guild?.database.moderations.fetchMany();
        const choices = documents
            ?.map(doc => ({
            name: `[${(0, lodash_1.capitalize)(doc.type)}] ${doc._id} (${doc.userTag})`,
            value: doc._id,
        }))
            .filter(doc => doc.name.toLowerCase().includes(query))
            .slice(0, 25) ?? [];
        await interaction.respond(choices);
    }
}
exports.default = ReasonCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhc29uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21vZC1sb2dzL3JlYXNvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUFtRDtBQUVuRCxtQ0FBb0M7QUFDcEMscURBTXlCO0FBQ3pCLHVDQUFtRTtBQUVuRSxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFVBQVU7UUFDZixLQUFLLEVBQUUsWUFBWTtRQUNuQixNQUFNLEVBQUUsZ0VBQWdFO1FBQ3hFLElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEVBQUU7S0FDVixFQUFFO1FBQ0MsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsNkNBQTZDO1FBQ3JELElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEdBQUc7S0FDWCxDQUFVLENBQUM7QUFLWixNQUFxQixhQUFjLFNBQVEseUJBQXNCO0lBQzdELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxVQUFVO1lBQ2pCLFdBQVcsRUFBRSx3Q0FBd0M7WUFDckQsbUJBQW1CLEVBQUUsSUFBQSx5QkFBVyxFQUFBO2tCQUMxQixJQUFBLHFCQUFPLEVBQUE7OztpQkFHUjs7YUFFSjtZQUNELE1BQU0sRUFBRSxrQ0FBa0M7WUFDMUMsUUFBUSxFQUFFLENBQUMsc0NBQXNDLENBQUM7WUFDbEQsZUFBZSxFQUFFLENBQUMsZUFBZSxDQUFDO1lBQ2xDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkIsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQWM7UUFDNUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMxQixNQUFN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