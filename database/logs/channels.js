/* eslint-disable no-unused-vars */
const { stripIndent, oneLine } = require('common-tags')
const { MessageEmbed, GuildMember, Role, PermissionOverwrites } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const {
    capitalize, sliceDots, customEmoji, remDiscFormat, isModuleEnabled, compareArrays, sliceFileName
} = require('../../utils/functions')
const { channelTypes, rtcRegions } = require('../../utils/constants')
const ms = require('../../utils/ms')
const { permissions } = require('../../command-handler/util')
/* eslint-enable no-unused-vars */

/**
 * Formats the {@link PermissionOverwrites} into an array of string
 * @param {PermissionOverwrites} perms The permissions to format
 * @returns {string[][]}
 */
function format(perms) {
    return [
        perms?.deny.toArray(false).map(perm => permissions[perm.toString()]) || [],
        perms?.allow.toArray(false).map(perm => permissions[perm.toString()]) || []
    ]
}

/**
 * Handles all of the channel logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('channelCreate', async channel => {
        const { guild, id, type, parent } = channel

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'channels')
        if (!isEnabled) return

        client.emit('debug', `Running event "${sliceFileName(__filename)}#channelCreate".`)

        const category = parent ? `under the category \`${parent.name}\`` : ''

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor(`Created ${channelTypes[type].toLowerCase()} channel`, guild.iconURL({ dynamic: true }))
            .setDescription(`${channel.toString()} ${category}`)
            .setFooter(`Channel id: ${id}`)
            .setTimestamp()

        const perms = []
        for (const [, perm] of channel.permissionOverwrites.cache) {
            /** @type {GuildMember|Role} */
            const target = await guild[perm.type + 's'].fetch(perm.id).catch(() => null)
            const [deny, allow] = format(perm)
            if (deny.length === 0 && allow.length === 0) continue

            let base = oneLine`
                **${capitalize(perm.type)}:** ${target.toString()}
                ${target instanceof GuildMember ? target.user.tag : ''}
            `

            if (deny.length !== 0) base += `\n${customEmoji('cross')} **Denied:** ${deny.join(', ')}`
            if (allow.length !== 0) base += `\n${customEmoji('check')} **Allowed:** ${allow.join(', ')}`

            perms.push(base)
        }

        if (perms.length !== 0) {
            embed.addField('Permissions', perms.shift())
            for (const perm of perms) embed.addField('\u2800', perm)
        }

        guild.queuedLogs.push(embed)
    })

    client.on('channelDelete', async channel => {
        if (channel.type === 'DM') return
        const { guild, id, name, type, parent } = channel

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'channels')
        if (!isEnabled) return

        client.emit('debug', `Running event "${sliceFileName(__filename)}#channelDelete".`)

        const category = parent ? `under the category \`${parent.name}\`` : ''

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor(`Deleted ${channelTypes[type].toLowerCase()} channel`, guild.iconURL({ dynamic: true }))
            .setDescription(`\`#${name}\` ${category}`)
            .setFooter(`Channel id: ${id}`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('channelPinsUpdate', async channel => {
        if (channel.type === 'DM') return
        const { guild, id } = channel

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'channels')
        if (!isEnabled) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated channel pins', channel.guild.iconURL({ dynamic: true }))
            .setDescription(`Pinned or unpinned a message in ${channel.toString()}`)
            .setFooter(`Channel id: ${id}`)
            .setTimestamp()

        guild.queuedLogs.push(embed)
    })

    client.on('channelUpdate', async (oldChannel, newChannel) => {
        if (oldChannel.type === 'DM') return
        if (newChannel.type === 'DM') return
        const { guild } = oldChannel

        const isEnabled = await isModuleEnabled(guild, 'audit-logs', 'channels')
        if (!isEnabled) return

        client.emit('debug', `Running event "${sliceFileName(__filename)}#channelUpdate".`)

        const { name: name1, parent: parent1, permissionOverwrites: permissions1, type: type1, id } = oldChannel
        const { name: name2, parent: parent2, permissionOverwrites: permissions2, type: type2 } = newChannel

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor(`Updated ${channelTypes[type1].toLowerCase()} channel`, guild.iconURL({ dynamic: true }))
            .setDescription(oldChannel.toString())
            .setFooter(`Channel id: ${id}`)
            .setTimestamp()

        if (name1 !== name2) embed.addField('Name', `${name1} ➜ ${name2}`)
        if (parent1 !== parent2) embed.addField('Category', `${parent1?.name || 'None'} ➜ ${parent2?.name || 'None'}`)

        const cache1 = permissions1.cache
        const cache2 = permissions2.cache
        let checked
        if (cache1.size !== cache2.size) {
            const action = cache1.size > cache2.size ? 'Removed' : 'Added'

            const diff = cache1.difference(cache2).first()

            /** @type {Role|GuildMember} */
            const target = await guild[diff.type + 's'].fetch(diff.id)
            if (target) {
                const mention = target.toString()
                const name = remDiscFormat(target.user?.tag || target.name)

                embed.addField(`${action} permissions`, `**${capitalize(diff.type)}:** ${mention} ${name}`)
            }

            checked = true
        }

        for (const [, perms1] of cache1) {
            const perms2 = cache2.get(perms1.id)
            if (perms1.deny.bitfield === perms2?.deny.bitfield && perms1.allow.bitfield === perms2?.allow.bitfield) continue
            if (checked) break

            /** @type {Role|GuildMember} */
            const target = guild[perms1.type + 's'].cache.get(perms1.id)

            const mention = target.toString()
            const name = remDiscFormat(target.user?.tag)

            const [deny1, allow1] = format(perms1)
            const [deny2, allow2] = format(perms2)

            const [denied, removed1] = compareArrays(deny1, deny2)
            const [allowed, removed2] = compareArrays(allow1, allow2)

            const [neutral1] = compareArrays(denied, removed2)
            const [neutral2] = compareArrays(allowed, removed1)
            const neutral = [...neutral1, ...neutral2]

            embed.addField('Updated permissions', `**${capitalize(perms1.type)}:** ${mention} ${name}\n`)
            let field = embed.fields.find(f => f.name === 'Updated permissions').value

            function addValue(value) {
                embed.fields.find(f => f.name === 'Updated permissions').value = field + value
                field = embed.fields.find(f => f.name === 'Updated permissions').value
            }

            if (denied.length !== 0) addValue(`${customEmoji('cross')} **Denied:** ${denied.join(', ')}\n`)
            if (allowed.length !== 0) addValue(`${customEmoji('check')} **Allowed:** ${allowed.join(', ')}\n`)
            if (neutral.length !== 0) addValue(`${customEmoji('neutral')} **Neutral:** ${neutral.join(', ')}`)

            checked = true
        }

        if (oldChannel.isText() && newChannel.isText()) {
            const { nsfw: nsfw1, topic: topic1, defaultAutoArchiveDuration: autoArchive1 } = oldChannel
            const { nsfw: nsfw2, topic: topic2, defaultAutoArchiveDuration: autoArchive2 } = newChannel

            if (type1 !== type2) embed.addField('Type', `${channelTypes[type1]} ➜ ${channelTypes[type2]}`)
            if (nsfw1 !== nsfw2) embed.addField('NSFW', nsfw1 ? 'Yes ➜ No' : 'No ➜ Yes')
            if (topic1 !== topic2) {
                const slice1 = sliceDots(topic1, 500) || 'None'
                const slice2 = sliceDots(topic2, 500) || 'None'

                embed.addField('Topic', stripIndent`
                    **Before**\n${slice1}
                    ——————————————
                    **After**\n${slice2}
                `)
            }
            if (autoArchive1 !== autoArchive2) {
                const str1 = typeof autoArchive1 === 'number' ?
                    ms(autoArchive1 * ms('1m'), { long: true }) :
                    capitalize(autoArchive1)
                const str2 = typeof autoArchive2 === 'number' ?
                    ms(autoArchive2 * ms('1m'), { long: true }) :
                    capitalize(autoArchive2)
                embed.addField('Archive after innactivity', `${str1} ➜ ${str2}`)
            }

            if (type1 === 'GUILD_TEXT' && type2 === 'GUILD_TEXT') {
                const rate1 = oldChannel.rateLimitPerUser
                const rate2 = newChannel.rateLimitPerUser
                if (rate1 !== rate2) {
                    const slowmo1 = rate1 ? ms(rate1 * 1000, { long: true }) : 'Off'
                    const slowmo2 = rate2 ? ms(rate2 * 1000, { long: true }) : 'Off'
                    embed.addField('Slowmode', `${slowmo1} ➜ ${slowmo2}`)
                }
            }

            if (embed.fields.length !== 0) return guild.queuedLogs.push(embed)
        }

        if (oldChannel.isVoice() && newChannel.isVoice()) {
            const { bitrate: bitrate1, rtcRegion: region1, userLimit: limit1 } = oldChannel
            const { bitrate: bitrate2, rtcRegion: region2, userLimit: limit2 } = newChannel

            if (bitrate1 !== bitrate2) {
                embed.addField('Bitrate', bitrate1 / 1000 + 'kbps ➜ ' + bitrate2 / 1000 + 'kbps')
            }
            if (region1 !== region2) {
                embed.addField('Region override', `${rtcRegions.get(region1)} ➜ ${rtcRegions.get(region2)}`)
            }
            if (limit1 !== limit2) {
                const limitStr1 = limit1 ? `${limit1} users` : 'No limit'
                const limitStr2 = limit2 ? `${limit2} users` : 'No limit'
                embed.addField('User limit', `${limitStr1} ➜ ${limitStr2}`)
            }

            if (embed.fields.length !== 0) return guild.queuedLogs.push(embed)
        }

        if (embed.fields.length !== 0) guild.queuedLogs.push(embed)
    })
}