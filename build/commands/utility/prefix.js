"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'newPrefix',
        label: 'new prefix',
        prompt: 'What is the new prefix you want to set for the bot?',
        type: 'string',
        required: false,
    }];
class PrefixCommand extends pixoll_commando_1.Command {
    globalDb;
    constructor(client) {
        super(client, {
            name: 'prefix',
            group: 'utility',
            description: 'Get or change the prefix of the bot.',
            detailedDescription: (0, common_tags_1.stripIndent) `
				If \`new prefix\` is not defined, it will send the current prefix.
				Otherwise, it will change the current prefix for \`new prefix\`.
			`,
            format: 'prefix <new prefix>',
            examples: ['prefix ?'],
            guarded: true,
            args,
        });
        this.globalDb = this.client.database.prefixes;
    }
    async run(context, { newPrefix }) {
        if (context.isInteraction())
            return;
        const { guild, client, member } = context;
        const current = guild?.prefix || client.prefix;
        if (!newPrefix) {
            const description = guild ? `The bot prefix in this server is \`${current}\``
                : `The global bot prefix is \`${current}\``;
            await context.replyEmbed((0, utils_1.basicEmbed)({
                color: 'Blue',
                emoji: 'info',
                description,
            }));
            return;
        }
        if (!guild && !client.isOwner(context)) {
            await this.onBlock(context, 'ownerOnly');
            return;
        }
        if (guild && !client.isOwner(context) && !member?.permissions.has('Administrator')) {
            await this.onBlock(context, 'userPermissions', { missing: ['Administrator'] });
            return;
        }
        if (current === newPrefix) {
            await context.replyEmbed((0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: `The current prefix is already \`${newPrefix}\``,
            }));
            return;
        }
        if (guild)
            guild.prefix = newPrefix;
        else
            client.prefix = newPrefix;
        const targetDb = guild ? guild.database.prefixes : this.globalDb;
        const doc = await targetDb.fetch();
        if (doc && client.prefix === guild?.prefix) {
            await targetDb.delete(doc);
        }
        else {
            if (doc) {
                await targetDb.update(doc, { prefix: newPrefix });
            }
            else {
                await targetDb.add({
                    global: !guild,
                    guild: guild?.id,
                    prefix: newPrefix,
                });
            }
        }
        const description = guild ? `Changed the bot prefix of this server to \`${newPrefix}\``
            : `Changed the global bot prefix to \`${newPrefix}\``;
        await context.replyEmbed((0, utils_1.basicEmbed)({
            color: 'Green',
            emoji: 'check',
            description,
        }));
        if (!guild) {
            client.user.setActivity({
                name: `for ${newPrefix}help`,
                type: discord_js_1.ActivityType.Watching,
            });
        }
    }
}
exports.default = PrefixCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZml4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWxpdHkvcHJlZml4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUEwQztBQUMxQyxxREFBNEg7QUFDNUgsdUNBQXlDO0FBRXpDLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsV0FBVztRQUNoQixLQUFLLEVBQUUsWUFBWTtRQUNuQixNQUFNLEVBQUUscURBQXFEO1FBQzdELElBQUksRUFBRSxRQUFRO1FBQ2QsUUFBUSxFQUFFLEtBQUs7S0FDbEIsQ0FBVSxDQUFDO0FBS1osTUFBcUIsYUFBYyxTQUFRLHlCQUF5QjtJQUM3QyxRQUFRLENBQWdDO0lBRTNELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxTQUFTO1lBQ2hCLFdBQVcsRUFBRSxzQ0FBc0M7WUFDbkQsbUJBQW1CLEVBQUUsSUFBQSx5QkFBVyxFQUFBOzs7SUFHeEM7WUFDUSxNQUFNLEVBQUUscUJBQXFCO1lBQzdCLFFBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQztZQUN0QixPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUk7U0FDUCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztJQUNsRCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsU0FBUyxFQUFjO1FBQy9ELElBQUksT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUFFLE9BQU87UUFFcEMsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzFDLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxNQUFNLElBQUksTUFBTSxDQUFDLE1B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