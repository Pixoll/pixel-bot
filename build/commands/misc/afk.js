"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
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
            detailedDescription: 'Set `status` as `off` to remove your AFK status.',
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
                await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                    color: 'Green',
                    description: `Welcome back ${author.toString()}, I removed your AFK status`,
                }));
                return;
            }
            await db.update(afkStatus, { status });
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Green',
                emoji: 'check',
                fieldName: 'I updated your AFK status to:',
                fieldValue: status,
            }));
            return;
        }
        if (status.toLowerCase() === 'off') {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: 'I set your AFK status as:',
            fieldValue: status,
        }));
    }
}
exports.default = AfkCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWZrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL21pc2MvYWZrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLHFEQUE2RjtBQUM3Rix1Q0FBbUQ7QUFFbkQsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxRQUFRO1FBQ2IsTUFBTSxFQUFFLG9GQUFvRjtRQUM1RixJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxHQUFHO0tBQ1gsQ0FBVSxDQUFDO0FBS1osTUFBcUIsVUFBVyxTQUFRLHlCQUFzQjtJQUMxRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLEtBQUs7WUFDWCxLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSxzREFBc0Q7WUFDbkUsbUJBQW1CLEVBQUUsa0RBQWtEO1lBQ3ZFLE1BQU0sRUFBRSxJQUFBLHlCQUFXLEVBQUE7OzthQUdsQjtZQUNELFFBQVEsRUFBRTtnQkFDTixZQUFZO2dCQUNaLFNBQVM7YUFDWjtZQUNELFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtZQUNKLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOztPQUVHO0lBQ0ksS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsTUFBTSxFQUFjO1FBQ2xFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMzQyxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztRQUU5QixNQUFNLFNBQVMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV0RSxJQUFJLFNBQVMsRUFBRTtZQUNYLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxLQUFLLEtBQUssRUFBRTtnQkFDaEMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMzQixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO29CQUMvQixLQUFLLEVBQUUsT0FBTztvQkFDZCxXQUFXLEVBQUUsZ0JBQWdCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsNkJBQTZCO2lCQUM5RSxDQUFDLENBQUMsQ0FBQztnQkFDSixPQUFPO2FBQ1Y7WUFFRCxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUN2QyxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsT0FBTztnQkFDZCxLQUFLLEVBQUUsT0FBTztnQkFDZCxTQUFTLEVBQUUsK0JBQStCO2dCQUMxQyxVQUFVLEVBQUUsTUFBTTthQUNyQixDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDVjtRQUVELElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxLQUFLLEtBQUssRUFBRTtZQUNoQyxNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxXQUFXLEVBQUUscUNBQXFDO2FBQ3JELENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ1QsS0FBSyxFQUFFLE9BQU87WUFDZCxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7WUFDZixNQUFNO1NBQ1QsQ0FBQyxDQUFDO1FBRUgsTUFBTSxJQUFBLGdCQUFRLEVBQUMsT0FBTyxFQUFFLElBQUEsa0JBQVUsRUFBQztZQUMvQixLQUFLLEVBQUUsT0FBTztZQUNkLEtBQUssRUFBRSxPQUFPO1lBQ2QsU0FBUyxFQUFFLDJCQUEyQjtZQUN0QyxVQUFVLEVBQUUsTUFBTTtTQUNyQixDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7Q0FDSjtBQXhFRCw2QkF3RUMifQ==