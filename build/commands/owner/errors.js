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
            ownerOnly: true,
            dmOnly: true,
            args,
        });
        this.db = this.client.database.errors;
    }
    async run(context, { subCommand, errorId }) {
        if (context.isInteraction())
            return;
        const errors = await this.db.fetchMany();
        if (errors.size === 0) {
            await context.replyEmbed((0, utils_1.basicEmbed)({
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
            .setMaxValues(1).setMinValues(1)
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
            await context.replyEmbed((0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'I couldn\'t find the error you were looking for.',
            }));
            return;
        }
        await this.db.delete(doc);
        await context.replyEmbed((0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: `Error with ID \`${doc._id}\` has been successfully removed.`,
        }));
    }
}
exports.default = ErrorsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL293bmVyL2Vycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUFtRjtBQUNuRixxREFVeUI7QUFDekIsdUNBQXVFO0FBRXZFLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsWUFBWTtRQUNqQixNQUFNLEVBQUUsK0NBQStDO1FBQ3ZELElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQztRQUN6QixPQUFPLEVBQUUsTUFBTTtRQUNmLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsU0FBUztRQUNkLEtBQUssRUFBRSxVQUFVO1FBQ2pCLE1BQU0sRUFBRSw0Q0FBNEM7UUFDcEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sQ0FBQyxDQUFVLEVBQUUsT0FBd0I7WUFDeEMsTUFBTSxVQUFVLEdBQUcsSUFBQSxxQkFBYSxFQUFhLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkUsT0FBTyxVQUFVLEtBQUssUUFBUSxDQUFDO1FBQ25DLENBQUM7UUFDRCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQXlCLEVBQUUsT0FBd0IsRUFBRSxRQUFrQjtZQUNsRixNQUFNLFVBQVUsR0FBRyxJQUFBLHFCQUFhLEVBQWEsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RSxJQUFJLFVBQVUsS0FBSyxRQUFRO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQ3pDLE1BQU0sT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsS0FB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