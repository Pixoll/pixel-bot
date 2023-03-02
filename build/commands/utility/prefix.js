"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
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
            details: (0, common_tags_1.stripIndent) `
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
            await context.replyEmbed((0, functions_1.basicEmbed)({
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
            await context.replyEmbed((0, functions_1.basicEmbed)({
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
        await context.replyEmbed((0, functions_1.basicEmbed)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZml4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWxpdHkvcHJlZml4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUEwQztBQUMxQyxxREFBNEg7QUFDNUgscURBQW1EO0FBRW5ELE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsV0FBVztRQUNoQixLQUFLLEVBQUUsWUFBWTtRQUNuQixNQUFNLEVBQUUscURBQXFEO1FBQzdELElBQUksRUFBRSxRQUFRO1FBQ2QsUUFBUSxFQUFFLEtBQUs7S0FDbEIsQ0FBVSxDQUFDO0FBS1osTUFBcUIsYUFBYyxTQUFRLHlCQUF5QjtJQUM3QyxRQUFRLENBQWdDO0lBRTNELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxTQUFTO1lBQ2hCLFdBQVcsRUFBRSxzQ0FBc0M7WUFDbkQsT0FBTyxFQUFFLElBQUEseUJBQVcsRUFBQTs7O0lBRzVCO1lBQ1EsTUFBTSxFQUFFLHFCQUFxQjtZQUM3QixRQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUM7WUFDdEIsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJO1NBQ1AsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7SUFDbEQsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLFNBQVMsRUFBYztRQUMvRCxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQUU7WUFBRSxPQUFPO1FBRXBDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMxQyxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFN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