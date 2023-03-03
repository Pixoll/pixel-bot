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
        parse(value) {
            return value.toLowerCase();
        },
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
        const { guild } = context;
        const data = await guild.database.rules.fetch();
        if (!data || data.rules.length === 0) {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description: 'The are no saved rules for this server. Use the `rule` command to add rules.',
            }));
            return;
        }
        switch (subCommand) {
            case 'view':
                return await this.runView(context, data.rules);
            case 'clear':
                return await this.runClear(context, data);
        }
    }
    /**
     * The `view` sub-command
     */
    async runView(context, rulesList) {
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
    async runClear(context, data) {
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
        await guild.database.rules.delete(data);
        await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description: 'All the server rules have been deleted.',
        }));
    }
}
exports.default = RulesCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbGlzdHMvcnVsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBQTBEO0FBQzFELHFEQUF5RztBQUN6RyxxREFBNEY7QUFFNUYsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEtBQUssRUFBRSxhQUFhO1FBQ3BCLE1BQU0sRUFBRSxzQ0FBc0M7UUFDOUMsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO1FBQ3hCLE9BQU8sRUFBRSxNQUFNO1FBQ2YsS0FBSyxDQUFDLEtBQWE7WUFDZixPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixDQUFDO0tBQ0osQ0FBVSxDQUFDO0FBS1osTUFBcUIsWUFBYSxTQUFRLHlCQUFzQjtJQUM1RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSw2RUFBNkU7WUFDMUYsU0FBUyxFQUFFLElBQUk7WUFDZixNQUFNLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7YUFHbEI7WUFDRCxJQUFJO1NBQ1AsRUFBRTtZQUNDLE9BQU8sRUFBRSxDQUFDO29CQUNOLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVO29CQUM3QyxJQUFJLEVBQUUsTUFBTTtvQkFDWixXQUFXLEVBQUUsMkJBQTJCO2lCQUMzQyxFQUFFO29CQUNDLElBQUksRUFBRSx5Q0FBNEIsQ0FBQyxVQUFVO29CQUM3QyxJQUFJLEVBQUUsT0FBTztvQkFDYixXQUFXLEVBQUUscURBQXFEO2lCQUNyRSxDQUFDO1NBQ0wsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkIsRUFB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