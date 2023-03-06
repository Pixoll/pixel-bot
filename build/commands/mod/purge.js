"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
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
        parse(value) {
            return value.toLowerCase();
        },
    }, {
        key: 'filter',
        prompt: 'What filter would like to use? This can be an `user`, a `msg ID` or just `text` depending on the sub-command used.',
        type: ['user', 'message', 'string'],
        required: false,
        isEmpty(_, message) {
            const subCommand = (0, utils_1.getSubCommand)(message);
            return !pixoll_commando_1.Util.equals(subCommand, ['after', 'before', 'ends-with', 'match', 'starts-with', 'user']);
        },
        async validate(value, message, argument) {
            if (typeof value === 'undefined')
                return false;
            const subCommand = (0, utils_1.getSubCommand)(message);
            if (!pixoll_commando_1.Util.equals(subCommand, ['after', 'before', 'ends-with', 'match', 'starts-with', 'user']))
                return true;
            const chosenType = subCommand === 'user' ? 'user'
                : pixoll_commando_1.Util.equals(subCommand, ['after', 'before']) ? 'message' : 'string';
            const type = message.client.registry.types.get(chosenType);
            return await type?.validate(value, message, argument) ?? true;
        },
        async parse(value, message, argument) {
            const subCommand = (0, utils_1.getSubCommand)(message);
            if (!pixoll_commando_1.Util.equals(subCommand, ['after', 'before', 'ends-with', 'match', 'starts-with', 'user']))
                return null;
            const chosenType = subCommand === 'user' ? 'user'
                : pixoll_commando_1.Util.equals(subCommand, ['after', 'before']) ? 'message' : 'string';
            const type = message.client.registry.types.get(chosenType);
            return await type?.parse(value, message, argument) ?? null;
        },
    }];
