const { MessageEmbed, TextChannel, Message } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { polls } = require('../../mongo/schemas')
const { PollSchema } = require('../../mongo/typings')

/**
 * This module manages polls.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    async function endPolls() {
        const query = { endsAt: { $lte: Date.now() } }
        /** @type {PollSchema[]} */
        const pollsData = await polls.find(query)
        const guilds = client.guilds.cache
        const channels = client.channels.cache

        for (const poll of pollsData) {
            const guild = guilds.get(poll.guild)
            if (!guild) continue

            /** @type {TextChannel} */
            const channel = channels.get(poll.channel)
            if (!channel) continue

            /** @type {Message} */
            const message = await channel.messages.fetch(poll.message).catch(() => null)
            if (!message) continue

            const reactions = message.reactions.cache.filter(r =>
                poll.emojis.includes(r.emoji.id || r.emoji.name)
            )

            const results = []
            for (const [, reaction] of reactions) {
                const votes = reaction.count - 1
                const emoji = reaction.emoji.toString()
                results.push({ votes, emoji })
            }

            const winners = results.sort((a, b) => b.votes - a.votes).filter((d, i, arr) => arr[0].votes === d.votes)

            const winner = winners.length === 1 ?
                `The winner was the choice ${winners[0].emoji} with a total of \`${winners[0].votes}\` votes!` : null

            const draw = winners.length > 1 ?
                `It seems like there was a draw between these choices: ${winners.map(d => d.emoji).join(', ')}` : null

            const noVotes = results.filter(d => d.votes === 0).length === results.length ?
                'It seems like no one voted on this poll...' : null

            const pollEmbed = new MessageEmbed()
                .setColor('#4c9f4c')
                .setAuthor('The poll has ended!', guild.iconURL({ dynamic: true }), msg.url)
                .setDescription(winner || noVotes || draw)
                .setTimestamp()

            if (!noVotes) pollEmbed.addField(
                'These are the full results:',
                results.map(d => `**>** Choice ${d.emoji} with \`${d.votes}\` votes.`).join('\n')
            )

            await channel.send({ embeds: [pollEmbed] })
        }

        await polls.deleteMany(query)
        setTimeout(endPolls, 30 * 1000)
    }

    await endPolls()

    client.emit('debug', 'Loaded modules/polls')
}