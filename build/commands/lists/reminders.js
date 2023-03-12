"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'What sub-command do you want to use?',
        type: 'string',
        oneOf: ['view', 'clear'],
        default: 'view',
        parse(value) {
            return value.toLowerCase();
        },
    }];
class RemindersCommand extends pixoll_commando_1.Command {
    db;
    constructor(client) {
        super(client, {
            name: 'reminders',
            group: 'lists',
            description: 'Displays a list of all your active reminders. Use the `reminder` command to add reminders.',
            format: (0, common_tags_1.stripIndent) `
                reminders <view> - Display your reminders.
                reminders clear - Delete all of your reminders.
            `,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'view',
                    description: 'Display your reminders.',
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'clear',
                    description: 'Delete all of your reminders.',
                }],
        });
        this.db = this.client.database.reminders;
    }
    async run(context, { subCommand }) {
        const { author } = context;
        const data = await this.db.fetchMany({ user: author.id });
        if (data.size === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'You have no active reminders. Use the `reminder` command to add reminders.',
            }));
            return;
        }
        switch (subCommand) {
            case 'view':
                return await this.runView(context, data);
            case 'clear':
                return await this.runClear(context, data);
        }
    }
    /**
     * The `view` sub-command
     */
    async runView(context, reminders) {
        const list = reminders.sort((a, b) => a.remindAt - b.remindAt).map(r => ({
            remindAt: r.remindAt,
            reminder: r.reminder + '\n' + (0, utils_1.hyperlink)('Jump to message', r.msgURL),
        }));
        await (0, utils_1.generateEmbed)(context, list, {
            authorName: `You have ${(0, utils_1.pluralize)('reminder', reminders.size)}`,
            authorIconURL: context.author.displayAvatarURL({ forceStatic: false }),
            title: 'Reminder set for',
            keyTitle: { suffix: 'remindAt' },
            keys: ['reminder'],
            numbered: true,
            toUser: true,
            dmMsg: 'Check your DMs for the list of your reminders.',
        });
    }
    /**
     * The `clear` sub-command
     */
    async runClear(context, reminders) {
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: 'delete all of your reminders',
        });
        if (!confirmed)
            return;
        for (const doc of reminders.toJSON()) {
            await this.db.delete(doc);
        }
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: 'Your reminders have been deleted.',
        }));
    }
}
exports.default = RemindersCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtaW5kZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2xpc3RzL3JlbWluZGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FBc0U7QUFDdEUscURBUXlCO0FBQ3pCLHVDQUF3RztBQUV4RyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFlBQVk7UUFDakIsS0FBSyxFQUFFLGFBQWE7UUFDcEIsTUFBTSxFQUFFLHNDQUFzQztRQUM5QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUM7UUFDeEIsT0FBTyxFQUFFLE1BQU07UUFDZixLQUFLLENBQUMsS0FBYTtZQUNmLE9BQU8sS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9CLENBQUM7S0FDSixDQUFVLENBQUM7QUFLWixNQUFxQixnQkFBaUIsU0FBUSx5QkFBeUI7SUFDaEQsRUFBRSxDQUFrQztJQUV2RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFdBQVc7WUFDakIsS0FBSyxFQUFFLE9BQU87WUFDZCxXQUFXLEVBQUUsNEZBQTRGO1lBQ3pHLE1BQU0sRUFBRSxJQUFBLHlCQUFXLEVBQUE7OzthQUdsQjtZQUNELElBQUk7U0FDUCxFQUFFO1lBQ0MsT0FBTyxFQUFFLENBQUM7b0JBQ04sSUFBSSxFQUFFLHlDQUE0QixDQUFDLFVBQVU7b0JBQzdDLElBQUksRUFBRSxNQUFNO29CQUNaLFdBQVcsRUFBRSx5QkFBeUI7aUJBQ3pDLEVBQUU7b0JBQ0MsSUFBSSxFQUFFLHlDQUE0QixDQUFDLFVBQVU7b0JBQzdDLElBQUksRUFBRSxPQUFPO29CQUNiLFdBQVcsRUFBRSwrQkFBK0I7aUJBQy9DLENBQUM7U0FDTCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxN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