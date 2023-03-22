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
        switch (subCommand) {
            case 'view':
                return await this.runView(context);
            case 'remove':
                return await this.runRemove(context, errorId);
        }
    }
    /**
     * The `view` sub-command
     */
    async runView(context) {
        const errors = await this.db.fetchMany();
        if (errors.size === 0) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'There have been no errors or bugs lately.',
            }));
            return;
        }
        const errorsList = errors.map(error => {
            const whatCommand = error.command ? ` at '${error.command}' command` : '';
            return {
                _id: error._id,
                type: error.type,
                message: error.name + whatCommand + ': ' + '``' + error.message + '``',
                createdAt: error.createdAt,
                files: error.files,
            };
        });
        const filterMenu = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`${context.id}:menu`)
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder('Filter...')
            .setOptions([{
                label: 'All',
                value: 'all',
            }, ...Object.values(pixoll_commando_1.Util.omit(utils_1.errorTypeMap, ['warn']))
                .map(type => ({
                label: type,
                value: type,
            })),
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
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'I couldn\'t find the error you were looking for.',
            }));
            return;
        }
        await this.db.delete(doc);
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL293bmVyL2Vycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQU1vQjtBQUNwQixxREFXeUI7QUFDekIsdUNBQStHO0FBRS9HLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsWUFBWTtRQUNqQixNQUFNLEVBQUUsK0NBQStDO1FBQ3ZELElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQztRQUN6QixPQUFPLEVBQUUsTUFBTTtRQUNmLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsU0FBUztRQUNkLEtBQUssRUFBRSxVQUFVO1FBQ2pCLE1BQU0sRUFBRSw0Q0FBNEM7UUFDcEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sQ0FBQyxDQUFVLEVBQUUsT0FBd0I7WUFDeEMsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkUsT0FBTyxVQUFVLEtBQUssUUFBUSxDQUFDO1FBQ25DLENBQUM7UUFDRCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RSxJQUFJLFVBQVUsS0FBSyxRQUFRO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQ3pDLE1BQU0sT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsS0FB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