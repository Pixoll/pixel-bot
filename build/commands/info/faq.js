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
                            autocomplete: true,
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        if (!question || question.length > 100) {
            const questionMsg = await (0, utils_1.basicCollector)(context, {
                description: question && question.length < 100
                    ? 'Make sure the question is 100 characters or shorter.'
                    : undefined,
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'The FAQ list is empty.',
            }));
            return;
        }
        const doc = faqData.first(item).pop();
        if (!doc) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That item is invalid inside the FAQ list.',
            }));
            return;
        }
        await this.db.delete(doc);
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: 'The FAQ list has been cleared.',
        }));
    }
    async runAutocomplete(interaction) {
        const { client, options } = interaction;
        const query = options.getFocused().toLowerCase();
        const faqData = await client.database.faq.fetchMany();
        const possibleItems = faqData.toJSON()
            .filter(faq => faq.question.toLowerCase().includes(query))
            .slice(0, 25)
            .map((faq, i) => ({
            name: (0, utils_1.limitStringLength)(`${i + 1}. ${faq.question}`, 100),
            value: i + 1,
        }));
        await interaction.respond(possibleItems);
    }
}
exports.default = FaqCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFxLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2luZm8vZmFxLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQXdIO0FBQ3hILDZDQUEwQztBQUMxQyxxREFVeUI7QUFDekIsdUNBUXFCO0FBRXJCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsWUFBWTtRQUNqQixLQUFLLEVBQUUsYUFBYTtRQUNwQixNQUFNLEVBQUUsc0NBQXNDO1FBQzlDLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDO1FBQ3pDLE9BQU8sRUFBRSxNQUFNO1FBQ2YsS0FBSyxDQUFDLEtBQWE7WUFDZixPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixDQUFDO0tBQ0osRUFBRTtRQUNDLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLG9EQUFvRDtRQUM1RCxJQUFJLEVBQUUsU0FBUztRQUNmLEdBQUcsRUFBRSxDQUFDO1FBQ04sUUFBUSxFQUFFLEtBQUs7UUFDZixPQUFPLENBQUMsQ0FBVSxFQUFFLE9BQXdCO1lBQ3hDLE1BQU0sVUFBVSxHQUFHLElBQUEscUJBQWEsRUFBYSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sVUFBVSxLQUFLLFFBQVEsQ0FBQztRQUNuQyxDQUFDO0tBQ0osQ0FBVSxDQUFDO0FBU1osTUFBcUIsVUFBVyxTQUFRLHlCQUF5QjtJQUMxQyxFQUFFLENBQTZCO0lBRWxELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsS0FBSztZQUNYLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLGdHQUFnRztZQUM3RyxNQUFNLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7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