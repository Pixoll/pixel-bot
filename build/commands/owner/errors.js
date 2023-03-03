"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
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
            const subCommand = (0, functions_1.getSubCommand)(message, args[0].default);
            return subCommand !== 'remove';
        },
        async validate(value, message, argument) {
            const subCommand = (0, functions_1.getSubCommand)(message, args[0].default);
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
            await context.replyEmbed((0, functions_1.basicEmbed)({
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
        await (0, functions_1.generateEmbed)(context, errorsList, {
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
            await context.replyEmbed((0, functions_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'I couldn\'t find the error you were looking for.',
            }));
            return;
        }
        await this.db.delete(doc);
        await context.replyEmbed((0, functions_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: `Error with ID \`${doc._id}\` has been successfully removed.`,
        }));
    }
}
exports.default = ErrorsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL293bmVyL2Vycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUFtRjtBQUNuRixxREFTeUI7QUFDekIscURBQWlGO0FBRWpGLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsWUFBWTtRQUNqQixNQUFNLEVBQUUsK0NBQStDO1FBQ3ZELElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQztRQUN6QixPQUFPLEVBQUUsTUFBTTtRQUNmLEtBQUssQ0FBQyxLQUFhO1lBQ2YsT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsQ0FBQztLQUNKLEVBQUU7UUFDQyxHQUFHLEVBQUUsU0FBUztRQUNkLEtBQUssRUFBRSxVQUFVO1FBQ2pCLE1BQU0sRUFBRSw0Q0FBNEM7UUFDcEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsS0FBSztRQUNmLE9BQU8sQ0FBQyxDQUFTLEVBQUUsT0FBd0I7WUFDdkMsTUFBTSxVQUFVLEdBQUcsSUFBQSx5QkFBYSxFQUFhLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkUsT0FBTyxVQUFVLEtBQUssUUFBUSxDQUFDO1FBQ25DLENBQUM7UUFDRCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQWEsRUFBRSxPQUF3QixFQUFFLFFBQWtCO1lBQ3RFLE1BQU0sVUFBVSxHQUFHLElBQUEseUJBQWEsRUFBYSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZFLElBQUksVUFBVSxLQUFLLFFBQVE7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDekMsTUFBTSxPQUFPLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxLQUFL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