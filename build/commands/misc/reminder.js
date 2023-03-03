"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
const args = [{
        key: 'time',
        prompt: 'When would you like to be reminded?',
        type: ['duration', 'date'],
    }, {
        key: 'reminder',
        prompt: 'What do you want to be reminded about?',
        type: 'string',
        max: 512,
        default: '`Not specified`',
    }];
class ReminderCommand extends pixoll_commando_1.Command {
    db;
    constructor(client) {
        super(client, {
            name: 'reminder',
            aliases: ['remindme', 'remind'],
            group: 'misc',
            description: 'Set a reminder, and forget.',
            details: (0, common_tags_1.stripIndent) `
                \`duration\` uses the bot's time formatting, for more information use the \`help\` command.
                If \`reminder\` is not specified, it will default to "Not specified".
            `,
            format: 'reminder [time] <reminder>',
            examples: [
                'reminder 02/02/2022 Pixoll\'s b-day!',
                'reminder 1d Do some coding',
                'reminder 2w',
            ],
            guarded: true,
            clientPermissions: ['AddReactions'],
            args: [{
                    key: 'time',
                    prompt: 'When would you like to be reminded?',
                    type: ['duration', 'date'],
                }, {
                    key: 'reminder',
                    prompt: 'What do you want to be reminded about?',
                    type: 'string',
                    max: 512,
                    default: '`Not specified`',
                }],
            autogenerateSlashCommand: true,
        });
        this.db = this.client.database.reminders;
    }
    async run(context, { time, reminder }) {
        const message = context.isMessage() ? context : await context.fetchReply();
        if (context.isInteraction()) {
            const arg = this.argsCollector?.args[0];
            const timeResult = await arg?.parse(time.toString(), message).catch(() => null);
            if (!timeResult) {
                await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The time you specified is invalid.',
                }));
                return;
            }
            time = timeResult;
            reminder ??= '`Not specified`';
        }
        if (typeof time === 'number')
            time += Date.now();
        if (time instanceof Date)
            time = time.getTime();
        const { id, channelId, url } = message;
        const stamp = (0, functions_1.timestamp)(time, 'R', true);
        await this.db.add({
            user: context.author.id,
            reminder,
            remindAt: time,
            message: id,
            msgURL: url,
            channel: channelId,
        });
        await message.react((0, functions_1.customEmoji)('cross'));
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `I'll remind you ${stamp} for:`,
            fieldValue: reminder,
            footer: 'React with ❌ to cancel the reminder.',
        }));
    }
}
exports.default = ReminderCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtaW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy9yZW1pbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQyxxREFReUI7QUFDekIscURBQXFGO0FBRXJGLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxxQ0FBcUM7UUFDN0MsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQztLQUM3QixFQUFFO1FBQ0MsR0FBRyxFQUFFLFVBQVU7UUFDZixNQUFNLEVBQUUsd0NBQXdDO1FBQ2hELElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEdBQUc7UUFDUixPQUFPLEVBQUUsaUJBQWlCO0tBQzdCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGVBQWdCLFNBQVEseUJBQXlCO0lBQy9DLEVBQUUsQ0FBa0M7SUFFdkQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxVQUFVO1lBQ2hCLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUM7WUFDL0IsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsNkJBQTZCO1lBQzFDLE9BQU8sRUFBRSxJQUFBLHlCQUFXLEVBQUE7OzthQUduQjtZQUNELE1BQU0sRUFBRSw0QkFBNEI7WUFDcEMsUUFBUSxFQUFFO2dCQUNOLHNDQUFzQztnQkFDdEMsNEJBQTRCO2dCQUM1QixhQUFhO2FBQ2hCO1lBQ0QsT0FBTyxFQUFFLElBQUk7WUFDYixpQkFBaUIsRUFBRSxDQUFDLGNBQWMsQ0FBQztZQUNuQyxJQUFJLEVBQUUsQ0FBQztvQkFDSCxHQUFHLEVBQUUsTUFBTTtvQkFDWCxNQUFNLEVBQUUscUNBQXFDO29CQUM3QyxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDO2lCQUM3QixFQUFFO29CQUND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