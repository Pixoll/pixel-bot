"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const guildLogsChannelId = '906565308381286470';
/** Handles all of the owner logs. */
async function default_1(client) {
    client.on('commandoGuildCreate', async (guild) => {
        client.emit('debug', `The bot has joined "${guild.name}"`);
        await sendGuildInfo(client, guild, 'The bot has joined a new guild', 'Green');
    });
    client.on('commandoGuildCreate', async (guild) => {
        client.emit('debug', `The bot has left "${guild.name}"`);
        await sendGuildInfo(client, guild, 'The bot has left a guild', 'Red');
    });
}
exports.default = default_1;
/**
 * sends info of a guild
 * @param color the color of the embed
 * @param message the message to send
 * @param guild the guild to get info of
 */
async function sendGuildInfo(client, guild, message, color) {
    const { channels } = client;
    const channel = await channels.fetch(guildLogsChannelId).catch(() => null);
    if (!channel)
        return;
    const { ownerId, name, id, memberCount } = guild;
    const owner = await guild.fetchOwner().catch(() => null).then(m => m?.user ?? null);
    const ownedBy = owner ? `${owner.toString()} ${owner.tag}` : ownerId;
    const info = new discord_js_1.EmbedBuilder()
        .setColor(color)
        .setAuthor({
        name: message,
        iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
    })
        .setThumbnail(guild.iconURL({
        forceStatic: false,
        size: 2048,
    }))
        .setDescription((0, common_tags_1.stripIndent) `
            **Name:** ${(0, discord_js_1.escapeMarkdown)(name)}
            **Owner:** ${(0, discord_js_1.escapeMarkdown)(ownedBy)}
            **Members:** ${memberCount.toLocaleString()}
        `)
        .setFooter({ text: `Guild ID: ${id} • Owner ID: ${ownerId}` })
        .setTimestamp();
    await channel.send({ embeds: [info] });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3duZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kdWxlcy9jbGllbnQvb3duZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsMkNBQXdGO0FBR3hGLE1BQU0sa0JBQWtCLEdBQUcsb0JBQW9CLENBQUM7QUFFaEQscUNBQXFDO0FBQ3RCLEtBQUssb0JBQVcsTUFBNEI7SUFDdkQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7UUFDM0MsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsdUJBQXVCLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQzNELE1BQU0sYUFBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsZ0NBQWdDLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEYsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBRTtRQUMzQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDekQsTUFBTSxhQUFhLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSwwQkFBMEIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMxRSxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFWRCw0QkFVQztBQUVEOzs7OztHQUtHO0FBQ0gsS0FBSyxVQUFVLGFBQWEsQ0FDeEIsTUFBNEIsRUFBRSxLQUFvQixFQUFFLE9BQWUsRUFBRSxLQUFzQjtJQUUzRixNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxDQUFDO0lBRTVCLE1BQU0sT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQXVCLENBQUM7SUFDakcsSUFBSSxDQUFDLE9BQU87UUFBRSxPQUFPO0lBRXJCLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsR0FBRyxLQUFLLENBQUM7SUFDakQsTUFBTSxLQUFLLEdBQUcsTUFBTSxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7SUFDcEYsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUVyRSxNQUFNLElBQUksR0FBRyxJQUFJLHlCQUFZLEVBQUU7U0FDMUIsUUFBUSxDQUFDLEtBQUssQ0FBQztTQUNmLFNBQVMsQ0FBQztRQUNQLElBQUksRUFBRSxPQUFPO1FBQ2IsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxTQUFTO0tBQzlELENBQUM7U0FDRCxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUN4QixXQUFXLEVBQUUsS0FBSztRQUNsQixJQUFJLEVBQUUsSUFBSTtLQUNiLENBQUMsQ0FBQztTQUNGLGNBQWMsQ0FBQyxJQUFBLHlCQUFXLEVBQUE7d0JBQ1gsSUFBQSwyQkFBYyxFQUFDLElBQUksQ0FBQzt5QkFDbkIsSUFBQSwyQkFBYyxFQUFDLE9BQU8sQ0FBQzsyQkFDckIsV0FBVyxDQUFDLGNBQWMsRUFBRTtTQUM5QyxDQUFDO1NBQ0QsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsT0FBTyxFQUFFLEVBQUUsQ0FBQztTQUM3RCxZQUFZLEVBQUUsQ0FBQztJQUVwQixNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDM0MsQ0FBQyJ9