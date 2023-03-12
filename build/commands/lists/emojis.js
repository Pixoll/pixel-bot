"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
function sliceEmojis(emojis) {
    const dummy = [];
    const normal = [];
    for (const emoji of emojis) {
        if (dummy.join(' ').length + emoji.length + 1 > 1024) {
            normal.push((0, utils_1.deepCopy)(dummy));
            dummy.splice(0, dummy.length);
        }
        dummy.push(emoji);
    }
    normal.push(dummy);
    return normal;
}
const maxEmojiAmountMap = {
    [discord_js_1.GuildPremiumTier.None]: 50,
    [discord_js_1.GuildPremiumTier.Tier1]: 100,
    [discord_js_1.GuildPremiumTier.Tier2]: 150,
    [discord_js_1.GuildPremiumTier.Tier3]: 250,
};
class EmojisCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'emojis',
            group: 'lists',
            description: 'Displays a list of server emojis.',
            detailedDescription: 'If the amount of emojis is too big, I will only display the maximum amount I\'m able to.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { guild } = context;
        const emojis = await guild.emojis.fetch();
        const maxEmojis = maxEmojiAmountMap[guild.premiumTier];
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
            name: `${guild.name}'s emojis`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
            .setDescription(`**Total emojis:** ${emojis.size}/${maxEmojis}`);
        const normal = emojis.filter(e => !e.animated).map(e => e.toString());
        const animated = emojis.filter(e => e.animated).map(e => e.toString());
        const normalChunks = sliceEmojis(normal);
        const animatedChunks = sliceEmojis(animated);
        embed.addFields({
            name: `Normal emojis: ${normal.length}/${maxEmojis}`,
            value: normalChunks.shift()?.join(' ') || 'No emojis found.',
        });
        while (normalChunks.length !== 0) {
            embed.addFields({
                name: '\u2800',
                value: normalChunks.shift()?.join(' ') ?? '',
            });
        }
        embed.addFields({
            name: `Animated emojis: ${animated.length}/${maxEmojis}`,
            value: animatedChunks.shift()?.join(' ') || 'No emojis found.',
        });
        while (animatedChunks.length !== 0) {
            embed.addFields({
                name: '\u2800',
                value: animatedChunks.shift()?.join(' ') ?? '',
            });
        }
        await (0, utils_1.replyAll)(context, embed);
    }
}
exports.default = EmojisCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamlzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2xpc3RzL2Vtb2ppcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUE0RDtBQUM1RCxxREFBMEU7QUFDMUUsdUNBQWlEO0FBRWpELFNBQVMsV0FBVyxDQUFDLE1BQWdCO0lBQ2pDLE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQztJQUMzQixNQUFNLE1BQU0sR0FBZSxFQUFFLENBQUM7SUFDOUIsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDeEIsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUU7WUFDbEQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFBLGdCQUFRLEVBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDakM7UUFDRCxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3JCO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQixPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQsTUFBTSxpQkFBaUIsR0FBcUM7SUFDeEQsQ0FBQyw2QkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO0lBQzNCLENBQUMsNkJBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRztJQUM3QixDQUFDLDZCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUc7SUFDN0IsQ0FBQyw2QkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHO0NBQ2hDLENBQUM7QUFFRixNQUFxQixhQUFjLFNBQVEseUJBQWE7SUFDcEQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1B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