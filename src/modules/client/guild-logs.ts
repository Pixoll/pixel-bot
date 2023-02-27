import { stripIndent } from 'common-tags';
import { EmbedBuilder, ColorResolvable, TextChannel, escapeMarkdown } from 'discord.js';
import { CommandoClient, CommandoGuild } from 'pixoll-commando';

const guildLogsChannelId = '906565308381286470';

/** Handles all of the guild join/leave logs. */
export default async function (client: CommandoClient<true>): Promise<void> {
    client.on('commandoGuildCreate', async guild => {
        client.emit('debug', `The bot has joined "${guild.name}"`);
        await sendGuildInfo(client, guild, 'The bot has joined a new guild', 'Green');
    });

    client.on('commandoGuildCreate', async guild => {
        client.emit('debug', `The bot has left "${guild.name}"`);
        await sendGuildInfo(client, guild, 'The bot has left a guild', 'Red');
    });
}

/**
 * sends info of a guild
 * @param color the color of the embed
 * @param message the message to send
 * @param guild the guild to get info of
 */
async function sendGuildInfo(
    client: CommandoClient<true>, guild: CommandoGuild, message: string, color: ColorResolvable
): Promise<void> {
    const { channels } = client;

    const channel = await channels.fetch(guildLogsChannelId).catch(() => null) as TextChannel | null;
    if (!channel) return;

    const { ownerId, name, id, memberCount } = guild;
    const owner = await guild.fetchOwner().catch(() => null).then(m => m?.user ?? null);
    const ownedBy = owner ? `${owner.toString()} ${owner.tag}` : ownerId;

    const info = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: message,
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
        })
        .setThumbnail(guild.iconURL({
            forceStatic: false,
            size: 2048,
        }))
        .setDescription(stripIndent`
            **Name:** ${escapeMarkdown(name)}
            **Owner:** ${escapeMarkdown(ownedBy)}
            **Members:** ${memberCount.toLocaleString()}
        `)
        .setFooter({ text: `Guild ID: ${id} • Owner ID: ${ownerId}` })
        .setTimestamp();

    await channel.send({ embeds: [info] });
}
