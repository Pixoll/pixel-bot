/* eslint-disable no-unused-vars */
const { oneLine, stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, timestamp } = require('../../utils/functions')
const myMs = require('../../utils/my-ms')
/* eslint-enable no-unused-vars */

/**
 * Parses a channel type
 * @param {string} type The type to parse
 * @returns {string}
 */
function channelType(type) {
    switch (type) {
        case 'GUILD_TEXT': return 'text'
        case 'GUILD_NEWS': return 'news'
        case 'GUILD_NEWS_THREAD': return 'news thread'
        case 'GUILD_PUBLIC_THREAD': return 'public thread'
        case 'GUILD_PRIVATE_THREAD': return 'private thread'
    }
}

/**
 * Handles all of the thread logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('threadCreate', async thread => {
        const { guild, type, parent, id, autoArchiveDuration } = thread
        await thread.join().catch(() => null)

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'threads')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/threads#create".')

        const { guildMember } = await thread.fetchOwner()
        const chanType = channelType(type)

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor({
                name: `Created ${chanType} channel`, iconURL: guild.iconURL({ dynamic: true })
            })
            .setDescription(stripIndent`
                ${oneLine`
                    ${guildMember.toString()} created ${chanType} ${thread.toString()}
                    under ${channelType(parent.type)} channel ${parent.toString()}
                `}
                **Auto-archiving ${timestamp(Date.now() + (autoArchiveDuration * 60_000), 'R')}**
            `)
            .setFooter({ text: `Thread ID: ${id} • Channel ID: ${parent.id}` })
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('threadDelete', async thread => {
        const { guild, type, parent, id, name, members } = thread

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'threads')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/threads#delete".')

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor({
                name: `Deleted ${channelType(type)} channel`, iconURL: guild.iconURL({ dynamic: true })
            })
            .setDescription(stripIndent`
                \`#${name}\` under ${channelType(parent.type)} channel ${parent.toString()}
                **Member count:** ${members.cache.size}
            `)
            .setFooter({ text: `Thread ID: ${id} • Channel ID: ${parent.id}` })
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('threadUpdate', async (oldThread, newThread) => {
        const { guild } = newThread

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'threads')
        if (!isEnabled) return

        client.emit('debug', 'Running event "logs/threads#update".')

        const {
            autoArchiveDuration: autoArchive1, archived: archived1, name: name1, locked: locked1,
            rateLimitPerUser: rateLimit1
        } = oldThread
        const {
            autoArchiveDuration: autoArchive2, archived: archived2, name: name2, locked: locked2,
            rateLimitPerUser: rateLimit2, id, parentId, type
        } = newThread

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor({
                name: `Updated ${channelType(type)} channel`, iconURL: guild.iconURL({ dynamic: true })
            })
            .setDescription(newThread.toString())
            .setFooter({ text: `Thread ID: ${id} • Channel ID: ${parentId}` })
            .setTimestamp()

        if (autoArchive1 !== autoArchive2) {
            const archiveIn1 = myMs(autoArchive1 * 60_000, { long: true })
            const archiveIn2 = myMs(autoArchive2 * 60_000, { long: true })

            embed.addField('Archive after inactivity', `${archiveIn1} ➜ ${archiveIn2}`)
        }

        if (archived1 !== archived2) embed.addField('Archived', archived1 ? 'Yes ➜ No' : 'No ➜ Yes')

        if (name1 !== name2) embed.addField('Name', `${name1} ➜ ${name2}`)

        if (locked1 !== locked2) embed.addField('Anyone can unarchive', locked2 ? 'Yes ➜ No' : 'No ➜ Yes')

        if (rateLimit1 !== rateLimit2) {
            const slowmo1 = rateLimit1 ? myMs(rateLimit1 * 1000, { long: true }) : 'Off'
            const slowmo2 = rateLimit2 ? myMs(rateLimit2 * 1000, { long: true }) : 'Off'
            embed.addField('Slowmode', `${slowmo1} ➜ ${slowmo2}`)
        }

        if (embed.fields.length !== 0) guild.queuedLogs.push(embed)
    })
}
