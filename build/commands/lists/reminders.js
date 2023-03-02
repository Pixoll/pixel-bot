"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'What sub-command do you want to use?',
        type: 'string',
        oneOf: ['view', 'clear'],
        default: 'view',
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
        const lcSubCommand = subCommand.toLowerCase();
        const { author } = context;
        const data = await this.db.fetchMany({ user: author.id });
        if (data.size === 0) {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'You have no active reminders. Use the `reminder` command to add reminders.',
            }));
            return;
        }
        switch (lcSubCommand) {
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
            reminder: `${r.reminder}\n[Jump to message](${r.msgURL})`,
        }));
        await (0, functions_1.generateEmbed)(context, list, {
            authorName: `You have ${(0, functions_1.pluralize)('reminder', reminders.size)}`,
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
        const confirmed = await (0, functions_1.confirmButtons)(context, {
            action: 'delete all of your reminders',
        });
        if (!confirmed)
            return;
        for (const doc of reminders.toJSON()) {
            await this.db.delete(doc);
        }
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: 'Your reminders have been deleted.',
        }));
    }
}
exports.default = RemindersCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtaW5kZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2xpc3RzL3JlbWluZGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQywyQ0FBc0U7QUFDdEUscURBT3lCO0FBQ3pCLHFEQUF1RztBQUV2RyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFlBQVk7UUFDakIsS0FBSyxFQUFFLGFBQWE7UUFDcEIsTUFBTSxFQUFFLHNDQUFzQztRQUM5QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUM7UUFDeEIsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBVSxDQUFDO0FBS1osTUFBcUIsZ0JBQWlCLFNBQVEseUJBQXlCO0lBQ2hELEVBQUUsQ0FBa0M7SUFFdkQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxXQUFXO1lBQ2pCLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLDRGQUE0RjtZQUN6RyxNQUFNLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7YUFHbEI7WUFDRCxJQUFJO1NBQ1AsRUFBRTtZQUNDLE9BQU8sRUFBRSxDQUFDO29CQUNOLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVO29CQUM3QyxJQUFJLEVBQUUsTUFBTTtvQkFDWixXQUFXLEVBQUUseUJBQXlCO2lCQUN6QyxFQUFFO29CQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVO29CQUM3QyxJQUFJLEVBQUUsT0FBTztvQkFDYixXQUFXLEVBQUUsK0JBQStCO2lCQUMvQyxDQUFDO1NBQ0wsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7SUFDN0MsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMs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