/* eslint-disable no-unused-vars */
const { oneLine, stripIndent } = require('common-tags')
const { MessageEmbed, ColorResolvable, TextChannel, TextBasedChannels, User, Util } = require('discord.js')
const { CommandoClient, CommandoGuild } = require('../../command-handler/typings')
const { embedColor, customEmoji } = require('../../utils')
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
        /** @type {TextChannel} */
        const channel = await client.channels.fetch('906565308381286470')

        const { ownerId, name, id, memberCount } = guild
        /** @type {User} */
        const owner = await client.users.fetch(ownerId).catch(() => null)
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
            .setFooter(`Guild id: ${id} | Owner id: ${ownerId}`)
            .setTimestamp()

        await channel.send({ embeds: [info] })
    }

    client.on('guildCreate', async guild => {
        client.emit('debug', `The bot has joined "${guild.name}"`)
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
                To use a command type \`${prefix}<command>\`, \`/<command>\` or \`@${user.tag} <command>\`!
                For a list of all commands or general information, run \`/help\`.
            `)
            .addField('⚙ Setting up the bot', stripIndent`
                ${oneLine`
                    To setup the bot just run \`/setup\`, this will setup every core setting for all modules of
                    the bot. If you want to setup an specific module, just run \`/setup [module]\`, you can see
                    the full list using \`/help setup\`.
                `}
                ${oneLine`
                    Afterwards, make sure to run \`/module toggle\` to toggle the modules/sub-modules you want to use
                    in this server.
                `}
            `)
            .addField('🕒 Note about times and dates', oneLine`
                The bot runs based off the **Coordinated Universal Time (UTC).** This means that when you used
                time-based commands, like \`timestamp\`, \`reminder\` or \`time\`, all of the times you specify
                will be based on UTC's time. For more information about the time system, please check **page 4**
                of the \`help\` command.
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
        client.emit('debug', `The bot has left "${guild.name}"`)
        await guildInfo('RED', 'The bot has left a guild', guild)
    })
}