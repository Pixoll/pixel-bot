const { stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { CommandoClient, CommandoGuild } = require('discord.js-commando')

/**
 * This function handles all of the main bot logs.
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
        const info = new MessageEmbed()
            .setColor(color.toUpperCase())
            .setAuthor(message, guild.iconURL({ dynamic: true }))
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                **>** **Name:** ${guild.name}
                **>** **Owner:** ${guild.owner.user.toString()} ${guild.owner.user.tag}
                **>** **Owner ID:** ${guild.owner.user.id}
            `)
            .setFooter(`Guild ID: ${guild.id}`)
            .setTimestamp()

        await client.owners[0].send(info)
    }

    client.on('guildCreate', async guild => {
        await guildInfo('green', 'The bot has joined a new guild', guild)
        console.log('The bot has joined', guild.name)
    })

    client.on('guildDelete', async guild => {
        await guildInfo('red', 'The bot has left a guild', guild)
        console.log('The bot has left', guild.name)
    })

    client.on('guildUnavailable', async guild => {
        await guildInfo('gold', 'A guild has become unavailable', guild)
        console.log('The guild', guild.name, 'has become unavailable')
    })

    client.on('invalidated', () => {
        console.log('The client\'s session has become invalidated')
    })
}