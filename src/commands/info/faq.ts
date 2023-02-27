import { ApplicationCommandOptionType, Collection } from 'discord.js';
import { stripIndent } from 'common-tags';
import {
    Command,
    CommandContext,
    CommandoClient,
    DatabaseManager,
    FaqSchema,
    ParseRawArguments,
    CommandoMessage,
    Argument,
} from 'pixoll-commando';
import {
    generateEmbed,
    basicEmbed,
    basicCollector,
    getArgument,
    confirmButtons,
    replyAll,
} from '../../utils';

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: ['view', 'add', 'remove', 'clear'],
    default: 'view',
}, {
    key: 'item',
    prompt: 'What item do you want to remove from the FAQ list?',
    type: 'integer',
    min: 1,
    required: false,
}] as const;

type Args = typeof args;
// ParseRawArguments<Args> is not "any", not sure why this happens
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type ParsedArgs = ParseRawArguments<Args> & {
    item: string;
    question?: string;
    answer?: string;
};

export default class FaqCommand extends Command<boolean, Args> {
    protected db: DatabaseManager<FaqSchema>;

    public constructor(client: CommandoClient) {
        super(client, {
            name: 'faq',
            group: 'info',
            description: 'Displays the frequently asked questions (FAQ) related to the bot\'s functionality and support.',
            format: stripIndent`
                faq <view> - Display the FAQ list.
                faq add - Add a new entry to the FAQ list (bot's owner only).
                faq remove [item] - Remove entries from the FAQ list (bot's owner only).
                faq clear - Remove every entry in the FAQ list (bot's owner only).
            `,
            guarded: true,
            args: args as unknown as Args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Subcommand,
                name: 'view',
                description: 'Display the FAQ list.',
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'add',
                description: 'Add a new entry to the FAQ list (bot\'s owner only).',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'question',
                    description: 'The question to add to the FAQ list.',
                    required: true,
                }, {
                    type: ApplicationCommandOptionType.String,
                    name: 'answer',
                    description: 'The question\'s answer.',
                    required: true,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'remove',
                description: 'Remove entries from the FAQ list (bot\'s owner only).',
                options: [{
                    type: ApplicationCommandOptionType.Integer,
                    name: 'item',
                    description: 'The item to remove from the FAQ list.',
                    required: true,
                    minValue: 1,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'clear',
                description: 'Remove every entry in the FAQ list (bot\'s owner only).',
            }],
        });

        this.db = this.client.database.faq;
    }

    public async run(context: CommandContext, { item, subCommand, question, answer }: ParsedArgs): Promise<void> {
        const parsedSubCommand = subCommand.toLowerCase() as Lowercase<ParsedArgs['subCommand']>;
        const faqData = await this.db.fetchMany();

        switch (parsedSubCommand) {
            case 'view':
                await this.view(context, faqData);
                return;
            case 'add':
                await this.add(context, question, answer);
                return;
            case 'remove':
                await this.remove(context, item, faqData);
                return;
            case 'clear':
                await this.clear(context, faqData);
                return;
        }
    }

    /**
     * The `view` sub-command
     */
    public async view(context: CommandContext, faqData: Collection<string, FaqSchema>): Promise<void> {
        if (faqData.size === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'The FAQ list is empty.',
            }));
            return;
        }

        await generateEmbed(context, faqData.toJSON(), {
            number: 5,
            authorName: 'Frequently asked questions',
            authorIconURL: context.client.user.displayAvatarURL({ forceStatic: false }),
            keys: ['answer'],
            keyTitle: { suffix: 'question' },
            numbered: true,
        });
    }

    /**
     * The `add` sub-command
     */
    public async add(context: CommandContext, question?: string, answer?: string): Promise<void> {
        if (!this.client.isOwner(context.author)) {
            await this.onBlock(context, 'ownerOnly');
            return;
        }

        if (!question) {
            const questionMsg = await basicCollector(context, {
                fieldName: 'What question do you want to answer?',
            }, { time: 2 * 60_000 });
            if (!questionMsg) return;
            question = questionMsg.content;
        }

        if (!answer) {
            const answerMsg = await basicCollector(context, {
                fieldName: 'Now, what would be it\'s answer?',
            }, { time: 2 * 60_000 });
            if (!answerMsg) return;
            answer = answerMsg.content;
        }

        await this.db.add({ question, answer });

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: 'The new entry has been added to the FAQ list.',
        }));
    }

    /**
     * The `remove` sub-command
     */
    public async remove(context: CommandContext, item: number, faqData: Collection<string, FaqSchema>): Promise<void> {
        if (!this.client.isOwner(context.author)) {
            await this.onBlock(context, 'ownerOnly');
            return;
        }

        if (context instanceof CommandoMessage && !item) {
            const result = await getArgument<'integer'>(context, this.argsCollector?.args[0] as Argument<'integer'>);
            if (!result || result.cancelled) return;
            item = result.value;
        }

        if (faqData.size === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'The FAQ list is empty.',
            }));
            return;
        }

        const doc = faqData.first(item).pop();
        if (!doc) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That item is invalid inside the FAQ list.',
            }));
            return;
        }

        await this.db.delete(doc);

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: `Removed entry ${item} from the FAQ list.`,
        }));
    }

    /**
     * The `clear` sub-command
     */
    public async clear(context: CommandContext, faqData: Collection<string, FaqSchema>): Promise<void> {
        if (!this.client.isOwner(context.author)) {
            await this.onBlock(context, 'ownerOnly');
            return;
        }

        if (faqData.size === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'The FAQ list is empty.',
            }));
            return;
        }

        const confirmed = await confirmButtons(context, {
            action: 'clear the FAQ list',
        });
        if (!confirmed) return;

        for (const doc of faqData.toJSON()) {
            await this.db.delete(doc);
        }

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: 'The FAQ list has been cleared.',
        }));
    }
}
