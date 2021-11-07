const { oneLine } = require('common-tags')
const { MessageEmbed, ColorResolvable, TextChannel, TextBasedChannels } = require('discord.js')
const { CommandoClient, CommandoGuild } = require('../../command-handler/typings')
const { embedColor, customEmoji } = require('../../utils')

/**
 * Handles all of the owner logs.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    /** @type {TextChannel} */
    const channel = await client.channels.fetch('906565308381286470')

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

        const last = channel.lastMessage?.embeds[0] ?? new MessageEmbed()
        const equalsLast = info.equals(last)
        if (equalsLast) return

        await channel.send({ embeds: [info] })
    }

    client.on('guildCreate', async guild => {
        client.emit('debug', 'The bot has joined', guild.name)
        await guildInfo('GREEN', 'The bot has joined a new guild', guild)

        const { channels, id, ownerId } = guild
        const owner = await client.users.fetch(ownerId)

        /** @type {TextBasedChannels} */
        const channel = channels.cache.sort((a, b) => a.rawPosition - b.rawPosition)
            .filter(ch => {
                if (ch.type !== 'GUILD_TEXT') return false
                const eveyonePerms = ch.permissionOverwrites.resolve(id)?.allow
                if (!eveyonePerms) return false
                const hasPerms = eveyonePerms.bitfield === 0n || eveyonePerms.has(['SEND_MESSAGES', 'VIEW_CHANNEL'])
                return hasPerms
            }).first() || await owner.createDM()

        const topgg = 'https://top.gg/bot/802267523058761759'
        const { user, owners, prefix, options } = client

        const embed = new MessageEmbed()
            .setColor(embedColor)
            .setTitle(`Thanks for adding ${user.username}!`)
            .setDescription('Here\'s some useful information about the bot.')
            .addField(`${customEmoji('info')} Using commands`, oneLine`
                To use commands just run \`${prefix}<command>\`! You can also mention the bot, like this:
                \`@${user.tag} <command>\`. For a list of all commands or general information, run \`${prefix}help\`.
            `)
            .addField('⚙ Setting up the bot', oneLine`
                To setup the bot just run \`${prefix}setup full\`, this will setup every core setting
                for all modules of the bot. If you want to setup an specific module, just run \`${prefix}setup [module]\`,
                you can see the full list using \`${prefix}help setup\`.
            `)
            .addField('🕒 Note about times and dates', oneLine`
                The bot runs based off **London's time zone (UTC±0).** This means that when you used time-based commands,
                like \`timestamp\`, \`reminder\` or \`time\`, all of the times you specify will be based on London's time.
                For more information about the time system, please check **page 4** of the \`help\` command.
            `)
            .addField('🔗 Useful links', oneLine`
                [Top.gg page](${topgg}) -
                [Support server](${options.serverInvite}) -
                [Invite the bot](${topgg}/invite) -
                [Vote here](${topgg}/vote)
            `)
            .setFooter(`Created with ❤️ by ${owners[0].tag}`, owners[0].displayAvatarURL({ dynamic: true }))

        await channel.send({ embeds: [embed] })
    })

    client.on('guildDelete', async guild => {
        client.emit('debug', 'The bot has left', guild.name)
        await guildInfo('RED', 'The bot has left a guild', guild)
    })

    client.on('guildUnavailable', async guild => {
        client.emit('debug', 'The guild', guild.name, 'has become unavailable')
        await guildInfo('GOLD', 'A guild has become unavailable', guild)
    })
}