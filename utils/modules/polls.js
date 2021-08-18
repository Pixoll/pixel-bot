const { MessageEmbed, NewsChannel, TextChannel, Message, Guild } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { polls } = require('../mongo/schemas')

/**
 * This module manages polls.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    async function endPolls() {
        const query = { endsAt: { $lte: Date.now() } }
        const pollsData = await polls.find(query)
        const { guilds } = client

        for (const poll of pollsData) {
            /** @type {Guild} */
            const guild = await guilds.fetch(poll.guild, false).catch(() => null)
            if (!guild) continue

            /** @type {NewsChannel|TextChannel} */
            const channel = guild.channels.resolve(poll.channel)
            if (!channel) continue

            /** @type {Message} */
            const message = await channel.messages.fetch(poll.message, false).catch(() => null)
            if (!message) continue

            const reactions = message.reactions.cache.map(r => r).filter(({ emoji }) => poll.emojis.includes(emoji.id || emoji.name))

            var results = []
            for (const reaction of reactions) {
                const votes = reaction.count - 1
                const emoji = reaction.emoji.toString()
                results.push({ votes, emoji })
            }

            const winners = results.sort((a, b) => b.votes - a.votes).filter(({ votes }, i, arr) => arr[0].votes === votes)

            const winner = winners.length === 1 ? `The winner was the choice ${winners[0].emoji} with a total of \`${winners[0].votes}\` votes!` : ''
            const draw = winners.length > 1 ? `It seems like there was a draw between these choices: ${winners.map(({ emoji }) => emoji).join(', ')}` : ''
            const noVotes = results.filter(({ votes }) => votes === 0).length === results.length ? 'It seems like no one voted on this poll...' : ''

            const pollEmbed = new MessageEmbed()
                .setColor('#4c9f4c')
                .setAuthor(`${guild.name}'s polls`, guild.iconURL({ dynamic: true }))
                .setTitle('The poll has ended!')
                .setURL(message.url)
                .setDescription(winner || noVotes || draw)
                .setTimestamp()

            if (!noVotes) pollEmbed.addField('These are the full results:', results.map(({ emoji, votes }) => `**>** Choice ${emoji} with \`${votes}\` votes`))

            await channel.send(pollEmbed)
        }

        await polls.deleteMany(query)
        setTimeout(endPolls, 5 * 1000)
    }

    endPolls()
}