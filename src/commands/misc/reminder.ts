import { stripIndent } from 'common-tags';
import {
    Command,
    CommandContext,
    CommandoClient,
    ParseRawArguments,
    ReminderSchema,
    DatabaseManager,
    CommandoMessage,
    ReadonlyArgumentInfo,
} from 'pixoll-commando';
import { basicEmbed, customEmoji, timestamp, reply, getContextMessage } from '../../utils';

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
}] as const satisfies readonly ReadonlyArgumentInfo[];

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class ReminderCommand extends Command<boolean, RawArgs> {
    protected readonly db: DatabaseManager<ReminderSchema>;

    public constructor(client: CommandoClient) {
        super(client, {
            name: 'reminder',
            aliases: ['remindme', 'remind'],
            group: 'misc',
            description: 'Set a reminder, and forget.',
            detailedDescription: stripIndent`
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

    public async run(context: CommandContext, { time, reminder }: ParsedArgs): Promise<void> {
        const message = await getContextMessage<CommandoMessage>(context);
        if (context.isInteraction()) {
            const arg = this.argsCollector?.args[0];
            const timeResult = await arg?.parse(time.toString(), message).catch(() => null);
            if (!timeResult) {
                await reply(context, basicEmbed({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The time you specified is invalid.',
                }));
                return;
            }
            time = timeResult as Date | number;
            reminder ??= '`Not specified`';
        }

        if (typeof time === 'number') time += Date.now();
        if (time instanceof Date) time = time.getTime();

        const { id, channelId, url } = message;
        const stamp = timestamp(time, 'R', true);

        await this.db.add({
            user: context.author.id,
            reminder,
            remindAt: time,
            message: id,
            msgURL: url,
            channel: channelId,
        });

        await message.react(customEmoji('cross'));

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `I'll remind you ${stamp} for:`,
            fieldValue: reminder,
            footer: 'React with ❌ to cancel the reminder.',
        }));
    }
}
