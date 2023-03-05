"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const lodash_1 = require("lodash");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'subCommand',
        label: 'sub-command',
        prompt: 'What sub-command do you want to use?',
        type: 'string',
        oneOf: ['view', 'delete'],
        parse(value) {
            return value.toLowerCase();
        },
    }, {
        key: 'modLogId',
        label: 'mod-log ID',
        prompt: 'What is the ID of the mod log you want to view?',
        type: 'string',
        max: 16,
    }];
class ModLogCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'mod-log',
            aliases: ['modlog'],
            group: 'mod-logs',
            description: 'Display or delete a single moderation log.',
            details: (0, common_tags_1.oneLine) `
                \`modlog ID\` has to be a valid mod log ID.
                To see all the mod logs in this server use the \`mod-logs\` command.
            `,
            format: (0, common_tags_1.stripIndent) `
                mod-log view [mod-log ID] - Display a mod log's information.
                mod-log delete [mod-log ID] - Delete a mod log (admins only).
            `,
            examples: [
                'mod-log view 123456abcdef',
                'mod-log delete 186b2a4d2590270f',
            ],
            modPermissions: true,
            guildOnly: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'view',
                    description: 'Display a mod log\'s information.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'mod-log-id',
                            description: 'The ID of the mod log to display.',
                            required: true,
                            maxLength: 16,
                        }],
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'delete',
                    description: 'Delete a mod log.',
                    options: [{
                            type: discord_js_1.ApplicationCommandOptionType.String,
                            name: 'mod-log-id',
                            description: 'The ID of the mod log to delete.',
                            required: true,
                            maxLength: 16,
                        }],
                }],
        });
    }
    async run(context, { subCommand, modLogId }) {
        const { guild } = context;
        const modLog = await guild.database.moderations.fetch(modLogId);
        if (!modLog) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'I could not find the mod-log you were looking for.',
            }));
            return;
        }
        switch (subCommand) {
            case 'view':
                return await this.runView(context, modLog);
            case 'delete':
                return await this.runDelete(context, modLog);
        }
    }
    /**
     * The `view` sub-command
     */
    async runView(context, modLog) {
        const { users } = this.client;
        const user = await users.fetch(modLog.userId).catch(() => null);
        const moderator = await users.fetch(modLog.modId).catch(() => null);
        const modLogInfo = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
            name: `Mod log ${modLog._id}`, iconURL: user?.displayAvatarURL({ forceStatic: false }),
        })
            .setDescription((0, common_tags_1.stripIndent) `
                **Type:** ${(0, lodash_1.capitalize)(modLog.type)}
                **User:** ${`${user?.toString()} ${user?.tag}` || 'Unable to fetch user.'}
                **Moderator:** ${`${moderator?.toString()} ${moderator?.tag}` || 'Unable to fetch user.'}
                **Reason:** ${modLog.reason}
                **Duration:** ${modLog.duration ?? 'Permanent'}
                **Date:** ${(0, utils_1.timestamp)(modLog.createdAt)}
            `)
            .setTimestamp();
        await (0, utils_1.replyAll)(context, modLogInfo);
    }
    /**
     * The `delete` sub-command
     */
    async runDelete(context, modLog) {
        const { client, member, author, guild } = context;
        if (!client.isOwner(author) || member?.permissions.has('Administrator')) {
            await this.onBlock(context, 'userPermissions', { missing: ['Administrator'] });
            return;
        }
        const confirmed = await (0, utils_1.confirmButtons)(context, {
            action: 'delete mod log',
            target: modLog._id,
            ...modLog,
        });
        if (!confirmed)
            return;
        const activeDB = guild.database.active;
        const activeLog = await activeDB.fetch(`\`${modLog._id}\``);
        if (activeLog)
            await activeDB.delete(activeLog);
        await guild.database.moderations.delete(modLog);
        await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: `Deleted mod log with ID \`${modLog._id}\``,
        }));
    }
}
exports.default = ModLogCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLWxvZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2QtbG9ncy9tb2QtbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQW1EO0FBQ25ELDJDQUF3RTtBQUN4RSxtQ0FBb0M7QUFDcEMscURBQStHO0FBQy9HLHVDQUE4RTtBQUU5RSxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFlBQVk7UUFDakIsS0FBSyxFQUFFLGFBQWE7UUFDcEIsTUFBTSxFQUFFLHNDQUFzQztRQUM5QyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUM7UUFDekIsS0FBSyxDQUFDLEtBQWE7WUFDZixPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixDQUFDO0tBQ0osRUFBRTtRQUNDLEdBQUcsRUFBRSxVQUFVO1FBQ2YsS0FBSyxFQUFFLFlBQVk7UUFDbkIsTUFBTSxFQUFFLGlEQUFpRDtRQUN6RCxJQUFJLEVBQUUsUUFBUTtRQUNkLEdBQUcsRUFBRSxFQUFFO0tBQ1YsQ0FBVSxDQUFDO0FBS1osTUFBcUIsYUFBYyxTQUFRLHlCQUFzQjtJQUM3RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFNBQVM7WUFDZixPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDbkIsS0FBSyxFQUFFLFVBQVU7WUFDakIsV0FBVyxFQUFFLDRDQUE0QztZQUN6RCxPQUFPLEVBQUUsSUFBQSxxQkFBTyxFQUFBOzs7YUFHZjtZQUNELE1BQU0sRUFBRSxJQUFBLHlCQUFXLEVBQUE7OzthQUdsQjtZQUNELFFBQVEsRUFBRTtnQkFDTiwyQkFBMkI7Z0JBQzNCLGlDQUFpQzthQUNwQztZQUNELGNBQWMsRUFBRSxJQUFJO1lBQ3BCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtTQUNQLEVBQUU7WUFDQyxP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