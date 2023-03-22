"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
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
            detailedDescription: (0, common_tags_1.stripIndent) `
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
                await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        const stamp = (0, utils_1.timestamp)(time, 'R', true);
        await this.db.add({
            user: context.author.id,
            reminder,
            remindAt: time,
            message: id,
            msgURL: url,
            channel: channelId,
        });
        await message.react((0, utils_1.customEmoji)('cross'));
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `I'll remind you ${stamp} for:`,
            fieldValue: reminder,
            footer: 'React with ❌ to cancel the reminder.',
        }));
    }
}
exports.default = ReminderCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtaW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy9yZW1pbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQyxxREFReUI7QUFDekIsdUNBQXdFO0FBRXhFLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxxQ0FBcUM7UUFDN0MsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQztLQUM3QixFQUFFO1FBQ0MsR0FBRyxFQUFFLFVBQVU7UUFDZixNQUFNLEVBQUUsd0NBQXdDO1FBQ2hELElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEdBQUc7UUFDUixPQUFPLEVBQUUsaUJBQWlCO0tBQzdCLENBQVUsQ0FBQztBQUtaLE1BQXFCLGVBQWdCLFNBQVEseUJBQXlCO0lBQy9DLEVBQUUsQ0FBa0M7SUFFdkQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxVQUFVO1lBQ2hCLE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUM7WUFDL0IsS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsNkJBQTZCO1lBQzFDLG1CQUFtQixFQUFFLElBQUEseUJBQVcsRUFBQTs7O2FBRy9CO1lBQ0QsTUFBTSxFQUFFLDRCQUE0QjtZQUNwQyxRQUFRLEVBQUU7Z0JBQ04sc0NBQXNDO2dCQUN0Qyw0QkFBNEI7Z0JBQzVCLGFBQWE7YUFDaEI7WUFDRCxPQUFPLEVBQUUsSUFBSTtZQUNiLGlCQUFpQixFQUFFLENBQUMsY0FBYyxDQUFDO1lBQ25DLElBQUksRUFBRSxDQUFDO29CQUNILEdBQUcsRUFBRSxNQUFNO29CQUNYLE1BQU0sRUFBRSxxQ0FBcUM7b0JBQzdDLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUM7aUJBQzdCLEVBQUU7b0JB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