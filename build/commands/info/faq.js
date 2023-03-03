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
        async validate(value, message, argument) {
            const subCommand = (0, utils_1.getSubCommand)(message, args[0].default);
            if (subCommand !== 'remove')
                return true;
            const isValid = await argument.type?.validate(value, message, argument) ?? true;
            return isValid;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFxLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2luZm8vZmFxLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQXNFO0FBQ3RFLDZDQUEwQztBQUMxQyxxREFTeUI7QUFDekIsdUNBT3FCO0FBRXJCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsWUFBWTtRQUNqQixLQUFLLEVBQUUsYUFBYTtRQUNwQixNQUFNLEVBQUUsc0NBQXNDO1FBQzlDLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDO1FBQ3pDLE9BQU8sRUFBRSxNQUFNO1FBQ2YsS0FBSyxDQUFDLEtBQWE7WUFDZixPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixDQUFDO0tBQ0osRUFBRTtRQUNDLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLG9EQUFvRDtRQUM1RCxJQUFJLEVBQUUsU0FBUztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLENBQUMsQ0FBUyxFQUFFLE9BQXdCO1lBQ3ZDLE1BQU0sVUFBVSxHQUFHLElBQUEscUJBQWEsRUFBYSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sVUFBVSxLQUFLLFFBQVEsQ0FBQztRQUNuQyxDQUFDO1FBQ0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFhLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUN0RSxNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RSxJQUFJLFVBQVUsS0FBSyxRQUFRO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQ3pDLE1BQU0sT0FB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