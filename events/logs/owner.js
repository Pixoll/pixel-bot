const { MessageEmbed } = require('discord.js')
const { CommandoClient, CommandoGuild } = require('../../command-handler/typings')

/**
 * Handles all of the owner logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    /**
     * sends info of a guild
     * @param {string} color the color of the embed
     * @param {string} message the message to send
     * @param {CommandoGuild} guild the guild to get info of
     */
    async function guildInfo(color, message, guild) {
        const guildOwner = await guild.fetchOwner()

        const info = new MessageEmbed()
            .setColor(color.toUpperCase())
            .setAuthor(message, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .setDescription(`**${guild.name}** is owned by ${guildOwner.user.toString()} ${guildOwner.user.tag}`)
            .setFooter(`Guild id: ${guild.id} | Owner id: ${guildOwner.id}`)
            .setTimestamp()

        await client.owners[0].send({ embeds: [info] })
    }

    client.on('guildCreate', async guild => {
        await guildInfo('green', 'The bot has joined a new guild', guild)
        client.emit('debug', 'The bot has joined', guild.name)
    })

    client.on('guildDelete', async guild => {
        await guildInfo('red', 'The bot has left a guild', guild)
        client.emit('debug', 'The bot has left', guild.name)
    })

    client.on('guildUnavailable', async guild => {
        await guildInfo('gold', 'A guild has become unavailable', guild)
        client.emit('debug', 'The guild', guild.name, 'has become unavailable')
    })

    client.on('invalidated', () => {
        client.emit('debug', 'The client\'s session has become invalidated, restarting the bot...')
        process.exit()
    })

    client.emit('debug', 'Loaded audit-logs/owner')
}