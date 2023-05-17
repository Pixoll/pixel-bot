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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZml4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL3V0aWxpdHkvcHJlZml4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUEwQztBQUMxQyxxREFReUI7QUFDekIsdUNBQXlDO0FBRXpDLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsV0FBVztRQUNoQixLQUFLLEVBQUUsWUFBWTtRQUNuQixNQUFNLEVBQUUscURBQXFEO1FBQzdELElBQUksRUFBRSxRQUFRO1FBQ2QsUUFBUSxFQUFFLEtBQUs7S0FDbEIsQ0FBb0QsQ0FBQztBQUt0RCxNQUFxQixhQUFjLFNBQVEseUJBQXlCO0lBQzdDLFFBQVEsQ0FBZ0M7SUFFM0QsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLFNBQVM7WUFDaEIsV0FBVyxFQUFFLHNDQUFzQztZQUNuRCxtQkFBbUIsRUFBRSxJQUFBLHlCQUFXLEVBQUE7OztJQUd4QztZQUNRLE1BQU0sRUFBRSxxQkFBcUI7WUFDN0IsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDO1lBQ3RCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSTtTQUNQLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0lBQ2xELENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxTQUFTLEVBQWM7UUFDL0QsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFO1lBQUUsT0FBTztRQUVwQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDMUMsTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUFFLE1BQU0sSUFBSSxNQUFNLENBQUMs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