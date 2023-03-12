import { stripIndent } from 'common-tags';
import { Collection, Message, FetchMessagesOptions, ApplicationCommandOptionType } from 'discord.js';
import {
    Argument,
    Command,
    CommandContext,
    CommandoClient,
    CommandoifiedMessage,
    CommandoMessage,
    CommandoUser,
    ParseRawArguments,
    Util,
} from 'pixoll-commando';
import { validateURL, basicEmbed, sleep, replyAll, getSubCommand } from '../../utils';

const args = [{
    key: 'amount',
    label: 'number',
    prompt: 'How many messages do you want to delete?',
    type: 'integer',
    min: 1,
    max: 100,
}, {
    key: 'subCommand',
    label: 'sub-command',
    prompt: 'What sub-command would like to use?',
    type: 'string',
    oneOf: [
        'all',
        'links',
        'files',
        'embeds',
        'users',
        'bots',
        'user',
        'before',
        'after',
        'match',
        'starts-with',
        'ends-with',
    ],
    default: 'all',
    parse(value: string): string {
        return value.toLowerCase();
    },
}, {
    key: 'filter',
    prompt:
        'What filter would like to use? This can be an `user`, a `msg ID` or just `text` depending on the sub-command used.',
    type: ['user', 'message', 'string'],
    required: false,
    isEmpty(_: unknown, message: CommandoMessage): boolean {
        const subCommand = getSubCommand<SubCommand>(message);
        return !Util.equals(subCommand, ['after', 'before', 'ends-with', 'match', 'starts-with', 'user']);
    },
    async validate(value: string | undefined, message: CommandoMessage, argument: Argument): Promise<boolean | string> {
        if (typeof value === 'undefined') return false;
        const subCommand = getSubCommand<SubCommand>(message);
        if (!Util.equals(subCommand, ['after', 'before', 'ends-with', 'match', 'starts-with', 'user'])) return true;
        const chosenType = subCommand === 'user' ? 'user'
            : Util.equals(subCommand, ['after', 'before']) ? 'message' : 'string';
        const type = message.client.registry.types.get(chosenType);
        return await type?.validate(value, message, argument) ?? true;
    },
    async parse(
        value: string, message: CommandoMessage, argument: Argument
    ): Promise<CommandoifiedMessage | CommandoUser | string | null> {
        const subCommand = getSubCommand<SubCommand>(message);
        if (!Util.equals(subCommand, ['after', 'before', 'ends-with', 'match', 'starts-with', 'user'])) return null;
        const chosenType = subCommand === 'user' ? 'user'
            : Util.equals(subCommand, ['after', 'before']) ? 'message' : 'string';
        const type = message.client.registry.types.get(chosenType);
        return await type?.parse(value, message, argument) as CommandoifiedMessage | CommandoUser | string | null ?? null;
    },
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs> & {
    user?: CommandoUser;
    messageId?: string;
    text?: string;
};
type SubCommand = ParsedArgs['subCommand'];

const amountOption = {
    type: ApplicationCommandOptionType.Integer,
    name: 'amount',
    description: 'The amount of messages to delete.',
    required: true,
    minValue: 1,
    maxValue: 100,
} as const;

export default class PurgeCommand extends Command<true, RawArgs> {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'purge',
            group: 'mod',
            description: 'Delete a number of messages from a channel (limit of 100).',
            detailedDescription: stripIndent`
                \`number\` has be a number from 1 to 100.
                \`user\` has to be a user's username, ID or mention.
                \`msg ID\` has to be a message's ID that's in the **same channel** as where you use this command.
            `,
            format: stripIndent`
                purge [amount] <all> - Delete all messages.
                purge [amount] links - Delete messages with links/urls.
                purge [amount] files - Delete messages with files.
                purge [amount] embeds - Delete messages with embeds.
                purge [amount] users - Delete messages sent by users.
                purge [amount] bots - Delete messages sent by bots.
                purge [amount] user [user] - Delete messages sent by \`user\`.
                purge [amount] before [msg ID] - Delete messages sent before \`msg ID\`.
                purge [amount] after [msg ID] - Delete messages sent after \`msg ID\`.
                purge [amount] match [text] - Delete messages matching \`text\`.
                purge [amount] starts-with [text] - Delete messages starting with \`text\`.
                purge [amount] ends-with [text] - Delete messages ending with \`text\`.
            `,
            examples: [
                'purge 20',
                'purge 69 bots',
                'purge 100 user Pixoll',
                'purge 20 before 889929422294102026',
                'purge 50 match @everyone',
            ],
            clientPermissions: ['ManageMessages'],
            userPermissions: ['ManageMessages'],
            guildOnly: true,
            args,
        }, {
            options: [{
                type: ApplicationCommandOptionType.Subcommand,
                name: 'all',
                description: 'Delete all messages.',
                options: [amountOption],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'links',
                description: 'Delete messages with links/urls.',
                options: [amountOption],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'files',
                description: 'Delete messages with files.',
                options: [amountOption],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'embeds',
                description: 'Delete messages with embeds.',
                options: [amountOption],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'users',
                description: 'Delete messages sent by users.',
                options: [amountOption],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'bots',
                description: 'Delete messages sent by bots.',
                options: [amountOption],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'user',
                description: 'Delete messages sent by a specific user.',
                options: [{
                    type: ApplicationCommandOptionType.User,
                    name: 'user',
                    description: 'The user who sent the messages.',
                    required: true,
                }, amountOption],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'before',
                description: 'Delete messages sent before a specific message.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'message-id',
                    description: 'The ID of the message.',
                    required: true,
                }, amountOption],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'after',
                description: 'Delete messages sent after a specific message.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'message-id',
                    description: 'The ID of the message.',
                    required: true,
                }, amountOption],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'match',
                description: 'Delete messages matching a certain text.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'text',
                    description: 'The text to match.',
                    required: true,
                }, amountOption],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'starts-with',
                description: 'Delete messages starting with a certain text.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'text',
                    description: 'The text to match.',
                    required: true,
                }, amountOption],
            }, {
                type: ApplicationCommandOptionType.Subcommand,
                name: 'ends-with',
                description: 'Delete messages ending with a certain text.',
                options: [{
                    type: ApplicationCommandOptionType.String,
                    name: 'text',
                    description: 'The text to match.',
                    required: true,
                }, amountOption],
            }],
        });
    }

    public async run(
        context: CommandContext<true>, { amount, subCommand, filter, user, messageId, text }: ParsedArgs
    ): Promise<void> {
        if (messageId) {
            const message = await context.channel.messages.fetch(messageId).catch(() => null);
            if (!message) {
                await replyAll(context, basicEmbed({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The message ID is invalid.',
                }));
                return;
            }
            filter = message as CommandoifiedMessage;
        }

        if (amount < 100) amount++;

        switch (subCommand) {
            case 'all':
                return await this.runAll(context, amount);
            case 'links':
                return await this.runLinks(context, amount);
            case 'files':
                return await this.runFiles(context, amount);
            case 'embeds':
                return await this.runEmbeds(context, amount);
            case 'users':
                return await this.runUsers(context, amount);
            case 'bots':
                return await this.runBots(context, amount);
            case 'user':
                return await this.runUser(context, amount, user ?? filter as CommandoUser);
            case 'before':
                return await this.runBefore(context, amount, filter as CommandoifiedMessage);
            case 'after':
                return await this.runAfter(context, amount, filter as CommandoifiedMessage);
            case 'match':
                return await this.runMatch(context, amount, text ?? filter as string);
            case 'starts-with':
                return await this.runStartsWith(context, amount, text ?? filter as string);
            case 'ends-with':
                return await this.runEndsWith(context, amount, text ?? filter as string);
        }
    }

    /**
     * The `after` sub-command
     */
    protected async runAfter(context: CommandContext<true>, amount: number, filter: CommandoifiedMessage): Promise<void> {
        const messages = await fetchMessages(context, { limit: amount, after: filter.id });
        await bulkDelete(context, messages);
    }

    /**
     * The `all` sub-command
     */
    protected async runAll(context: CommandContext<true>, amount: number): Promise<void> {
        const messages = await fetchMessages(context, { limit: amount });
        await bulkDelete(context, messages);
    }

    /**
     * The `before` sub-command
     */
    protected async runBefore(context: CommandContext<true>, amount: number, filter: CommandoifiedMessage): Promise<void> {
        const messages = await fetchMessages(context, { limit: amount, before: filter.id });
        await bulkDelete(context, messages);
    }

    /**
     * The `bots` sub-command
     */
    protected async runBots(context: CommandContext<true>, amount: number): Promise<void> {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => msg.author.bot);
        await bulkDelete(context, filtered);
    }

    /**
     * The `embeds` sub-command
     */
    protected async runEmbeds(context: CommandContext<true>, amount: number): Promise<void> {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => msg.embeds.length !== 0);
        await bulkDelete(context, filtered);
    }

    /**
     * The `ends-with` sub-command
     */
    protected async runEndsWith(context: CommandContext<true>, amount: number, filter: string): Promise<void> {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => msg.content.toLowerCase().endsWith(filter));
        await bulkDelete(context, filtered);
    }

    /**
     * The `files` sub-command
     */
    protected async runFiles(context: CommandContext<true>, amount: number): Promise<void> {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => msg.attachments.size !== 0);
        await bulkDelete(context, filtered);
    }

    /**
     * The `links` sub-command
     */
    protected async runLinks(context: CommandContext<true>, amount: number): Promise<void> {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => {
            if (!msg.content) return false;
            for (const str of msg.content.split(/ +/)) {
                if (validateURL(str)) return true;
            }
            return false;
        });
        await bulkDelete(context, filtered);
    }

    /**
     * The `match` sub-command
     */
    protected async runMatch(context: CommandContext<true>, amount: number, filter: string): Promise<void> {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => msg.content.includes(filter.toString()));
        await bulkDelete(context, filtered);
    }

    /**
     * The `starts-with` sub-command
     */
    protected async runStartsWith(context: CommandContext<true>, amount: number, filter: string): Promise<void> {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => msg.content.startsWith(filter.toString()));
        await bulkDelete(context, filtered);
    }

    /**
     * The `user` sub-command
     */
    protected async runUser(context: CommandContext<true>, amount: number, filter: CommandoUser): Promise<void> {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => msg.author.id === filter.id);
        await bulkDelete(context, filtered);
    }

    /**
     * The `users` sub-command
     */
    protected async runUsers(context: CommandContext<true>, amount: number): Promise<void> {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => !msg.author.bot);
        await bulkDelete(context, filtered);
    }
}

