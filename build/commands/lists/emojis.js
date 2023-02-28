"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
function sliceEmojis(arr) {
    const dummy = [];
    const normal = [];
    for (const emoji of arr) {
        if (dummy.join(' ').length + emoji.length + 1 > 1024) {
            normal.push(dummy);
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
            details: 'If the amount of emojis is too big, I will only display the maximum amount I\'m able to.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const { guild } = context;
        const rawEmojis = await guild.emojis.fetch();
        const maxEmojis = maxEmojiAmountMap[guild.premiumTier];
        const emojis = rawEmojis.map(emoji => ({
            animated: emoji.animated,
            string: emoji.toString(),
        }));
        const embed = new discord_js_1.EmbedBuilder()
            .setColor('#4c9f4c')
            .setAuthor({
            name: `${guild.name}'s emojis`,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        });
        const notAnimated = emojis.filter(e => !e.animated).map(e => e.string);
        const isAnimated = emojis.filter(e => e.animated).map(e => e.string);
        const normal = sliceEmojis(notAnimated);
        const animated = sliceEmojis(isAnimated);
        embed.addFields({
            name: `Normal emojis: ${notAnimated.length}/${maxEmojis}`,
            value: normal.shift()?.join(' ') || 'No emojis found.',
        });
        while (normal.length !== 0) {
            embed.addFields({
                name: '\u2800',
                value: normal.shift()?.join(' ') ?? '',
            });
        }
        embed.addFields({
            name: `Animated emojis: ${isAnimated.length}/${maxEmojis}`,
            value: animated.shift()?.join(' ') || 'No emojis found.',
        });
        while (animated.length !== 0) {
            embed.addFields({
                name: '\u2800',
                value: animated.shift()?.join(' ') ?? '',
            });
        }
        await (0, functions_1.replyAll)(context, embed);
    }
}
exports.default = EmojisCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamlzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL2xpc3RzL2Vtb2ppcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUE0RDtBQUM1RCxxREFBMEU7QUFDMUUscURBQWlEO0FBRWpELFNBQVMsV0FBVyxDQUFDLEdBQWE7SUFDOUIsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNsQixLQUFLLE1BQU0sS0FBSyxJQUFJLEdBQUcsRUFBRTtRQUNyQixJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRTtZQUNsRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25CLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNqQztRQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDckI7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25CLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFFRCxNQUFNLGlCQUFpQixHQUFxQztJQUN4RCxDQUFDLDZCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7SUFDM0IsQ0FBQyw2QkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHO0lBQzdCLENBQUMsNkJBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRztJQUM3QixDQUFDLDZCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUc7Q0FDaEMsQ0FBQztBQUVGLE1BQXFCLGFBQWMsU0FBUSx5QkFBYTtJQUNwRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsT0FBTztZQUNkLFdBQVcsRUFBRSxtQ0FBbUM7WUFDaEQsT0FBTyxFQUFFLDBGQUEwRjtZQUNuRyxTQUFTLEVBQUUsSUFBSTtZQUNmLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkI7UUFDMUMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUMxQixNQUFNLFNBQVMsR0FBRyxNQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0MsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXZELE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtZQUN4QixNQUFNLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRTtTQUMzQixDQUFDLENBQUMsQ0FBQztRQUVKLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsU0FBUyxDQUFDO2FBQ25CLFNBQVMsQ0FBQztZQUNQLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLFdBQVc7WUFDOUIsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxTQUFTO1NBQzlELENBQUMsQ0FBQztRQUVQLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkUsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFckUsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV6QyxLQUFLLENBQUMsU0FBUyxDQUFDO1lBQ1osSUFBSSxFQUFFLGtCQUFrQixXQUFXLENBQUMsTUFBTSxJQUFJLFNBQVMsRUFBRTtZQUN6RCxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxrQkFBa0I7U0FDekQsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN4QixLQUFLLENBQUMsU0FBUyxDQUFDO2dCQUNaLElBQUksRUFBRSxRQUFRO2dCQUNkLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7YUFDekMsQ0FBQyxDQUFDO1NBQ047UUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDO1lBQ1osSUFBSSxFQUFFLG9CQUFvQixVQUFVLENBQUMsTUFBTSxJQUFJLFNBQVMsRUFBRTtZQUMxRCxLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxrQkFBa0I7U0FDM0QsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMxQixLQUFLLENBQUMsU0FBUyxDQUFDO2dCQUNaLElBQUksRUFBRSxRQUFRO2dCQUNkLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7YUFDM0MsQ0FBQyxDQUFDO1NBQ047UUFFRCxNQUFNLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbkMsQ0FBQztDQUNKO0FBM0RELGdDQTJEQyJ9