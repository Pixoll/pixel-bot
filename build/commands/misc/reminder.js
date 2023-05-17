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
        const message = await (0, utils_1.getContextMessage)(context);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtaW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy9yZW1pbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQyxxREFTeUI7QUFDekIsdUNBQTJGO0FBRTNGLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLE1BQU0sRUFBRSxxQ0FBcUM7UUFDN0MsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQztLQUM3QixFQUFFO1FBQ0MsR0FBRyxFQUFFLFVBQVU7UUFDZixNQUFNLEVBQUUsd0NBQXdDO1FBQ2hELElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEdBQUc7UUFDUixPQUFPLEVBQUUsaUJBQWlCO0tBQzdCLENBQW9ELENBQUM7QUFLdEQsTUFBcUIsZUFBZ0IsU0FBUSx5QkFBeUI7SUFDL0MsRUFBRSxDQUFrQztJQUV2RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFVBQVU7WUFDaEIsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQztZQUMvQixLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSw2QkFBNkI7WUFDMUMsbUJBQW1CLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7YUFHL0I7WUFDRCxNQUFNLEVBQUUsNEJBQTRCO1lBQ3BDLFFBQVEsRUFBRTtnQkFDTixzQ0FBc0M7Z0JBQ3RDLDRCQUE0QjtnQkFDNUIsYUFBYTthQUNoQjtZQUNELE9BQU8sRUFBRSxJQUFJO1lBQ2IsaUJBQWlCLEVBQUUsQ0FBQyxjQUFjLENBQUM7WUFDbkMsSUFBSSxFQUFFLENBQUM7b0JBQ0gsR0FBRyxFQUFFLE1BQU07b0JBQ1gsTUFBTSxFQUFFLHFDQUFxQztvQkFDN0MsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQztpQkFDN0IsRUFBRTtv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