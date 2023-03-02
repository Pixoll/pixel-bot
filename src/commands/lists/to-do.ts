import { stripIndent } from 'common-tags';
import { ApplicationCommandOptionType } from 'discord.js';
import {
    Command,
    CommandContext,
    CommandoClient,
    DatabaseManager,
    TodoSchema,
    ParseRawArguments,
    CommandoMessage,
    Argument,
    Util,
    ArgumentType,
} from 'pixoll-commando';
import { generateEmbed, basicEmbed, confirmButtons, replyAll, getSubCommand } from '../../utils/functions';

const args = [{
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command do you want to use?',
    type: 'string',
    oneOf: ['view', 'add', 'remove', 'clear'],
    default: 'view',
}, {
    key: 'item',
    prompt: 'What item do you want to add/remove?',
    type: 'string',
    min: 1,
    max: 512,
    required: false,
    isEmpty(value: string, message: CommandoMessage): boolean {
        const subCommand = getSubCommand<SubCommand>(message, args[0].default);
        if (Util.equals(subCommand, ['clear', 'view'])) return true;
        return value?.length === 0;
    },
    async validate(value: string, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        const subCommand = getSubCommand<SubCommand>(message, args[0].default);
        if (Util.equals(subCommand, ['clear', 'view'])) return true;
        if (subCommand === 'add') {
            return await argument.type?.validate(
                value, message, Util.omit(argument, ['min']) as Argument
            ) ?? true;
        }
        const integerArg = argument.client.registry.types.get('integer') as ArgumentType<'integer'>;
        return await integerArg.validate(value, message, Util.omit(argument, ['max']) as Argument<'integer'>);
    },
    async parse(value: string, message: CommandoMessage, argument: Argument): Promise<number | string | null> {
        const subCommand = getSubCommand<SubCommand>(message, args[0].default);
        if (Util.equals(subCommand, ['clear', 'view'])) return null;
        if (subCommand === 'add') {
            const stringType = argument.type as ArgumentType<'string'>;
            return await stringType.parse(value, message, Util.omit(argument, ['min']) as Argument<'string'>);
        }
        const integerType = argument.client.registry.types.get('integer') as ArgumentType<'integer'>;
        return await integerType.parse(value, message, Util.omit(argument, ['max']) as Argument<'integer'>);
    },
}] as const;

type SubCommand = Lowercase<typeof args[0]['oneOf'][number]>;
type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class ToDoCommand extends Command<boolean, RawArgs> {
    protected readonly db: DatabaseManager<TodoSchema>;

    public constructor(client: CommandoClient) {
        super(client, {
            name: 'to-do',
            aliases: ['todo'],
            group: 'lists',
            description: 'View your to-do list, or add/remove an item.',
            details: '`items` can be different **positive** numbers, separated by spaces.',
            format: stripIndent`
                todo <view> - Display your to-do list.
                todo add [item] - Add an item to your to-do list.
                todo remove [item] - Remove an item from your to-do list.
                todo clear - Remove all of the items in your to-do list.
            `,
            examples: [
                'todo add Make awesome commands',
                'todo remove 2',
            ],
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Subcommand,
                name: 'view',
                description: 'Display your to-do list.',
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'add',
                description: 'Add an item to your to-do list.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'item',
                    description: 'The item to add to your to-do list.',
                    required: true,
                    maxLength: 512,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'remove',
                description: 'Remove an item from your to-do list.',
                options: [{
                    type: ApplicationCommandOptionType.Integer,
                    name: 'item',
                    description: 'The item to remove from your to-do list.',
                    required: true,
                    minValue: 1,
                }],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'clear',
                description: 'Remove all of the items in your to-do list.',
            }],
        });

        this.db = this.client.database.todo;
    }

    public async run(context: CommandContext, { subCommand, item }: ParsedArgs): Promise<void> {
        const lcSubCommand = subCommand.toLowerCase();
        const { author } = context;

        const todoDocument = await this.db.fetch({ user: author.id });

        switch (lcSubCommand) {
            case 'view':
                return await this.runView(context, todoDocument);
            case 'add':
                return await this.runAdd(context, item as string, todoDocument);
            case 'remove':
                return await this.runRemove(context, item as unknown as number, todoDocument);
            case 'clear':
                return await this.runClear(context, todoDocument);
        }
    }

    /**
     * The `view` sub-command
     */
    protected async runView(context: CommandContext, todoData: TodoSchema | null): Promise<void> {
        if (!todoData || !todoData.list || todoData.list.length === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'Your to-do list is empty.',
            }));
            return;
        }

        const { author } = context;

        await generateEmbed(context, todoData.list, {
            number: 5,
            authorName: 'Your to-do list',
            authorIconURL: author.displayAvatarURL({ forceStatic: false }),
            title: 'Item',
            hasObjects: false,
            toUser: true,
            dmMsg: 'Check your DMs for your to-do list.',
        });
    }

    /**
     * The `add` sub-command
     */
    protected async runAdd(context: CommandContext, item: string, todoData: TodoSchema | null): Promise<void> {
        const { author } = context;
        if (!todoData) await this.db.add({ user: author.id, list: [item] });
        else await this.db.update(todoData, { $push: { list: item } });

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            fieldName: `Added item \`${(todoData?.list.length ?? 0) + 1}\` to your to-do list:`,
            fieldValue: item,
        }));
    }

    /**
     * The `remove` sub-command
     */
    protected async runRemove(context: CommandContext, item: number, todoData: TodoSchema | null): Promise<void> {
        if (!todoData || !todoData.list || todoData.list.length === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'Your to-do list is empty.',
            }));
            return;
        }

        if (!todoData.list[--item]) {
            await replyAll(context, basicEmbed({
                color: 'Red',
                emoji: 'cross',
                description: 'That\'s not a valid item number inside your to-do list.',
            }));
            return;
        }
        await this.db.update(todoData, { $pull: { list: todoData.list[item++] } });

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: `Removed item \`${item}\` from your to-do list.`,
        }));
    }

    /**
     * The `clear` sub-command
     */
    protected async runClear(context: CommandContext, todoData: TodoSchema | null): Promise<void> {
        if (!todoData || !todoData.list || todoData.list.length === 0) {
            await replyAll(context, basicEmbed({
                color: 'Blue',
                emoji: 'info',
                description: 'Your to-do list is empty.',
            }));
            return;
        }

        const confirmed = await confirmButtons(context, {
            action: 'clear your to-do list',
        });
        if (!confirmed) return;

        await this.db.delete(todoData);

        await replyAll(context, basicEmbed({
            color: 'Green',
            emoji: 'check',
            description: 'Your to-do list has been cleared.',
        }));
    }
}
