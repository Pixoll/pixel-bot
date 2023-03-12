import { EmbedBuilder, ChannelType, GuildTextBasedChannel } from 'discord.js';
import { CommandoClient, CommandoGuild, JSONIfySchema, PollSchema } from 'pixoll-commando';

/** This module manages polls. */
export default async function (client: CommandoClient<true>): Promise<void> {
    await endPolls(client);
}

async function endPolls(client: CommandoClient<true>): Promise<void> {
    const guilds = client.guilds.cache.toJSON();
    for (const guild of guilds) {
        const db = guild.database.polls;

        const pollsData = await db.fetchMany({ duration: { $lte: Date.now() } });
        for (const poll of pollsData.toJSON()) {
            client.emit('debug', 'Running event "modules/polls#endPoll".');
            await handlePoll(poll, client, guild);
        }

        await Promise.all(pollsData.map(poll => db.delete(poll)));
    }

    setTimeout(async () => await endPolls(client), 1000);
}

async function handlePoll(
    poll: JSONIfySchema<PollSchema>, client: CommandoClient<true>, guild: CommandoGuild
): Promise<void> {
    const channel = client.channels.resolve(poll.channel) as GuildTextBasedChannel | null;
    if (!channel || channel.type === ChannelType.GuildStageVoice) return;

    const message = await channel.messages.fetch(poll.message).catch(() => null);
    if (!message) return;

    const reactions = message.reactions.cache.filter(({ emoji }) => {
        const query = emoji.id || emoji.name;
        return query && poll.emojis.includes(query);
    }).toJSON();

    const results = [];
    for (const reaction of reactions) {
        const votes = reaction.count - 1;
        const emoji = reaction.emoji.toString();
        results.push({ votes, emoji });
    }

    const winners = results.sort((a, b) => b.votes - a.votes).filter((d, i, arr) => arr[0].votes === d.votes);

    const winner = winners.length === 1
        ? `The winner was the choice ${winners[0].emoji} with a total of \`${winners[0].votes}\` votes!` : null;

    const draw = winners.length > 1
        ? `It seems like there was a draw between these choices: ${winners.map(d => d.emoji).join(', ')}` : null;

    const noVotes = results.filter(d => d.votes === 0).length === results.length
        ? 'It seems like no one voted on this poll...' : null;

    const pollEmbed = new EmbedBuilder()
        .setColor('#4c9f4c')
        .setAuthor({
            name: 'The poll has ended!',
            iconURL: guild.iconURL({ forceStatic: false }) ?? undefined,
            url: message.url,
        })
        .setDescription(winner || noVotes || draw)
        .setTimestamp();

    if (!noVotes) {
        pollEmbed.addFields({
            name: 'These are the full results:',
            value: results.map(d => `**>** Choice ${d.emoji} with \`${d.votes}\` votes.`).join('\n'),
        });
    }

    await message.reply({ embeds: [pollEmbed] });
}
