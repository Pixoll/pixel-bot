"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
const args = [{
        key: 'status',
        prompt: 'What is the status you want to set? Respond with `off` to remove it (if existent).',
        type: 'string',
        max: 512,
    }];
class AfkCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'afk',
            group: 'misc',
            description: 'Set an AFK status to display when you are mentioned.',
            details: 'Set `status` as `off` to remove your AFK status.',
            format: (0, common_tags_1.stripIndent) `
                afk [status] - Set your status.
                afk off - Remove your status.
            `,
            examples: [
                'afk Coding',
                'afk off',
            ],
            guildOnly: true,
            args,
            autogenerateSlashCommand: true,
        });
    }
    /**
     * Runs the command
     */
    async run(context, { status }) {
        const { author, guildId, guild } = context;
        const db = guild.database.afk;
        const afkStatus = await db.fetch({ guild: guildId, user: author.id });
        if (afkStatus) {
            if (status.toLowerCase() === 'off') {
                await db.delete(afkStatus);
                await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                    color: 'Green',
                    description: `Welcome back ${author.toString()}, I removed your AFK status`,
                }));
                return;
            }
            await db.update(afkStatus, { status });
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Green',
                emoji: 'check',
                fieldName: 'I updated your AFK status to:',
                fieldValue: status,
            }));
            return;
        }
        if (status.toLowerCase() === 'off') {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'You can\'t set your status as `off`',
            }));
            return;
        }
        await db.add({
            guild: guildId,
            user: author.id,
            status,
        });
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: 'I set your AFK status as:',
            fieldValue: status,
        }));
    }
}
exports.default = AfkCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWZrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvYWZrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLHFEQUE2RjtBQUM3RixxREFBNkQ7QUFFN0QsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxRQUFRO1FBQ2IsTUFBTSxFQUFFLG9GQUFvRjtRQUM1RixJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxHQUFHO0tBQ1gsQ0FBVSxDQUFDO0FBS1osTUFBcUIsVUFBVyxTQUFRLHlCQUFzQjtJQUMxRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLEtBQUs7WUFDWCxLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSxzREFBc0Q7WUFDbkUsT0FBTyxFQUFFLGtEQUFrRDtZQUMzRCxNQUFNLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7YUFHbEI7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sWUFBWTtnQkFDWixTQUFTO2FBQ1o7WUFDRCxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7WUFDSix3QkFBd0IsRUFBRSxJQUFJO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7T0FFRztJQUNJLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkIsRUFBRSxFQUFFLE1BQU0sRUFBYztRQUNsRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDM0MsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7UUFFOUIsTUFBTSxTQUFTLEdBQUcsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFdEUsSUFBSSxTQUFTLEVBQUU7WUFDWCxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsS0FBSyxLQUFLLEVBQUU7Z0JBQ2hDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDM0IsTUFBTSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsc0JBQVUsRUFBQztvQkFDL0IsS0FBSyxFQUFFLE9BQU87b0JBQ2QsV0FBVyxFQUFFLGdCQUFnQixNQUFNLENBQUMsUUFBUSxFQUFFLDZCQUE2QjtpQkFDOUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osT0FBTzthQUNWO1lBRUQsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDdkMsTUFBTSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsc0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLE9BQU87Z0JBQ2QsS0FBSyxFQUFFLE9BQU87Z0JBQ2QsU0FBUyxFQUFFLCtCQUErQjtnQkFDMUMsVUFBVSxFQUFFLE1BQU07YUFDckIsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1NBQ1Y7UUFFRCxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsS0FBSyxLQUFLLEVBQUU7WUFDaEMsTUFBTSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsc0JBQVUsRUFBQztnQkFDL0IsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLE9BQU87Z0JBQ2QsV0FBVyxFQUFFLHFDQUFxQzthQUNyRCxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNULEtBQUssRUFBRSxPQUFPO1lBQ2QsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQ2YsTUFBTTtTQUNULENBQUMsQ0FBQztRQUVILE1BQU0sSUFBQSxvQkFBUSxFQUFDLE9BQU8sRUFBRSxJQUFBLHNCQUFVLEVBQUM7WUFDL0IsS0FBSyxFQUFFLE9BQU87WUFDZCxLQUFLLEVBQUUsT0FBTztZQUNkLFNBQVMsRUFBRSwyQkFBMkI7WUFDdEMsVUFBVSxFQUFFLE1BQU07U0FDckIsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0NBQ0o7QUF4RUQsNkJBd0VDIn0=