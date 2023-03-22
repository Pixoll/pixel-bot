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
            detailedDescription: (0, common_tags_1.stripIndent) `
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVyZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbW9kL3B1cmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQU1vQjtBQUNwQixxREFVeUI7QUFDekIsdUNBQXNGO0FBRXRGLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsUUFBUTtRQUNiLEtBQUssRUFBRSxRQUFRO1FBQ2YsTUFBTSxFQUFFLDBDQUEwQztRQUNsRCxJQUFJLEVBQUUsU0FBUztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sR0FBRyxFQUFFLEdBQUc7S0FDWCxFQUFFO1FBQ0MsR0FBRyxFQUFFLFlBQVk7UUFDakIsS0FBSyxFQUFFLGFBQWE7UUFDcEIsTUFBTSxFQUFFLHFDQUFxQztRQUM3QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRTtZQUNILEtBQUs7WUFDTCxPQUFPO1lBQ1AsT0FBTztZQUNQLFFBQVE7WUFDUixPQUFPO1lBQ1AsTUFBTTtZQUNOLE1BQU07WUFDTixRQUFRO1lBQ1IsT0FBTztZQUNQLE9BQU87WUFDUCxhQUFhO1lBQ2IsV0FBVztTQUNkO1FBQ0QsT0FBTyxFQUFFLEtBQUs7UUFDZCxLQUFLLENBQUMsS0FBYTtZQUNmLE9BQU8sS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9CLENBQUM7S0FDSixFQUFFO1FBQ0MsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQ0Ysb0hBQW9IO1FBQ3hILElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDO1FBQ25DLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxDQUFDLENBQVUsRUFBRSxPQUF3QjtZQUN4QyxNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxDQUFDLENBQUM7WUFDdEQsT0FBTyxDQUFDLHNCQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFD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