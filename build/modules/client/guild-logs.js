"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const guildLogsChannelId = '906565308381286470';
/** Handles all of the guild join/leave logs. */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VpbGQtbG9ncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2R1bGVzL2NsaWVudC9ndWlsZC1sb2dzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTBDO0FBQzFDLDJDQUF3RjtBQUd4RixNQUFNLGtCQUFrQixHQUFHLG9CQUFvQixDQUFDO0FBRWhELGdEQUFnRDtBQUNqQyxLQUFLLG9CQUFXLE1BQTRCO0lBQ3ZELE1BQU0sQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO1FBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHVCQUF1QixLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUMzRCxNQUFNLGFBQWEsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLGdDQUFnQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xGLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLEVBQUMsS0FBSyxFQUFDLEVBQUU7UUFDM0MsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUscUJBQXFCLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sYUFBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsMEJBQTBCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUUsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBVkQsNEJBVUM7QUFFRDs7Ozs7R0FLRztBQUNILEtBQUssVUFBVSxhQUFhLENBQ3hCLE1BQTRCLEVBQUUsS0FBb0IsRUFBRSxPQUFlLEVBQUUsS0FBc0I7SUFFM0YsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sQ0FBQztJQUU1QixNQUFNLE9BQU8sR0FBRyxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUF1QixDQUFDO0lBQ2pHLElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTztJQUVyQixNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEdBQUcsS0FBSyxDQUFDO0lBQ2pELE1BQU0sS0FBSyxHQUFHLE1BQU0sS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDO0lBQ3BGLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFFckUsTUFBTSxJQUFJLEdBQUcsSUFBSSx5QkFBWSxFQUFFO1NBQzFCLFFBQVEsQ0FBQyxLQUFLLENBQUM7U0FDZixTQUFTLENBQUM7UUFDUCxJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksU0FBUztLQUM5RCxDQUFDO1NBQ0QsWUFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDeEIsV0FBVyxFQUFFLEtBQUs7UUFDbEIsSUFBSSxFQUFFLElBQUk7S0FDYixDQUFDLENBQUM7U0FDRixjQUFjLENBQUMsSUFBQSx5QkFBVyxFQUFBO3dCQUNYLElBQUEsMkJBQWMsRUFBQyxJQUFJLENBQUM7eUJBQ25CLElBQUEsMkJBQWMsRUFBQyxPQUFPLENBQUM7MkJBQ3JCLFdBQVcsQ0FBQyxjQUFjLEVBQUU7U0FDOUMsQ0FBQztTQUNELFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLE9BQU8sRUFBRSxFQUFFLENBQUM7U0FDN0QsWUFBWSxFQUFFLENBQUM7SUFFcEIsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzNDLENBQUMifQ==