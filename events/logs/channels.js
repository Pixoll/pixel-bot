const { stripIndent } = require('common-tags')
const { MessageEmbed, GuildChannel, GuildMember, Role, PermissionOverwrites } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { ms } = require('../../utils/custom-ms')
const { difference, capitalize, sliceDots, formatPerm, customEmoji, remDiscFormat, moduleStatus, fetchPartial, getLogsChannel } = require('../../utils/functions')
const { setup, modules } = require('../../utils/mongo/schemas')

/**
 * Formats the PermissionOverwrites into an array of string
 * @param {PermissionOverwrites|Readonly<Permissions>} perms The permissions to format
 * @param {boolean} [isRole] If these are role permissions
 * @returns {string[]}
 */
function format(perms, isRole) {
    if (isRole) return perms?.toArray(false).map(perm => formatPerm(perm)) || []
    return [
        perms?.deny.toArray(false).map(perm => formatPerm(perm)) || [],
        perms?.allow.toArray(false).map(perm => formatPerm(perm)) || []
    ]
}

/**
 * Compares and returns the difference between the set of permissions
 * @param {string[]} Old The old permissions
 * @param {string[]} New The new permissions
 */
function comparePerms(Old = [], New = []) {
    const arr1 = New.filter(perm => !Old.includes(perm))
    const arr2 = Old.filter(perm => !New.includes(perm))
    return [arr1, arr2]
}

/**
 * Handles all of the channel logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('channelCreate', async _channel => {
        /** @type {GuildChannel} */
        const channel = await fetchPartial(_channel)

        const { guild, id, name, type, parent } = channel
        if (!guild) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'channels')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const isCategory = !!parent ? `**>** **Category:** ${parent.name}` : ''

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor(`Created ${type} channel`, guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Name:** ${channel.toString()} ${name}
                ${isCategory}
            `)
            .setFooter(`Channel ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed).catch(() => null)
    })

    client.on('channelDelete', async _channel => {
        /** @type {GuildChannel} */
        const channel = await fetchPartial(_channel)

        const { guild, id, name, type, parent } = channel
        if (!guild) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'channels')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const isCategory = !!parent ? `**>** **Category:** ${parent.name}` : ''

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor(`Deleted ${type} channel`, guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Name:** ${name}
                ${isCategory}
            `)
            .setFooter(`Channel ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed).catch(() => null)
    })

    client.on('channelPinsUpdate', async _channel => {
        /** @type {GuildChannel} */
        const channel = await fetchPartial(_channel)

        const { guild, id, name } = channel
        if (!guild) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'channels')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated channel pins', channel.guild.iconURL({ dynamic: true }))
            .setDescription(`${channel.toString()} ${name}`)
            .setFooter(`Channel ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed).catch(() => null)
    })

    client.on('channelUpdate', async (_oldChannel, _newChannel) => {
        /** @type {GuildChannel} */
        const oldChannel = await fetchPartial(_oldChannel)
        /** @type {GuildChannel} */
        const newChannel = await fetchPartial(_newChannel)

        const { guild, id, type } = oldChannel
        if (!guild) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'channels')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor(`Updated ${type} channel`, guild.iconURL({ dynamic: true }))
            .setDescription(`${oldChannel.toString()} ${oldChannel.name}`)
            .setFooter(`Channel ID: ${id}`)
            .setTimestamp()

        const { name: name1, nsfw: nsfw1, parent: parent1, permissionOverwrites: permissions1, rateLimitPerUser: rateLimit1, topic: topic1, type: type1 } = oldChannel
        const { name: name2, nsfw: nsfw2, parent: parent2, permissionOverwrites: permissions2, rateLimitPerUser: rateLimit2, topic: topic2, type: type2 } = newChannel

        if (name1 !== name2) embed.addField('Name', `${name1} ➜ ${name2}`)
        if (nsfw1 !== nsfw2) embed.addField('NSFW', nsfw1 ? 'Yes ➜ No' : 'No ➜ Yes')
        if (parent1 !== parent2) embed.addField('Category', `${parent1?.name || 'None'} ➜ ${parent2?.name || 'None'}`)
        if (rateLimit1 !== rateLimit2) {
            const slowmo1 = rateLimit1 ? ms(rateLimit1 * 1000, { long: true }) : 'Off'
            const slowmo2 = rateLimit2 ? ms(rateLimit2 * 1000, { long: true }) : 'Off'
            embed.addField('Slowmode', `${slowmo1} ➜ ${slowmo2}`)
        }
        if (topic1 !== topic2) {
            const slice1 = sliceDots(topic1, 500)
            const slice2 = sliceDots(topic2, 500)

            embed.addField('Topic', stripIndent`
                **Before**
                ${slice1 || 'None'}
                
                **After**
                ${slice2 || 'None'}
            `)
        }
        if (type1 !== type2) embed.addField('Topic', `${capitalize(type1)} ➜ ${capitalize(type2)}`)

        var checked
        if (permissions1.size !== permissions2.size) {
            const action = permissions1.size > permissions2.size ? 'Removed' : 'Added'

            const [{ id: targetID }] = action === 'Added' ?
                difference(permissions1.toJSON(), permissions2.toJSON()) :
                difference(permissions2.toJSON(), permissions1.toJSON())

            const diff = action === 'Added' ? permissions2.get(targetID) : permissions1.get(targetID)

            /** @type {Role|GuildMember} */
            const target = guild[diff.type + 's'].cache.get(diff.id)

            const mention = target.toString()
            const name = remDiscFormat(target.name || target.user.tag)

            embed.addField(`${action} permissions`, `**>** **${capitalize(diff.type)}:** ${mention} ${name}`)

            checked = true
        }

        for (const [, perms1] of permissions1) {
            const perms2 = permissions2.get(perms1.id)
            if (perms1.deny.bitfield === perms2?.deny.bitfield && perms1.allow.bitfield === perms2?.allow.bitfield) continue
            if (checked) break

            /** @type {Role|GuildMember} */
            const target = guild[perms1.type + 's'].cache.get(perms1.id)

            const mention = target.toString()
            const name = remDiscFormat(target.name || target.user.tag)

            const [deny1, allow1] = format(perms1)
            const [deny2, allow2] = format(perms2)

            const [denied, removed1] = comparePerms(deny1, deny2)
            const [allowed, removed2] = comparePerms(allow1, allow2)

            const [neutral1] = comparePerms(denied, removed2)
            const [neutral2] = comparePerms(allowed, removed1)
            const neutral = neutral1.concat(...neutral2)

            embed.addField('Updated permissions', `**>** **${capitalize(perms1.type)}:** ${mention} ${name}\n`)
            var field = embed.fields.find(({ name }) => name === 'Updated permissions').value

            function addValue(value) {
                embed.fields.find(({ name }) => name === 'Updated permissions').value = field + value
                field = embed.fields.find(({ name }) => name === 'Updated permissions').value
            }

            if (denied.length !== 0) addValue(`${customEmoji('cross', false)} **Denied:** ${denied.join(', ')}\n`)
            if (allowed.length !== 0) addValue(`${customEmoji('check', false)} **Allowed:** ${allowed.join(', ')}\n`)
            if (neutral.length !== 0) addValue(`${customEmoji('neutral', false)} **Neutral:** ${neutral.join(', ')}`)

            checked = true
        }

        if (embed.fields.length > 0) logsChannel.send(embed).catch(() => null)
    })
}