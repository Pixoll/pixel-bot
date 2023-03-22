"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'subCommand',
        prompt: 'Do you want to filter or remove an error/bug?',
        type: 'string',
        oneOf: ['view', 'remove'],
        default: 'view',
        parse(value) {
            return value.toLowerCase();
        },
    }, {
        key: 'errorId',
        label: 'error ID',
        prompt: 'What specific error do you want to remove?',
        type: 'string',
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
class ErrorsCommand extends pixoll_commando_1.Command {
    db;
    constructor(client) {
        super(client, {
            name: 'errors',
            aliases: ['bugs'],
            group: 'owner',
            description: 'Displays all the errors that have happened in the bot.',
            hidden: true,
            guarded: true,
            ownerOnly: true,
            guildOnly: true,
            testAppCommand: true,
            userPermissions: ['Administrator'],
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'view',
                    description: 'View all error/bug records.',
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'remove',
                    description: 'Remove a error/bug record.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'error-id',
                            description: 'What specific error do you want to remove?',
                            required: true,
                            autocomplete: true,
                        }],
                }],
        });
        this.db = this.client.database.errors;
    }
    async run(context, { subCommand, errorId }) {
        const errors = await this.db.fetchMany();
        if (errors.size === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There have been no errors or bugs lately.',
            }));
            return;
        }
        switch (subCommand) {
            case 'view':
                return await this.runView(context, errors);
            case 'remove':
                return await this.runRemove(context, errorId);
        }
    }
    /**
     * The `view` sub-command
     */
    async runView(context, errors) {
        const errorsList = errors.map(doc => {
            const whatCommand = doc.command ? ` at '${doc.command}' command` : '';
            return {
                _id: doc._id,
                type: doc.type,
                message: doc.name + whatCommand + (doc.message ? (': ' + '``' + doc.message + '``') : ''),
                createdAt: doc.createdAt,
                files: doc.files,
            };
        });
        const filterMenu = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`${context.id}:menu`)
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder('Filter...')
            .setOptions([
            { label: 'All', value: 'all' },
            { label: 'Command error', value: 'Command error' },
            { label: 'Client error', value: 'Client error' },
            { label: 'Unhandled rejection', value: 'Unhandled rejection' },
            { label: 'Uncaught exception', value: 'Uncaught exception' },
            { label: 'Uncaught exception monitor', value: 'Uncaught exception monitor' },
            { label: 'Process warning', value: 'Process warning' },
        ]));
        await (0, utils_1.generateEmbed)(context, errorsList, {
            number: 3,
            authorName: 'Errors and bugs list',
            authorIconURL: context.client.user.displayAvatarURL({ forceStatic: false }),
            title: ' •  ID:',
            keyTitle: { prefix: 'type' },
            keysExclude: ['type', '_id'],
            useDocId: true,
            components: [filterMenu],
        });
    }
    /**
     * The `remove` sub-command
     */
    async runRemove(context, errorId) {
        const doc = await this.db.fetch(errorId);
        if (!doc) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'I couldn\'t find the error you were looking for.',
            }));
            return;
        }
        await this.db.delete(doc);
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: `Error with ID \`${doc._id}\` has been successfully removed.`,
        }));
    }
    async runAutocomplete(interaction) {
        const { options } = interaction;
        const query = options.getFocused().toLowerCase();
        const errors = await this.db.fetchMany();
        const possibleItems = errors
            .map(error => ({
            id: error._id,
            message: `[${error._id}] ${error.type}: ${error.message}`,
        }))
            .filter(error => error.message.toLowerCase().includes(query))
            .slice(0, 25)
            .map(error => ({
            name: (0, utils_1.limitStringLength)(error.message, 100),
            value: error.id,
        }));
        await interaction.respond(possibleItems);
    }
}
exports.default = ErrorsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL293bmVyL2Vycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQU1vQjtBQUNwQixxREFXeUI7QUFDekIsdUNBQW9HO0FBRXBHLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsWUFBWTtRQUNqQixNQUFNLEVBQUUsK0NBQStDO1FBQ3ZELElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQztRQUN6QixPQUFPLEVBQUUsTUFBTTtRQUNmLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsU0FBUztRQUNkLEtBQUssRUFBRSxVQUFVO1FBQ2pCLE1BQU0sRUFBRSw0Q0FBNEM7UUFDcEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sQ0FBQyxDQUFVLEVBQUUsT0FBd0I7WUFDeEMsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkUsT0FBTyxVQUFVLEtBQUssUUFBUSxDQUFDO1FBQ25DLENBQUM7UUFDRCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RSxJQUFJLFVBQVUsS0FBSyxRQUFRO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQ3pDLE1BQU0sT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsS0FB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