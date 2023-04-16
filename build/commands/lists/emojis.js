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
            .setColor(utils_1.pixelColor)
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
        await (0, utils_1.reply)(context, embed);
    }
}
exports.default = EmojisCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamlzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2xpc3RzL2Vtb2ppcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUE0RDtBQUM1RCxxREFBMEU7QUFDMUUsdUNBQTBEO0FBRTFELFNBQVMsV0FBVyxDQUFDLE1BQWdCO0lBQ2pDLE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQztJQUMzQixNQUFNLE1BQU0sR0FBZSxFQUFFLENBQUM7SUFDOUIsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7UUFDeEIsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUU7WUFDbEQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFBLGdCQUFRLEVBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDakM7UUFDRCxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3JCO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQixPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQsTUFBTSxpQkFBaUIsR0FBcUM7SUFDeEQsQ0FBQyw2QkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO0lBQzNCLENBQUMsNkJBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRztJQUM3QixDQUFDLDZCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUc7SUFDN0IsQ0FBQyw2QkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHO0NBQ2hDLENBQUM7QUFFRixNQUFxQixhQUFjLFNBQVEseUJBQWE7SUFDcEQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1B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