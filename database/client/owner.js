/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { MessageEmbed, ColorResolvable, TextChannel, Util, User } = require('discord.js')
const { CommandoClient, CommandoGuild } = require('../../command-handler/typings')
/* eslint-enable no-unused-vars */

/**
 * Handles all of the owner logs.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    /**
     * sends info of a guild
     * @param {ColorResolvable} color the color of the embed
     * @param {string} message the message to send
     * @param {CommandoGuild} guild the guild to get info of
     */
    async function guildInfo(color, message, guild) {
        const { channels, users } = client

        /** @type {TextChannel} */
        const channel = await channels.fetch('906565308381286470').catch(() => null)
        if (!channel) return

        const { ownerId, name, id, memberCount } = guild
        /** @type {User} */
        const owner = await users.fetch(ownerId).catch(() => null)
        const ownedBy = owner ? `${owner.toString()} ${owner?.tag || ''}` : ownerId

        const info = new MessageEmbed()
            .setColor(color)
            .setAuthor(message, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true, size: 2048 }))
            .setDescription(stripIndent`
                **Name:** ${Util.escapeMarkdown(name)}
                **Owner:** ${Util.escapeMarkdown(ownedBy)}
                **Members:** ${memberCount.toLocaleString()}
            `)
            .setFooter(`Guild id: ${id} • Owner id: ${ownerId}`)
            .setTimestamp()

        await channel.send({ embeds: [info] })
    }

    client.on('guildCreate', async guild => {
        client.emit('debug', `The bot has joined "${guild.name}"`)
        await guildInfo('GREEN', 'The bot has joined a new guild', guild)
    })

    client.on('guildDelete', async guild => {
        client.emit('debug', `The bot has left "${guild.name}"`)
        await guildInfo('RED', 'The bot has left a guild', guild)
    })
}
