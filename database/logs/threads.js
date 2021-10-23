const { oneLine, stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, getLogsChannel, channelTypes, timestamp, myMs } = require('../../utils')

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

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

        const { guildMember } = await thread.fetchOwner()
        const chanType = channelTypes[type].toLowerCase()
        const parentType = channelTypes[parent.type].toLowerCase()

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor(`Created ${chanType} channel`, guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                ${oneLine`
                    ${guildMember.toString()} created ${chanType} ${thread.toString()}
                    under ${parentType} channel ${parent.toString()}
                `}
                **Auto-archiving ${timestamp(Date.now() + (autoArchiveDuration * myMs('1m')), 'R')}**
            `)
            .setFooter(`Thread id: ${id} | Channel id: ${parent.id}`)
            .setTimestamp()

        await logsChannel.send({ embeds: [embed] }).catch(() => null)
    })

    client.on('threadDelete', async thread => {
        const { guild, type, parent, id, name, members } = thread

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'threads')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

        const chanType = channelTypes[type].toLowerCase()
        const parentType = channelTypes[parent.type].toLowerCase()

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor(`Deleted ${chanType} channel`, guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                \`#${name}\` under ${parentType} channel ${parent.toString()}
                **Member count:** ${members.cache.size}
            `)
            .setFooter(`Thread id: ${id} | Channel id: ${parent.id}`)
            .setTimestamp()

        await logsChannel.send({ embeds: [embed] }).catch(() => null)
    })

    client.on('threadUpdate', async (oldThread, newThread) => {
        const { guild } = newThread

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'threads')
        if (!isEnabled) return

        const logsChannel = await getLogsChannel(guild)
        if (!logsChannel) return

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
            .setAuthor(`Updated ${channelTypes[type].toLowerCase()} channel`, guild.iconURL({ dynamic: true }))
            .setDescription(newThread.toString())
            .setFooter(`Thread id: ${id} | Channel id: ${parentId}`)
            .setTimestamp()

        if (autoArchive1 !== autoArchive2) {
            const archiveIn1 = myMs(autoArchive1 * myMs('1m'), { long: true })
            const archiveIn2 = myMs(autoArchive2 * myMs('1m'), { long: true })

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

        if (embed.fields.length !== 0) {
            await logsChannel.send({ embeds: [embed] }).catch(() => null)
        }
    })
}