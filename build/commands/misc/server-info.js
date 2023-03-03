"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerInfo = void 0;
const pixoll_commando_1 = require("pixoll-commando");
const discord_js_1 = require("discord.js");
const common_tags_1 = require("common-tags");
const functions_1 = require("../../utils/functions");
const boostLevelMap = {
    [discord_js_1.GuildPremiumTier.None]: '0<:boostLVL0:806554204323184692>',
    [discord_js_1.GuildPremiumTier.Tier1]: '1<:boostLVL1:806554216641331221>',
    [discord_js_1.GuildPremiumTier.Tier2]: '2<:boostLVL2:806554227815481364>',
    [discord_js_1.GuildPremiumTier.Tier3]: '3<:boostLVL3:806554239567527946>',
};
class ServerInfoCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'server-info',
            aliases: ['serverinfo'],
            group: 'misc',
            description: 'Displays some information and statistics of the server, such as owner, boosts and member count.',
            guildOnly: true,
            autogenerateSlashCommand: true,
        });
    }
    async run(context) {
        const serverInfo = await getServerInfo(context.guild);
        await (0, functions_1.replyAll)(context, serverInfo);
    }
}
exports.default = ServerInfoCommand;
async function getServerInfo(guild) {
    const { name, channels, premiumTier, premiumSubscriptionCount, memberCount, roles, id, createdTimestamp } = guild;
    const owner = await guild.fetchOwner();
    const allChannels = channels.cache;
    const categories = allChannels.filter(c => c.type === discord_js_1.ChannelType.GuildCategory).size;
    const text = allChannels.filter(c => c.type === discord_js_1.ChannelType.GuildText).size;
    const voice = allChannels.filter(c => c.type === discord_js_1.ChannelType.GuildVoice).size;
    const allRoles = await roles.fetch();
    const serverInfo = new discord_js_1.EmbedBuilder()
        .setColor('Random')
        .setAuthor({
        name: name,
        iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
    })
        .setThumbnail(guild.iconURL({ forceStatic: false, size: 2048 }))
        .addFields({
        name: 'Information',
        value: (0, common_tags_1.stripIndent) `
            **Owner:** ${owner.user.tag} <a:owner_crown:806558872440930425>
            **Channel categories:** ${categories.toLocaleString()}
            **Text channels:** ${text.toLocaleString()}
            **Voice channels:** ${voice.toLocaleString()}
            `,
        inline: true,
    }, {
        name: '\u200B',
        value: (0, common_tags_1.stripIndent) `
            **Server boost lvl:** ${boostLevelMap[premiumTier]}
            **Server boosts:** ${premiumSubscriptionCount?.toLocaleString() ?? 0} <a:boost:806364586231595028>
            **Members:** ${memberCount.toLocaleString()}
            **Roles:** ${allRoles.size.toLocaleString()}
            `,
        inline: true,
    })
        .setFooter({ text: `Server ID: ${id} • Created at` })
        .setTimestamp(createdTimestamp);
    return serverInfo;
}
exports.getServerInfo = getServerInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLWluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy9zZXJ2ZXItaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxREFBeUY7QUFDekYsMkNBQXlFO0FBQ3pFLDZDQUEwQztBQUMxQyxxREFBaUQ7QUFFakQsTUFBTSxhQUFhLEdBQXFDO0lBQ3BELENBQUMsNkJBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsa0NBQWtDO0lBQzNELENBQUMsNkJBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsa0NBQWtDO0lBQzVELENBQUMsNkJBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsa0NBQWtDO0lBQzVELENBQUMsNkJBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsa0NBQWtDO0NBQy9ELENBQUM7QUFFRixNQUFxQixpQkFBa0IsU0FBUSx5QkFBYTtJQUN4RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLGFBQWE7WUFDbkIsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO1lBQ3ZCLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLGlHQUFpRztZQUM5RyxTQUFTLEVBQUUsSUFBSTtZQUNmLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkI7UUFDMUMsTUFBTSxVQUFVLEdBQUcsTUFBTSxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RELE1BQU0sSUFBQSxvQkFBUSxFQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN4QyxDQUFDO0NBQ0o7QUFoQkQsb0NBZ0JDO0FBRU0sS0FBSyxVQUFVLGFBQWEsQ0FBQyxLQUFvQjtJQUNwRCxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsd0JBQXdCLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxLQUFLLENBQUM7SUFDbEgsTUFBTSxLQUFLLEdBQUcsTUFBTSxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7SUFFdkMsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztJQUNuQyxNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyx3QkFBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUN0RixNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyx3QkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUM1RSxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyx3QkFBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUU5RSxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUVyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLHlCQUFZLEVBQUU7U0FDaEMsUUFBUSxDQUFDLFFBQVEsQ0FBQztTQUNsQixTQUFTLENBQUM7UUFDUCxJQUFJLEVBQUUsSUFBSTtRQUNWLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksU0FBUztLQUM5RCxDQUFDO1NBQ0QsWUFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQy9ELFNBQVMsQ0FBQztRQUNQLElBQUksRUFBRSxhQUFhO1FBQ25CLEtBQUssRUFBRSxJQUFBLHlCQUFXLEVBQUE7eUJBQ0wsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHO3NDQUNELFVBQVUsQ0FBQyxjQUFjLEVBQUU7aUNBQ2hDLElBQUksQ0FBQyxjQUFjLEVBQUU7a0NBQ3BCLEtBQUssQ0FBQyxjQUFjLEVBQUU7YUFDM0M7UUFDRCxNQUFNLEVBQUUsSUFBSTtLQUNmLEVBQUU7UUFDQyxJQUFJLEVBQUUsUUFBUTtRQUNkLEtBQUssRUFBRSxJQUFBLHlCQUFXLEVBQUE7b0NBQ00sYUFBYSxDQUFDLFdBQVcsQ0FBQztpQ0FDN0Isd0JBQXdCLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQzsyQkFDckQsV0FBVyxDQUFDLGNBQWMsRUFBRTt5QkFDOUIsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7YUFDMUM7UUFDRCxNQUFNLEVBQUUsSUFBSTtLQUNmLENBQUM7U0FDRCxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxDQUFDO1NBQ3BELFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRXBDLE9BQU8sVUFBVSxDQUFDO0FBQ3RCLENBQUM7QUF6Q0Qsc0NBeUNDIn0=