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
        oneOf: ['view', 'clear'],
        default: 'view',
    }];
class RulesCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'rules',
            group: 'lists',
            description: 'Displays all the rules of this server. Use the `rule` command to add rules.',
            guildOnly: true,
            format: (0, common_tags_1.stripIndent) `
                rules <view> - Display the server rules.
                rules clear - Delete all of the server rules (server owner only).
            `,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'view',
                    description: 'Display the server rules.',
                }, {
                    type: discord_js_1.ApplicationCommandOptionType.Subcommand,
                    name: 'clear',
                    description: 'Delete all of the server rules (server owner only).',
                }],
        });
    }
    async run(context, { subCommand }) {
        const lcSubCommand = subCommand.toLowerCase();
        const { guild } = context;
        const db = guild.database.rules;
        const data = await db.fetch();
        if (!data || data.rules.length === 0) {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'The are no saved rules for this server. Use the `rule` command to add rules.',
            }));
            return;
        }
        switch (lcSubCommand) {
            case 'view':
                return await this.view(context, data.rules);
            case 'clear':
                return await this.clear(context, data, db);
        }
    }
    /**
     * The `view` sub-command
     */
    async view(context, rulesList) {
        const { guild } = context;
        await (0, functions_1.generateEmbed)(context, rulesList, {
            number: 5,
            authorName: `${guild.name}'s rules`,
            authorIconURL: guild.iconURL({ forceStatic: false }),
            title: 'Rule',
            hasObjects: false,
        });
    }
    /**
     * The `clear` sub-command
     */
    async clear(context, data, db) {
        const { client, guild, author } = context;
        if (!client.isOwner(author) && guild.ownerId !== author.id) {
            await this.onBlock(context, 'guildOwnerOnly');
            return;
        }
        const confirmed = await (0, functions_1.confirmButtons)(context, {
            action: 'delete all of the server rules',
        });
        if (!confirmed)
            return;
        await db.delete(data);
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: 'All the server rules have been deleted.',
        }));
    }
}
exports.default = RulesCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbGlzdHMvcnVsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBQTBEO0FBQzFELHFEQUEwSDtBQUMxSCxxREFBNEY7QUFFNUYsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO1FBQ3hCLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQVUsQ0FBQztBQUtaLE1BQXFCLFlBQWEsU0FBUSx5QkFBc0I7SUFDNUQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFLE9BQU87WUFDZCxXQUFXLEVBQUUsNkVBQTZFO1lBQzFGLFNBQVMsRUFBRSxJQUFJO1lBQ2YsTUFBTSxFQUFFLElBQUEseUJBQVcsRUFBQTs7O2FBR2xCO1lBQ0QsSUFBSTtTQUNQLEVBQUU7WUFDQyxPQUFPLEVBQUUsQ0FBQztvQkFDTixJQUFJLEVBQUUseUNBQTRCLENBQUMsVUFBVTtvQkFDN0MsSUFBSSxFQUFFLE1BQU07b0JBQ1osV0FBVyxFQUFFLDJCQUEyQjtpQkFDM0MsRUFBRTtvQkFDQyxJQUFJLEVBQUUseUNBQTRCLENBQUMsVUFBVTtvQkFDN0MsSUFBSSxFQUFFLE9BQU87b0JBQ2IsV0FBVyxFQUFFLHFEQUFxRDtpQkFDckUsQ0FBQztTQUNMLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQTZCLEVBQUUsRUFBRSxVQUFVLEVBQWM7UUFDdEUsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FB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