"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
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
            detailedDescription: (0, common_tags_1.oneLine) `
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
                            autocomplete: true,
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
                            autocomplete: true,
                        }],
                }],
        });
    }
    async run(context, { subCommand, modLogId }) {
        const { guild } = context;
        const modLog = await guild.database.moderations.fetch(modLogId);
        if (!modLog) {
            await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
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
            .setColor(utils_1.pixelColor)
            .setAuthor({
            name: `Mod log ${modLog._id}`,
            iconURL: user?.displayAvatarURL({ forceStatic: false }),
        })
            .setDescription((0, common_tags_1.stripIndent) `
                **Type:** ${pixoll_commando_1.Util.capitalize(modLog.type)}
                **User:** ${`${user?.toString()} ${user?.tag}` || 'Unable to fetch user.'}
                **Moderator:** ${`${moderator?.toString()} ${moderator?.tag}` || 'Unable to fetch user.'}
                **Reason:** ${modLog.reason}
                **Duration:** ${modLog.duration ?? 'Permanent'}
                **Date:** ${(0, utils_1.timestamp)(modLog.createdAt, 'f', true)}
            `)
            .setTimestamp();
        await (0, utils_1.reply)(context, modLogInfo);
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
        await (0, utils_1.reply)(context, (0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: `Deleted mod log with ID \`${modLog._id}\``,
        }));
    }
    async runAutocomplete(interaction) {
        const { guild, options } = interaction;
        const query = options.getFocused().toLowerCase();
        const documents = await guild?.database.moderations.fetchMany();
        const choices = documents
            ?.map(doc => ({
            name: `[${pixoll_commando_1.Util.capitalize(doc.type)}] ${doc._id} (${doc.userTag})`,
            value: doc._id,
        }))
            .filter(doc => doc.name.toLowerCase().includes(query))
            .slice(0, 25) ?? [];
        await interaction.respond(choices);
    }
}
exports.default = ModLogCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kLWxvZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9tb2QtbG9ncy9tb2QtbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQW1EO0FBQ25ELDJDQUEwSDtBQUMxSCxxREFTeUI7QUFDekIsdUNBQXVGO0FBRXZGLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsWUFBWTtRQUNqQixLQUFLLEVBQUUsYUFBYTtRQUNwQixNQUFNLEVBQUUsc0NBQXNDO1FBQzlDLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQztRQUN6QixLQUFLLENBQUMsS0FBYTtZQUNmLE9BQU8sS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9CLENBQUM7S0FDSixFQUFFO1FBQ0MsR0FBRyxFQUFFLFVBQVU7UUFDZixLQUFLLEVBQUUsWUFBWTtRQUNuQixNQUFNLEVBQUUsaURBQWlEO1FBQ3pELElBQUksRUFBRSxRQUFRO1FBQ2QsR0FBRyxFQUFFLEVBQUU7S0FDVixDQUFVLENBQUM7QUFLWixNQUFxQixhQUFjLFNBQVEseUJBQXNCO0lBQzdELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNuQixLQUFLLEVBQUUsVUFBVTtZQUNqQixXQUFXLEVBQUUsNENBQTRDO1lBQ3pELG1CQUFtQixFQUFFLElBQUEscUJBQU8sRUFBQTs7O2FBRzNCO1lBQ0QsTUFBTSxFQUFFLElBQUEseUJBQVcsRUFBQTs7O2FBR2xCO1lBQ0QsUUFBUSxFQUFFO2dCQUNOLDJCQUEyQjtnQkFDM0IsaUNBQWlDO2FBQ3BDO1lBQ0QsY0FBYyxFQUFFLElBQUk7WUFDcEIsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1NBQ1AsRUFBRTtZQUNDLE9BQU8sRUFBRSxD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