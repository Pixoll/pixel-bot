"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const common_tags_1 = require("common-tags");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'What sub-command do you want to use?',
        type: 'string',
        oneOf: ['view', 'add', 'remove', 'clear'],
        default: 'view',
        parse(value) {
            return value.toLowerCase();
        },
    }, {
        key: 'item',
        prompt: 'What item do you want to remove from the FAQ list?',
        type: 'integer',
        min: 1,
        required: false,
        isEmpty(_, message) {
            const subCommand = (0, utils_1.getSubCommand)(message, args[0].default);
            return subCommand !== 'remove';
        },
    }];
class FaqCommand extends pixoll_commando_1.Command {
    db;
    constructor(client) {
        super(client, {
            name: 'faq',
            group: 'info',
            description: 'Displays the frequently asked questions (FAQ) related to the bot\'s functionality and support.',
            format: (0, common_tags_1.stripIndent) `
                faq <view> - Display the FAQ list.
                faq add - Add a new entry to the FAQ list (bot's owner only).
                faq remove [item] - Remove entries from the FAQ list (bot's owner only).
                faq clear - Remove every entry in the FAQ list (bot's owner only).
            `,
            guarded: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'view',
                    description: 'Display the FAQ list.',
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'add',
                    description: 'Add a new entry to the FAQ list (bot\'s owner only).',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'question',
                            description: 'The question to add to the FAQ list.',
                            required: true,
                        }, {
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'answer',
                            description: 'The question\'s answer.',
                            required: true,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'remove',
                    description: 'Remove entries from the FAQ list (bot\'s owner only).',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.Integer,
                            name: 'item',
                            description: 'The item to remove from the FAQ list.',
                            required: true,
                            minValue: 1,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'clear',
                    description: 'Remove every entry in the FAQ list (bot\'s owner only).',
                }],
        });
        this.db = this.client.database.faq;
    }
    async run(context, { item, subCommand, question, answer }) {
        const faqData = await this.db.fetchMany();
        switch (subCommand) {
            case 'view':
                return await this.runView(context, faqData);
            case 'add':
                return await this.runAdd(context, question, answer);
            case 'remove':
                return await this.runRemove(context, item, faqData);
            case 'clear':
                return await this.runClear(context, faqData);
        }
    }
    /**
     * The `view` sub-command
     */
    async runView(context, faqData) {
        if (faqData.size === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'The FAQ list is empty.',
            }));
            return;
        }
        await (0, utils_1.generateEmbed)(context, faqData.toJSON(), {
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
    async runAdd(context, question, answer) {
        if (!this.client.isOwner(context.author)) {
            await this.onBlock(context, 'ownerOnly');
            return;
        }
        if (!question) {
            const questionMsg = await (0, utils_1.basicCollector)(context, {
                fieldName: 'What question do you want to answer?',
            }, { time: 2 * 60000 });
            if (!questionMsg)
                return;
            question = questionMsg.content;
        }
        if (!answer) {
            const answerMsg = await (0, utils_1.basicCollector)(context, {
                fieldName: 'Now, what would be it\'s answer?',
            }, { time: 2 * 60000 });
            if (!answerMsg)
                return;
            answer = answerMsg.content;
        }
        await this.db.add({ question, answer });
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: 'The new entry has been added to the FAQ list.',
        }));
    }
    /**
     * The `remove` sub-command
     */
    async runRemove(context, item, faqData) {
        if (!this.client.isOwner(context.author)) {
            await this.onBlock(context, 'ownerOnly');
            return;
        }
        if (faqData.size === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'The FAQ list is empty.',
            }));
            return;
        }
        const doc = faqData.first(item).pop();
        if (!doc) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That item is invalid inside the FAQ list.',
            }));
            return;
        }
        await this.db.delete(doc);
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: `Removed entry ${item} from the FAQ list.`,
        }));
    }
    /**
     * The `clear` sub-command
     */
    async runClear(context, faqData) {
        if (!this.client.isOwner(context.author)) {
            await this.onBlock(context, 'ownerOnly');
            return;
        }
        if (faqData.size === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'The FAQ list is empty.',
            }));
            return;
        }
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: 'clear the FAQ list',
        });
        if (!confirmed)
            return;
        for (const doc of faqData.toJSON()) {
            await this.db.delete(doc);
        }
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: 'The FAQ list has been cleared.',
        }));
    }
}
exports.default = FaqCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFxLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2luZm8vZmFxLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQXNFO0FBQ3RFLDZDQUEwQztBQUMxQyxxREFReUI7QUFDekIsdUNBT3FCO0FBRXJCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsWUFBWTtRQUNqQixLQUFLLEVBQUUsYUFBYTtRQUNwQixNQUFNLEVBQUUsc0NBQXNDO1FBQzlDLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDO1FBQ3pDLE9BQU8sRUFBRSxNQUFNO1FBQ2YsS0FBSyxDQUFDLEtBQWE7WUFDZixPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixDQUFDO0tBQ0osRUFBRTtRQUNDLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLG9EQUFvRDtRQUM1RCxJQUFJLEVBQUUsU0FBUztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLENBQUMsQ0FBVSxFQUFFLE9BQXdCO1lBQ3hDLE1BQU0sVUFBVSxHQUFHLElBQUEscUJBQWEsRUFBYSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sVUFBVSxLQUFLLFFBQVEsQ0FBQztRQUNuQyxDQUFDO0tBQ0osQ0FBVSxDQUFDO0FBU1osTUFBcUIsVUFBVyxTQUFRLHlCQUF5QjtJQUMxQyxFQUFFLENBQTZCO0lBRWxELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsS0FBSztZQUNYLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLGdHQUFnRztZQUM3RyxNQUFNLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7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