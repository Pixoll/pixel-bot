const { oneLine } = require('common-tags')
const { MessageEmbed, ColorResolvable } = require('discord.js')
const { CommandoClient, CommandoGuild } = require('../../command-handler/typings')

/**
 * Handles all of the owner logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    /**
     * sends info of a guild
     * @param {ColorResolvable} color the color of the embed
     * @param {string} message the message to send
     * @param {CommandoGuild} guild the guild to get info of
     */
    async function guildInfo(color, message, guild) {
        const { ownerId, name, id } = guild
        const owner = await guild.fetchOwner()

        const info = new MessageEmbed()
            .setColor(color)
            .setAuthor(message, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true, size: 2048 }))
            .setDescription(oneLine`
                **${name}** is owned by ${owner.user || owner ?
                    `${owner.toString()} ${owner.user?.tag || ''}`
                    : ownerId
                }
            `)
            .setFooter(`Guild id: ${id} | Owner id: ${ownerId}`)
            .setTimestamp()

        await client.owners[0].send({ embeds: [info] })
    }

    client.on('guildCreate', async guild => {
        await guildInfo('GREEN', 'The bot has joined a new guild', guild)
        client.emit('debug', 'The bot has joined', guild.name)
    })

    client.on('guildDelete', async guild => {
        await guildInfo('RED', 'The bot has left a guild', guild)
        client.emit('debug', 'The bot has left', guild.name)
    })

    client.on('guildUnavailable', async guild => {
        await guildInfo('GOLD', 'A guild has become unavailable', guild)
        client.emit('debug', 'The guild', guild.name, 'has become unavailable')
    })
}