async function bulkDelete(context: CommandContext<true>, messages: Collection<string, Message>): Promise<void> {
    if (messages.size === 0) {
        await replyAll(context, basicEmbed({
            color: 'Red',
            emoji: 'cross',
            description: 'I couldn\'t find any messages.',
        }));
        return;
    }

    const { channel } = context;
    const bulk = await channel.bulkDelete(messages);

    const embed = basicEmbed({
        color: 'Green',
        emoji: 'check',
        description: `Deleted ${bulk.size} messages.`,
    });

    const toDelete = await replyAll(context, embed);
    if (context.isMessage()) await context.delete().catch(() => null);

    await sleep(10);
    await toDelete?.delete().catch(() => null);
}

async function fetchMessages(
    context: CommandContext<true>, options: FetchMessagesOptions
): Promise<Collection<string, Message>> {
    const { channel } = context;
    const allMessages = await channel.messages.fetch(options).catch(() => null);
    const messages = allMessages?.filter(({ pinned, createdTimestamp }) => {
        const isPinned = pinned;
        const isOver14 = (Date.now() - createdTimestamp) >= 1_209_600_000;
        return !isPinned && !isOver14;
    });
    const reference = context.isMessage() ? context : await context.fetchReply();
    return messages?.filter(msg => msg.id !== reference.id) ?? new Collection();
}