const amountOption = {
    type: discord_js_1.ApplicationCommandOptionType.Integer,
    name: 'amount',
    description: 'The amount of messages to delete.',
    required: true,
    minValue: 1,
    maxValue: 100,
};
class PurgeCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'purge',
            group: 'mod',
            description: 'Delete a number of messages from a channel (limit of 100).',
            details: (0, common_tags_1.stripIndent) `
                \`number\` has be a number from 1 to 100.
                \`user\` has to be a user's username, ID or mention.
                \`msg ID\` has to be a message's ID that's in the **same channel** as where you use this command.
            `,
            format: (0, common_tags_1.stripIndent) `
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
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'all',
                    description: 'Delete all messages.',
                    options: [amountOption],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'links',
                    description: 'Delete messages with links/urls.',
                    options: [amountOption],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'files',
                    description: 'Delete messages with files.',
                    options: [amountOption],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'embeds',
                    description: 'Delete messages with embeds.',
                    options: [amountOption],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'users',
                    description: 'Delete messages sent by users.',
                    options: [amountOption],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'bots',
                    description: 'Delete messages sent by bots.',
                    options: [amountOption],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'user',
                    description: 'Delete messages sent by a specific user.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.User,
                            name: 'user',
                            description: 'The user who sent the messages.',
                            required: true,
                        }, amountOption],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'before',
                    description: 'Delete messages sent before a specific message.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'message-id',
                            description: 'The ID of the message.',
                            required: true,
                        }, amountOption],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'after',
                    description: 'Delete messages sent after a specific message.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'message-id',
                            description: 'The ID of the message.',
                            required: true,
                        }, amountOption],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'match',
                    description: 'Delete messages matching a certain text.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'text',
                            description: 'The text to match.',
                            required: true,
                        }, amountOption],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'starts-with',
                    description: 'Delete messages starting with a certain text.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'text',
                            description: 'The text to match.',
                            required: true,
                        }, amountOption],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'ends-with',
                    description: 'Delete messages ending with a certain text.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'text',
                            description: 'The text to match.',
                            required: true,
                        }, amountOption],
                }],
        });
    }
    async run(context, { amount, subCommand, filter, user, messageId, text }) {
        if (messageId) {
            const message = await context.channel.messages.fetch(messageId).catch(() => null);
            if (!message) {
                await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                    color: 'Red',
                    emoji: 'cross',
                    description: 'The message ID is invalid.',
                }));
                return;
            }
            filter = message;
        }
        if (amount < 100)
            amount++;
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
                return await this.runUser(context, amount, user ?? filter);
            case 'before':
                return await this.runBefore(context, amount, filter);
            case 'after':
                return await this.runAfter(context, amount, filter);
            case 'match':
                return await this.runMatch(context, amount, text ?? filter);
            case 'starts-with':
                return await this.runStartsWith(context, amount, text ?? filter);
            case 'ends-with':
                return await this.runEndsWith(context, amount, text ?? filter);
        }
    }
    /**
     * The `after` sub-command
     */
    async runAfter(context, amount, filter) {
        const messages = await fetchMessages(context, { limit: amount, after: filter.id });
        await bulkDelete(context, messages);
    }
    /**
     * The `all` sub-command
     */
    async runAll(context, amount) {
        const messages = await fetchMessages(context, { limit: amount });
        await bulkDelete(context, messages);
    }
    /**
     * The `before` sub-command
     */
    async runBefore(context, amount, filter) {
        const messages = await fetchMessages(context, { limit: amount, before: filter.id });
        await bulkDelete(context, messages);
    }
    /**
     * The `bots` sub-command
     */
    async runBots(context, amount) {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => msg.author.bot);
        await bulkDelete(context, filtered);
    }
    /**
     * The `embeds` sub-command
     */
    async runEmbeds(context, amount) {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => msg.embeds.length !== 0);
        await bulkDelete(context, filtered);
    }
    /**
     * The `ends-with` sub-command
     */
    async runEndsWith(context, amount, filter) {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => msg.content.toLowerCase().endsWith(filter));
        await bulkDelete(context, filtered);
    }
    /**
     * The `files` sub-command
     */
    async runFiles(context, amount) {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => msg.attachments.size !== 0);
        await bulkDelete(context, filtered);
    }
    /**
     * The `links` sub-command
     */
    async runLinks(context, amount) {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => {
            if (!msg.content)
                return false;
            for (const str of msg.content.split(/ +/)) {
                if ((0, utils_1.validateURL)(str))
                    return true;
            }
            return false;
        });
        await bulkDelete(context, filtered);
    }
    /**
     * The `match` sub-command
     */
    async runMatch(context, amount, filter) {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => msg.content.includes(filter.toString()));
        await bulkDelete(context, filtered);
    }
    /**
     * The `starts-with` sub-command
     */
    async runStartsWith(context, amount, filter) {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => msg.content.startsWith(filter.toString()));
        await bulkDelete(context, filtered);
    }
    /**
     * The `user` sub-command
     */
    async runUser(context, amount, filter) {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => msg.author.id === filter.id);
        await bulkDelete(context, filtered);
    }
    /**
     * The `users` sub-command
     */
    async runUsers(context, amount) {
        const messages = await fetchMessages(context, { limit: amount });
        const filtered = messages.filter(msg => !msg.author.bot);
        await bulkDelete(context, filtered);
    }
}
exports.default = PurgeCommand;
async function bulkDelete(context, messages) {
    if (messages.size === 0) {
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Red',
            emoji: 'cross',
            description: 'I couldn\'t find any messages.',
        }));
        return;
    }
    const { channel } = context;
    const bulk = await channel.bulkDelete(messages);
    const embed = (0, utils_1.basicEmbed)({
        color: 'Green',
        emoji: 'check',
        description: `Deleted ${bulk.size} messages.`,
    });
    const toDelete = await (0, utils_1.replyAll)(context, embed);
    if (context.isMessage())
        await context.delete().catch(() => null);
    await (0, utils_1.sleep)(10);
    await toDelete?.delete().catch(() => null);
}
async function fetchMessages(context, options) {
    const { channel } = context;
    const allMessages = await channel.messages.fetch(options).catch(() => null);
    const messages = allMessages?.filter(({ pinned, createdTimestamp }) => {
        const isPinned = pinned;
        const isOver14 = (Date.now() - createdTimestamp) >= 1209600000;
        return !isPinned && !isOver14;
    });
    const reference = context.isMessage() ? context : await context.fetchReply();
    return messages?.filter(msg => msg.id !== reference.id) ?? new discord_js_1.Collection();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVyZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kL3B1cmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUFxRztBQUNyRyxxREFVeUI7QUFDekIsdUNBQXNGO0FBRXRGLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsUUFBUTtRQUNiLEtBQUssRUFBRSxRQUFRO1FBQ2YsTUFBTSxFQUFFLDBDQUEwQztRQUNsRCxJQUFJLEVBQUUsU0FBUztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sR0FBRyxFQUFFLEdBQUc7S0FDWCxFQUFFO1FBQ0MsR0FBRyxFQUFFLFlBQVk7UUFDakIsS0FBSyxFQUFFLGFBQWE7UUFDcEIsTUFBTSxFQUFFLHFDQUFxQztRQUM3QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRTtZQUNILEtBQUs7WUFDTCxPQUFPO1lBQ1AsT0FBTztZQUNQLFFBQVE7WUFDUixPQUFPO1lBQ1AsTUFBTTtZQUNOLE1BQU07WUFDTixRQUFRO1lBQ1IsT0FBTztZQUNQLE9BQU87WUFDUCxhQUFhO1lBQ2IsV0FBVztTQUNkO1FBQ0QsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLENBQUMsS0FBYTtZQUNmLE9BQU8sS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9CLENBQUM7S0FDSixFQUFFO1FBQ0MsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQ0Ysb0hBQW9IO1FBQ3hILElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDO1FBQ25DLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxDQUFDLENBQVUsRUFBRSxPQUF3QjtZQUN4QyxNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxDQUFDLENBQUM7WUFDdEQsT0FBTyxDQUFDLHNCQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFD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