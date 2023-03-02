"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
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
        isEmpty(value, message) {
            const subCommand = (0, functions_1.getSubCommand)(message, args[0].default);
            if (pixoll_commando_1.Util.equals(subCommand, ['clear', 'view']))
                return true;
            return value?.length === 0;
        },
        async validate(value, message, argument) {
            const subCommand = (0, functions_1.getSubCommand)(message, args[0].default);
            if (pixoll_commando_1.Util.equals(subCommand, ['clear', 'view']))
                return true;
            if (subCommand === 'add') {
                return await argument.type?.validate(value, message, pixoll_commando_1.Util.omit(argument, ['min'])) ?? true;
            }
            const integerArg = argument.client.registry.types.get('integer');
            return await integerArg.validate(value, message, pixoll_commando_1.Util.omit(argument, ['max']));
        },
        async parse(value, message, argument) {
            const subCommand = (0, functions_1.getSubCommand)(message, args[0].default);
            if (pixoll_commando_1.Util.equals(subCommand, ['clear', 'view']))
                return null;
            if (subCommand === 'add') {
                const stringType = argument.type;
                return await stringType.parse(value, message, pixoll_commando_1.Util.omit(argument, ['min']));
            }
            const integerType = argument.client.registry.types.get('integer');
            return await integerType.parse(value, message, pixoll_commando_1.Util.omit(argument, ['max']));
        },
    }];
class ToDoCommand extends pixoll_commando_1.Command {
    db;
    constructor(client) {
        super(client, {
            name: 'to-do',
            aliases: ['todo'],
            group: 'lists',
            description: 'View your to-do list, or add/remove an item.',
            details: '`items` can be different **positive** numbers, separated by spaces.',
            format: (0, common_tags_1.stripIndent) `
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
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'view',
                    description: 'Display your to-do list.',
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'add',
                    description: 'Add an item to your to-do list.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'item',
                            description: 'The item to add to your to-do list.',
                            required: true,
                            maxLength: 512,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'remove',
                    description: 'Remove an item from your to-do list.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.Integer,
                            name: 'item',
                            description: 'The item to remove from your to-do list.',
                            required: true,
                            minValue: 1,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'clear',
                    description: 'Remove all of the items in your to-do list.',
                }],
        });
        this.db = this.client.database.todo;
    }
    async run(context, { subCommand, item }) {
        const lcSubCommand = subCommand.toLowerCase();
        const { author } = context;
        const todoDocument = await this.db.fetch({ user: author.id });
        switch (lcSubCommand) {
            case 'view':
                return await this.runView(context, todoDocument);
            case 'add':
                return await this.runAdd(context, item, todoDocument);
            case 'remove':
                return await this.runRemove(context, item, todoDocument);
            case 'clear':
                return await this.runClear(context, todoDocument);
        }
    }
    /**
     * The `view` sub-command
     */
    async runView(context, todoData) {
        if (!todoData || !todoData.list || todoData.list.length === 0) {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'Your to-do list is empty.',
            }));
            return;
        }
        const { author } = context;
        await (0, functions_1.generateEmbed)(context, todoData.list, {
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
    async runAdd(context, item, todoData) {
        const { author } = context;
        if (!todoData)
            await this.db.add({ user: author.id, list: [item] });
        else
            await this.db.update(todoData, { $push: { list: item } });
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            fieldName: `Added item \`${(todoData?.list.length ?? 0) + 1}\` to your to-do list:`,
            fieldValue: item,
        }));
    }
    /**
     * The `remove` sub-command
     */
    async runRemove(context, item, todoData) {
        if (!todoData || !todoData.list || todoData.list.length === 0) {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'Your to-do list is empty.',
            }));
            return;
        }
        if (!todoData.list[--item]) {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'That\'s not a valid item number inside your to-do list.',
            }));
            return;
        }
        await this.db.update(todoData, { $pull: { list: todoData.list[item++] } });
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: `Removed item \`${item}\` from your to-do list.`,
        }));
    }
    /**
     * The `clear` sub-command
     */
    async runClear(context, todoData) {
        if (!todoData || !todoData.list || todoData.list.length === 0) {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'Your to-do list is empty.',
            }));
            return;
        }
        const confirmed = await (0, functions_1.confirmButtons)(context, {
            action: 'clear your to-do list',
        });
        if (!confirmed)
            return;
        await this.db.delete(todoData);
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: 'Your to-do list has been cleared.',
        }));
    }
}
exports.default = ToDoCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG8tZG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbGlzdHMvdG8tZG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBQTBEO0FBQzFELHFEQVd5QjtBQUN6QixxREFBMkc7QUFFM0csTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUM7UUFDekMsT0FBTyxFQUFFLE1BQU07S0FDbEIsRUFBRTtRQUNDLEdBQUcsRUFBRSxNQUFNO1FBQ1gsTUFBTSxFQUFFLHNDQUFzQztRQUM5QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxDQUFDO1FBQ04sR0FBRyxFQUFFLEdBQUc7UUFDUixRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sQ0FBQyxLQUFhLEVBQUUsT0FBd0I7WUFDM0MsTUFBTSxVQUFVLEdBQUcsSUFBQSx5QkFBYSxFQUFhLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkUsSUFBSSxzQkFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDNUQsT0FBTyxLQUFLLEVBQUUsTUFBTSxLQUFLLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBQ0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFhLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUN0RSxNQUFNLFVBQVUsR0FBRyxJQUFBLHlCQUFhLEVBQWEsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FB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