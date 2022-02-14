/* eslint-disable no-unused-vars */
const { MessageEmbed, TextChannel, Message } = require('discord.js');
const { CommandoClient } = require('pixoll-commando');
/* eslint-enable no-unused-vars */

/**
 * This module manages polls.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    async function endPolls() {
        const guilds = client.guilds.cache.toJSON();
        const channels = client.channels.cache;

        for (const guild of guilds) {
            const db = guild.database.polls;

            const pollsData = await db.fetchMany({ duration: { $lte: Date.now() } });
            for (const poll of pollsData.toJSON()) {
                client.emit('debug', 'Running event "modules/polls#endPoll".');

                /** @type {TextChannel} */
                const channel = channels.get(poll.channel);
                if (!channel) continue;

                /** @type {Message} */
                const message = await channel.messages.fetch(poll.message).catch(() => null);
                if (!message) continue;

                const reactions = message.reactions.cache.filter(r =>
                    poll.emojis.includes(r.emoji.id || r.emoji.name)
                ).toJSON();

                const results = [];
                for (const reaction of reactions) {
                    const votes = reaction.count - 1;
                    const emoji = reaction.emoji.toString();
                    results.push({ votes, emoji });
                }

                const winners = results.sort((a, b) => b.votes - a.votes).filter((d, i, arr) => arr[0].votes === d.votes);

                const winner = winners.length === 1 ?
                    `The winner was the choice ${winners[0].emoji} with a total of \`${winners[0].votes}\` votes!` : null;

                const draw = winners.length > 1 ?
                    `It seems like there was a draw between these choices: ${winners.map(d => d.emoji).join(', ')}` : null;

                const noVotes = results.filter(d => d.votes === 0).length === results.length ?
                    'It seems like no one voted on this poll...' : null;

                const pollEmbed = new MessageEmbed()
                    .setColor('#4c9f4c')
                    .setAuthor({
                        name: 'The poll has ended!', iconURL: guild.iconURL({ dynamic: true }), url: message.url
                    })
                    .setDescription(winner || noVotes || draw)
                    .setTimestamp();

                if (!noVotes) {
                    pollEmbed.addField(
                        'These are the full results:',
                        results.map(d => `**>** Choice ${d.emoji} with \`${d.votes}\` votes.`).join('\n')
                    );
                }

                await message.reply({ embeds: [pollEmbed] });
            }

            for (const poll of pollsData.toJSON()) {
                await db.delete(poll);
            }
        }

        setTimeout(async () => await endPolls(), 1000);
    }

    await endPolls();
};
