import { stripIndent } from 'common-tags';
import { ApplicationCommandOptionType, Collection } from 'discord.js';
import {
    Command,
    CommandContext,
    CommandoClient,
    DatabaseManager,
    ParseRawArguments,
    ReminderSchema,
} from 'pixoll-commando';
import { generateEmbed, basicEmbed, pluralize, confirmButtons, replyAll, hyperlink } from '../../utils';

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: ['view', 'clear'],
    default: 'view',
    parse(value: string): string {
        return value.toLowerCase();
    },
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class RemindersCommand extends Command<boolean, RawArgs> {
    protected readonly db: DatabaseManager<ReminderSchema>;

    public constructor(client: CommandoClient) {
        super(client, {
            name: 'reminders',
            group: 'lists',
            description: 'Displays a list of all your active reminders. Use the `reminder` command to add reminders.',
            format: stripIndent`
                reminders <view> - Display your reminders.
                reminders clear - Delete all of your reminders.
            `,
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Subcommand,
                name: 'view',
                description: 'Display your reminders.',
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'clear',
                description: 'Delete all of your reminders.',
            }],
        });

        this.db = this.client.database.reminders;
    }

    public async run(context: CommandContext, { subCommand }: ParsedArgs): Promise<void> {
        const { author } = context;

        const data = await this.db.fetchMany({ user: author.id });
        if (data.size === 0) {
            await replyAll(context, basicEmbed({
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
    protected async runView(context: CommandContext, reminders: Collection<string, ReminderSchema>): Promise<void> {
        const list = reminders.sort((a, b) => a.remindAt - b.remindAt).map(r => ({
            remindAt: r.remindAt,
            reminder: r.reminder + '\n' + hyperlink('Jump to message', r.msgURL),
        }));

        await generateEmbed(context, list, {
            authorName: `You have ${pluralize('reminder', reminders.size)}`,
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
    protected async runClear(context: CommandContext, reminders: Collection<string, ReminderSchema>): Promise<void> {
        const confirmed = await confirmButtons(context, {
            action: 'delete all of your reminders',
        });
        if (!confirmed) return;

        for (const doc of reminders.toJSON()) {
            await this.db.delete(doc);
        }

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: 'Your reminders have been deleted.',
        }));
    }
}
