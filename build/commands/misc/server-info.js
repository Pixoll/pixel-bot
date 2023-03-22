"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerInfo = void 0;
const pixoll_commando_1 = require("pixoll-commando");
const discord_js_1 = require("discord.js");
const common_tags_1 = require("common-tags");
const utils_1 = require("../../utils");
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
        await (0, utils_1.reply)(context, serverInfo);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLWluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbWlzYy9zZXJ2ZXItaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxREFBeUY7QUFDekYsMkNBQXlFO0FBQ3pFLDZDQUEwQztBQUMxQyx1Q0FBb0M7QUFFcEMsTUFBTSxhQUFhLEdBQXFDO0lBQ3BELENBQUMsNkJBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsa0NBQWtDO0lBQzNELENBQUMsNkJBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsa0NBQWtDO0lBQzVELENBQUMsNkJBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsa0NBQWtDO0lBQzVELENBQUMsNkJBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsa0NBQWtDO0NBQy9ELENBQUM7QUFFRixNQUFxQixpQkFBa0IsU0FBUSx5QkFBYTtJQUN4RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLGFBQWE7WUFDbkIsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO1lBQ3ZCLEtBQUssRUFBRSxNQUFNO1lBQ2IsV0FBVyxFQUFFLGlHQUFpRztZQUM5RyxTQUFTLEVBQUUsSUFBSTtZQUNmLHdCQUF3QixFQUFFLElBQUk7U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkI7UUFDMUMsTUFBTSxVQUFVLEdBQUcsTUFBTSxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RELE1BQU0sSUFBQSxhQUFLLEVBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7Q0FDSjtBQWhCRCxvQ0FnQkM7QUFFTSxLQUFLLFVBQVUsYUFBYSxDQUFDLEtBQW9CO0lBQ3BELE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLEtBQUssQ0FBQztJQUNsSCxNQUFNLEtBQUssR0FBRyxNQUFNLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUV2QyxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO0lBQ25DLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLHdCQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3RGLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLHdCQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQzVFLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLHdCQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRTlFLE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBRXJDLE1BQU0sVUFBVSxHQUFHLElBQUkseUJBQVksRUFBRTtTQUNoQyxRQUFRLENBQUMsUUFBUSxDQUFDO1NBQ2xCLFNBQVMsQ0FBQztRQUNQLElBQUksRUFBRSxJQUFJO1FBQ1YsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxTQUFTO0tBQzlELENBQUM7U0FDRCxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7U0FDL0QsU0FBUyxDQUFDO1FBQ1AsSUFBSSxFQUFFLGFBQWE7UUFDbkIsS0FBSyxFQUFFLElBQUEseUJBQVcsRUFBQTt5QkFDTCxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUc7c0NBQ0QsVUFBVSxDQUFDLGNBQWMsRUFBRTtpQ0FDaEMsSUFBSSxDQUFDLGNBQWMsRUFBRTtrQ0FDcEIsS0FBSyxDQUFDLGNBQWMsRUFBRTthQUMzQztRQUNELE1BQU0sRUFBRSxJQUFJO0tBQ2YsRUFBRTtRQUNDLElBQUksRUFBRSxRQUFRO1FBQ2QsS0FBSyxFQUFFLElBQUEseUJBQVcsRUFBQTtvQ0FDTSxhQUFhLENBQUMsV0FBVyxDQUFDO2lDQUM3Qix3QkFBd0IsRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDOzJCQUNyRCxXQUFXLENBQUMsY0FBYyxFQUFFO3lCQUM5QixRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTthQUMxQztRQUNELE1BQU0sRUFBRSxJQUFJO0tBQ2YsQ0FBQztTQUNELFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLENBQUM7U0FDcEQsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFcEMsT0FBTyxVQUFVLENBQUM7QUFDdEIsQ0FBQztBQXpDRCxzQ0F5Q0MifQ==