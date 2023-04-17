import { ApplicationCommandOptionType, Collection, ApplicationCommandOptionChoiceData as ChoiceData } from 'discord.js';
import { stripIndent } from 'common-tags';
import {
    Command,
    CommandContext,
    CommandoClient,
    DatabaseManager,
    FaqSchema,
    JSONIfySchema,
    ParseRawArguments,
    CommandoMessage,
    CommandoAutocompleteInteraction,
} from 'pixoll-commando';
import {
    generateEmbed,
    basicEmbed,
    basicCollector,
    confirmButtons,
    reply,
    getSubCommand,
    limitStringLength,
} from '../../utils';

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: ['view', 'add', 'remove', 'clear'],
    default: 'view',
    parse(value: string): string {
        return value.toLowerCase();
    },
}, {
    key: 'item',
    prompt: 'What item do you want to remove from the FAQ list?',
    type: 'integer',
    min: 1,
    required: false,
    isEmpty(_: unknown, message: CommandoMessage): boolean {
        const subCommand = getSubCommand<SubCommand>(message, args[0].default);
        return subCommand !== 'remove';
    },
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs> & {
    question?: string;
    answer?: string;
};
type SubCommand = ParsedArgs['subCommand'];

export default class FaqCommand extends Command<boolean, RawArgs> {
    protected readonly db: DatabaseManager<FaqSchema>;

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
            args,
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
                    autocomplete: true,
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
        const faqData = await this.db.fetchMany();

        switch (subCommand) {
            case 'view':
                return await this.runView(context, faqData);
            case 'add':
                return await this.runAdd(context, question, answer);
            case 'remove':
                return await this.runRemove(context, item as number, faqData);
            case 'clear':
                return await this.runClear(context, faqData);
        }
    }

    /**
     * The `view` sub-command
     */
    protected async runView(context: CommandContext, faqData: Collection<string, JSONIfySchema<FaqSchema>>): Promise<void> {
        if (faqData.size === 0) {
            await reply(context, basicEmbed({
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
    protected async runAdd(context: CommandContext, question?: string, answer?: string): Promise<void> {
        if (!this.client.isOwner(context.author)) {
            await this.onBlock(context, 'ownerOnly');
            return;
        }

        if (!question || question.length > 100) {
            const questionMsg = await basicCollector(context, {
                description: question && question.length < 100
                    ? 'Make sure the question is 100 characters or shorter.'
                    : undefined,
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

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: 'The new entry has been added to the FAQ list.',
        }));
    }

    /**
     * The `remove` sub-command
     */
    protected async runRemove(
        context: CommandContext, item: number, faqData: Collection<string, JSONIfySchema<FaqSchema>>
    ): Promise<void> {
        if (!this.client.isOwner(context.author)) {
            await this.onBlock(context, 'ownerOnly');
            return;
        }

        if (faqData.size === 0) {
            await reply(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'The FAQ list is empty.',
            }));
            return;
        }

        const doc = faqData.first(item).pop();
        if (!doc) {
            await reply(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That item is invalid inside the FAQ list.',
            }));
            return;
        }

        await this.db.delete(doc);

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: `Removed entry ${item} from the FAQ list.`,
        }));
    }

    /**
     * The `clear` sub-command
     */
    protected async runClear(context: CommandContext, faqData: Collection<string, JSONIfySchema<FaqSchema>>): Promise<void> {
        if (!this.client.isOwner(context.author)) {
            await this.onBlock(context, 'ownerOnly');
            return;
        }

        if (faqData.size === 0) {
            await reply(context, basicEmbed({
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

        await reply(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: 'The FAQ list has been cleared.',
        }));
    }

    public override async runAutocomplete(interaction: CommandoAutocompleteInteraction): Promise<void> {
        const { client, options } = interaction;
        const query = options.getFocused().toLowerCase();
        const faqData = await client.database.faq.fetchMany();
        const possibleItems = faqData.toJSON()
            .filter(faq => faq.question.toLowerCase().includes(query))
            .slice(0, 25)
            .map<ChoiceData<number>>((faq, i) => ({
                name: limitStringLength(`${i + 1}. ${faq.question}`, 100),
                value: i + 1,
            }));
        await interaction.respond(possibleItems);
    }
}
