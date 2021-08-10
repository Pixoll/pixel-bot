const { stripIndent } = require('common-tags')
const { MessageEmbed, GuildChannel, GuildMember, Role, TextChannel, PermissionOverwrites, Invite, Message, User } = require('discord.js')
const { CommandoClient, CommandoMessage, CommandoGuild } = require('discord.js-commando')
const { ms } = require('./custom-ms')
const { difference, capitalize, arrayEqualsIgnoreOrder, formatDate, ban, sliceDots, formatPerm, customEmoji, remDiscFormat, moduleStatus, pluralize, getKeyPerms, validURL, fetchPartial } = require('./functions')
const { roles: rolesDocs, setup, modules } = require('./mongodb-schemas')

/**
 * Gets the audit-logs channel
 * @param {*} db The database to look into
 * @param {CommandoGuild} guild The guild to look into
 */
async function getChannel(db, guild) {
    const data = await db.findOne({ guild: guild.id })
    /** @type {TextChannel} */
    const channel = guild.channels.cache.get(data?.logsChannel)
    return channel
}

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
 * Returns a clickable link to the image. `None` if the link is invald
 * @param {string} link The link of the image
 * @param {boolean} [old] If it's the old image
 */
function imageLink(link, old) {
    if (link) {
        if (old) return 'See thumbnail'
        return `[Click here](${link})`
    }
    return 'None'
}

/**
 * Fixes the size of the attachment, putting it on it's most compact version
 * @param {number} size The size of the attachment to fix
 */
function fixSize(size) {
    var i = 0
    while (size > 1024) {
        size /= 1024
        i++
    }

    const _size = size % 1 ? size.toFixed(2) : size

    if (i === 0) return _size + 'B'
    if (i === 1) return _size + 'KB'
    if (i === 2) return _size + 'MB'
}

/**
 * This function handles all of the audit logs for the servers.
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

        const logsChannel = await getChannel(setup, guild)
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

        logsChannel.send(embed)
    })

    client.on('channelDelete', async _channel => {
        /** @type {GuildChannel} */
        const channel = await fetchPartial(_channel)

        const { guild, id, name, type, parent } = channel
        if (!guild) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'channels')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
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

        logsChannel.send(embed)
    })

    client.on('channelPinsUpdate', async _channel => {
        /** @type {GuildChannel} */
        const channel = await fetchPartial(_channel)

        const { guild, id, name } = channel
        if (!guild) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'channels')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated channel pins', channel.guild.iconURL({ dynamic: true }))
            .setDescription(`${channel.toString()} ${name}`)
            .setFooter(`Channel ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)
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

        const logsChannel = await getChannel(setup, guild)
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
        }

        var checked
        for (const [, perms1] of permissions1) {
            const perms2 = permissions2.get(perms1.id)
            if (perms1.deny.bitfield === perms2?.deny.bitfield && perms1.allow.bitfield === perms2?.allow.bitfield) continue
            if (checked) continue

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

        if (embed.fields.length > 0) logsChannel.send(embed)
    })

    client.on('emojiCreate', async emoji => {
        const { guild, name, id, url } = emoji

        const status = await moduleStatus(modules, guild, 'auditLogs', 'emojis')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const author = await emoji.fetchAuthor()

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor('Created emoji', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Name:** ${name}
                **>** **Author:** ${author.toString()} ${author.tag}
            `)
            .setThumbnail(url)
            .setFooter(`Emoji ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('emojiDelete', async emoji => {
        const { guild, name, id, author, url } = emoji

        const status = await moduleStatus(modules, guild, 'auditLogs', 'emojis')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted emoji', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Name:** ${name}
                **>** **Author:** ${author.toString()} ${author.tag}
            `)
            .setThumbnail(url)
            .setFooter(`Emoji ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
        const { guild, id, url } = oldEmoji

        const status = await moduleStatus(modules, guild, 'auditLogs', 'emojis')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated emoji', guild.iconURL({ dynamic: true }))
            .setDescription('Name', `${oldEmoji.name} ➜ ${newEmoji.name}`)
            .setThumbnail(url)
            .setFooter(`Emoji ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('guildBanAdd', async (guild, _user) => {
        if (!guild.available) return

        /** @type {User} */
        const user = await fetchPartial(_user)

        const status = await moduleStatus(modules, guild, 'auditLogs', 'members')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const banLogs = await guild.fetchAuditLogs({ limit: 1 })
        const banLog = banLogs.entries.first()
        if (!banLog || banLog.action !== 'MEMBER_BAN_ADD') return

        const { executor, reason } = banLog

        const embed = new MessageEmbed()
            .setColor('RED')
            .setAuthor('Banned user', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                **>** **User:** ${user.toString()} ${user.tag}
                **>** **Moderator:** ${executor.toString()} ${executor.tag}
                **>** **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setImage('https://media.giphy.com/media/fe4dDMD2cAU5RfEaCU/giphy.gif')
            .setFooter(`User ID: ${user.id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('guildBanRemove', async (guild, _user) => {
        /** @type {User} */
        const user = await fetchPartial(_user)

        const status = await moduleStatus(modules, guild, 'auditLogs', 'members')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const unbanLogs = await guild.fetchAuditLogs({ limit: 1 })
        const unbanLog = unbanLogs.entries.first()
        if (!unbanLog || unbanLog.action !== 'MEMBER_BAN_REMOVE') return

        const { executor, reason } = banLog

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Unbanned user', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(stripIndent`
                **>** **User:** ${user.toString()} ${user.tag}
                **>** **Moderator:** ${executor.toString()} ${executor.tag}
                **>** **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
            `)
            .setFooter(`User ID: ${user.id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('guildMemberAdd', async _member => {
        /** @type {GuildMember} */
        const member = await fetchPartial(_member)

        const { guild, user, roles } = member

        const status = await moduleStatus(modules, guild, 'auditLogs', 'members')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const { tag, createdTimestamp, id } = user
        const age = ms(Date.now() - createdTimestamp, { long: true, length: 2, showAnd: true })

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor('User joined', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(`${user.toString()} ${tag}`)
            .addField('Account age', age)
            .setFooter(`User ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)

        if (Date.now() - createdTimestamp < ms('3d')) {
            const autoMod = await moduleStatus(modules, guild, 'auditLogs', 'autoMod')
            if (!autoMod) return

            return await ban(guild, client, user, 'Account is too young, possible raid threat.')
        }

        const data = await setup.findOne({ guild: guild.id })

        if (data?.memberRole && !user.bot) roles.add(data.memberRole)
        if (data?.botRole && user.bot) roles.add(data.botRole)

        const rolesData = await rolesDocs.findOne({ guild: guild.id, user: id })
        if (!rolesData) return

        for (const role of rolesData.roles) roles.add(role)
    })

    client.on('guildMemberRemove', async _member => {
        /** @type {GuildMember} */
        const member = await fetchPartial(_member)

        const { guild, user, roles, id } = member
        if (!guild.available || id === client.user.id) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'members')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const { tag } = user

        const rolesList = roles.cache.filter(({ id }) => id !== guild.id).map(r => r).sort((a, b) => b.position - a.position).join(' ')

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('User left', user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription(`${user.toString()} ${tag}`)
            .addField('Roles', rolesList || 'None')
            .setFooter(`User ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)

        const kickLogs = await guild.fetchAuditLogs({ limit: 1 })
        const kickLog = kickLogs.entries.first()

        if (kickLog && kickLog.action === 'MEMBER_KICK') {
            const { executor, reason } = kickLog

            const kick = new MessageEmbed()
                .setColor('ORANGE')
                .setAuthor('Kicked user', user.displayAvatarURL({ dynamic: true }))
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setDescription(stripIndent`
                    **>** **User:** ${user.toString()} ${user.tag}
                    **>** **Moderator:** ${executor.toString()} ${executor.tag}
                    **>** **Reason:** ${reason?.replace(/%20/g, ' ') || 'No reason given.'}
                `)
                .setFooter(`User ID: ${id}`)
                .setTimestamp()

            logsChannel.send(kick)
        }

        const data = await setup.findOne({ guild: guild.id })
        const rolesData = await rolesDocs.findOne({ guild: guild.id, user: id })

        const rolesArray = roles.cache.map(({ id }) => id).filter(id =>
            id !== guild.id && ![data?.memberRole, data?.botRole].includes(id)
        )

        const doc = {
            guild: guild.id,
            user: id,
            roles: rolesArray
        }

        if (!rolesData) await new rolesDocs(doc).save()
        else await rolesData.updateOne({ roles: rolesArray })
    })

    client.on('guildMemberUpdate', async (_oldMember, _newMember) => {
        /** @type {GuildMember} */
        const oldMember = await fetchPartial(_oldMember)
        /** @type {GuildMember} */
        const newMember = await fetchPartial(_newMember)

        const { guild, user, id } = oldMember
        if (!guild.available) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'members')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const { roles: roles1, nickname: nick1 } = oldMember
        const { roles: roles2, nickname: nick2 } = newMember

        const role = roles1.cache.difference(roles2.cache).first()

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated member', user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${user.toString()} ${user.tag}`)
            .setFooter(`User ID: ${id}`)
            .setTimestamp()

        if (nick1 !== nick2) embed.addField('Nickname', `${nick1 || 'None'} ➜ ${nick2 || 'None'}`)

        if (role) {
            const action = roles2.cache.has(role.id) ? 'Added' : 'Removed'
            embed.addField(`${action} role`, `${role.toString()} ${role.name}`)
        }

        if (embed.fields.length !== 0) logsChannel.send(embed)
    })

    client.on('guildUpdate', async (oldGuild, newGuild) => {
        const status = await moduleStatus(modules, oldGuild, 'auditLogs', 'server')
        if (!status) return

        const logsChannel = await getChannel(setup, oldGuild)
        if (!logsChannel) return

        const { name: name1, region: region1, systemChannel: sysChan1, afkChannel: afkChan1, afkTimeout: afkTO1,
            defaultMessageNotifications: notif1, banner: banner1, description: desc1, splash: splash1, vanityURLCode: url1,
            owner: owner1, features: features1, icon: icon1, verificationLevel: verLVL1, explicitContentFilter: expFilter1,
            mfaLevel: mfa1, widgetChannel: widgetChan1, widgetEnabled: widgetOn1, discoverySplash: discSplash1,
            publicUpdatesChannel: updateChan1, rulesChannel: rulesChan1, preferredLocale: language1, id
        } = oldGuild
        const { name: name2, region: region2, systemChannel: sysChan2, afkChannel: afkChan2, afkTimeout: afkTO2,
            defaultMessageNotifications: notif2, banner: banner2, description: desc2, splash: splash2, vanityURLCode: url2,
            owner: owner2, features: features2, icon: icon2, verificationLevel: verLVL2, explicitContentFilter: expFilter2,
            mfaLevel: mfa2, widgetChannel: widgetChan2, widgetEnabled: widgetOn2, discoverySplash: discSplash2,
            publicUpdatesChannel: updateChan2, rulesChannel: rulesChan2, preferredLocale: language2
        } = newGuild

        const imgOptions = { dynamic: true, size: 1024 }

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated server', oldGuild.iconURL(imgOptions))
            .setFooter(`Server ID: ${id}`)
            .setTimestamp()

        const imagesEmbed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated server', oldGuild.iconURL(imgOptions))
            .setFooter(`Server ID: ${id}`)
            .setTimestamp()

        // Overview
        if (name1 !== name2) embed.addField('Name', `${name1} ➜ ${name2}`)

        if (desc1 !== desc2) embed.addField('Description', stripIndent`
            **Before**
            ${desc1 || 'None'}
            
            **After**
            ${desc2 || 'None'}
        `)

        if (icon1 !== icon2) {
            imagesEmbed.addField('Icon', stripIndent`
                **>** **Before:** ${imageLink(oldGuild.iconURL(imgOptions), true)}
                **>** **After:** ${imageLink(newGuild.iconURL(imgOptions))}
            `).setThumbnail(oldGuild.iconURL(imgOptions))

            logsChannel.send(imagesEmbed)
        }

        if (owner1 !== owner2) embed.addField('Owner', `${owner1.toString()} ➜ ${owner2.toString()}`)

        if (region1 !== region2) embed.addField('Region', `${capitalize(region1)} ➜ ${capitalize(region2)}`)

        if (sysChan1 !== sysChan2) embed.addField('System channel', `${sysChan1?.toString() || 'None'} ➜ ${sysChan2?.toString() || 'None'}`)

        if (afkChan1 !== afkChan2) embed.addField('AFK channel', `${afkChan1?.toString() || 'None'} ➜ ${afkChan2?.toString() || 'None'}`)

        if (afkTO1 !== afkTO2) embed.addField('AFK timeout', `${afkTO1 / 60} minutes ➜ ${afkTO2 / 60} minutes`)

        if (notif1 !== notif2) embed.addField('Default notification settings', notif1 === 'ALL' ? 'All messages ➜ Mentions only' : 'Mentions only ➜ All messages')

        if (banner1 !== banner2) {
            imagesEmbed.spliceFields(0, 1, [{
                name: 'Banner', value: stripIndent`
                    **>** **Before:** ${imageLink(oldGuild.bannerURL(imgOptions), true)}
                    **>** **After:** ${imageLink(newGuild.bannerURL(imgOptions))}
                `
            }]).setThumbnail(oldGuild.bannerURL(imgOptions))

            logsChannel.send(imagesEmbed)
        }

        if (splash1 !== splash2) {
            imagesEmbed.spliceFields(0, 1, [{
                name: 'Invite splash image', value: stripIndent`
                    **>** **Before:** ${imageLink(oldGuild.splashURL(imgOptions), true)}
                    **>** **After:** ${imageLink(newGuild.splashURL(imgOptions))}
                `
            }]).setThumbnail(oldGuild.splashURL(imgOptions))

            logsChannel.send(imagesEmbed)
        }

        if (url1 !== url2) embed.addField('Vanity URL code', `${url1 || 'None'} ➜ ${url2 || 'None'}`)

        if (!arrayEqualsIgnoreOrder(features1, features2)) {
            const [addedFeat, removedFeat] = comparePerms(features1.map(feat => formatPerm(feat)), features2.map(feat => formatPerm(feat)))

            const added = !!addedFeat.join(', ') ? stripIndent`
                **Added**
                ${addedFeat.join(', ') || 'None'}
            ` : ''

            const removed = !!removedFeat.join(', ') ? stripIndent`
                **Removed**
                ${removedFeat.join(', ') || 'None'}
            ` : ''

            embed.addField('Features', stripIndent`
                ${added}

                ${removed}
            `)
        }

        // Moderation
        if (verLVL1 !== verLVL2) embed.addField('Verification level', `${formatPerm(verLVL1)} ➜ ${formatPerm(verLVL2)}`)

        if (expFilter1 !== expFilter2) embed.addField('Explicit content filter', `${formatPerm(expFilter1)} ➜ ${formatPerm(expFilter2)}`)

        if (mfa1 !== mfa2) embed.addField('MFA level', mfa1 === 0 ? 'Disabled ➜ Enabled' : 'Enabled ➜ Disabled')

        // Widget
        if (widgetChan1 !== widgetChan2) embed.addField('Widget channel', `${widgetChan1?.toString() || 'None'} ➜ ${widgetChan2?.toString() || 'None'}`)

        if (widgetOn1 !== widgetOn2) embed.addField('widget', widgetOn1 ? 'Enabled ➜ Disabled' : 'Disabled ➜ Enabled')

        // Community
        if (discSplash1 !== discSplash2) {
            imagesEmbed.spliceFields(0, 1, [{
                name: 'Discovery splash image', value: stripIndent`
                    **>** **Before:** ${imageLink(oldGuild.discoverySplashURL(imgOptions), true)}
                    **>** **After:** ${imageLink(newGuild.discoverySplashURL(imgOptions))}
                `
            }]).setThumbnail(oldGuild.discoverySplashURL(imgOptions))

            logsChannel.send(imagesEmbed)
        }

        if (updateChan1 !== updateChan2) embed.addField('Public updates channel', `${updateChan1?.toString() || 'None'} ➜ ${updateChan2?.toString() || 'None'}`)

        if (rulesChan1 !== rulesChan2) embed.addField('Rules channel', `${rulesChan1?.toString() || 'None'} ➜ ${rulesChan2?.toString() || 'None'}`)

        if (language1 !== language2) embed.addField('Preferred language', `${language1} ➜ ${language2}`)

        if (embed.fields.length !== 0 || embed.description) logsChannel.send(embed)
    })

    client.on('inviteCreate', async invite => {
        const { guild, inviter, maxUses, expiresAt, temporary, channel } = invite

        const status = await moduleStatus(modules, guild, 'auditLogs', 'server')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Created invite', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Link:** ${invite.toString()}
                **>** **Channel:** ${channel.toString()} ${channel.name}
                **>** **Inviter:** ${inviter.toString()} ${inviter.tag}
                **>** **Max uses:** ${maxUses || 'No limit'}
                **>** **Expires at:** ${formatDate(expiresAt) || 'Never'}
                **>** **Temporary membership:** ${temporary ? 'Yes' : 'No'}
            `)
            .setFooter(`Inviter ID: ${inviter.id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('inviteDelete', async invite => {
        const { guild, channel } = invite

        const status = await moduleStatus(modules, guild, 'auditLogs', 'server')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted invite', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Link:** ${invite.toString()}
                **>** **Channel:** ${channel.toString()} ${channel.name}
            `)
            .setFooter(`Channel ID: ${channel.id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('messageDelete', async _message => {
        /** @type {Message} */
        const message = await fetchPartial(_message)

        const { guild, author, content, attachments, member, type, url, channel, id } = message
        if (!guild || author?.bot) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'messages')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const _content = sliceDots(content, 1024)

        const deleted = type === 'PINS_ADD' ?
            `**${member.displayName}** pinned [**a message**](${url}) to this channel.` :
            _content

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted message', author.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Author:** ${author.toString()} ${author.tag}
                **>** **Channel:** ${channel.toString()} ${channel.name}
            `)
            .setFooter(stripIndent`
                Author ID: ${author.id}
                Message ID: ${id}
            `)
            .setTimestamp()

        if (deleted) embed.addField('Message', deleted)

        if (attachments.size > 0) {
            const atts = []
            for (const [, { name, proxyURL, size, height, url }] of attachments) {
                const _size = fixSize(size)
                const link = `[${name}](${proxyURL})`
                const download = !height ? `- Download [here](${url})` : ''

                atts.push(`**>** ${link} - ${_size} ${download}`)
            }

            embed.addField('Attachments', atts.join('\n'))
        }

        logsChannel.send(embed)
    })

    client.on('messageDeleteBulk', async messages => {
        /** @type {Message} */
        const message = await fetchPartial(messages.first())

        const { guild, channel } = message
        if (!guild) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'messages')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted multiple messages', guild.iconURL({ dynamic: true }))
            .setDescription(`Deleted **${pluralize('message', messages.size)}** in ${channel.toString()} ${channel.name}`)
            .setFooter(`Channel ID: ${channel.id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('messageUpdate', async (_oldMessage, _newMessage) => {
        /** @type {Message} */
        const oldMessage = await fetchPartial(_oldMessage)
        /** @type {Message} */
        const newMessage = await fetchPartial(_newMessage)

        const { guild, channel, author, content: content1, url, id } = oldMessage
        const { content: content2 } = newMessage
        if (!guild || author.bot || content1 === content2) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'messages')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const oldContent = sliceDots(content1, 1024)
        const newContent = sliceDots(content2, 1024)

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Edited message', author.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Link:** [Click here](${url})
                **>** **Author:** ${author.toString()} ${author.tag}
                **>** **Channel:** ${channel.toString()} ${channel.name}
            `)
            .addFields(
                { name: 'Before', value: oldContent || '`Empty`' },
                { name: 'After', value: newContent || '`Empty`' }
            )
            .setFooter(`Message ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('roleCreate', async role => {
        const { guild, id, name, hexColor } = role

        const status = await moduleStatus(modules, guild, 'auditLogs', 'roles')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const colorLink = `https://www.color-hex.com/color/${hexColor.replace('#', '')}`

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor('Created role', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Role:** ${role.toString()} ${name}
                **>** **Color:** [${hexColor}](${colorLink})
                **>** **Key permissions:** ${getKeyPerms(role)}
            `)
            .setFooter(`Role ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('roleDelete', async role => {
        const { guild, id, name, hexColor, mentionable, hoist } = role
        if (!guild.available) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'roles')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const colorLink = `https://www.color-hex.com/color/${hexColor.replace('#', '')}`

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setAuthor('Deleted role', guild.iconURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **Name:** ${name}
                **>** **Color:** [${hexColor}](${colorLink})
                **>** **Hoisted:** ${hoist ? 'Yes' : 'No'}
                **>** **Mentionable:** ${mentionable ? 'Yes' : 'No'}
                **>** **Key permissions:** ${getKeyPerms(role)}
            `)
            .setFooter(`Role ID: ${id}`)
            .setTimestamp()

        logsChannel.send(embed)
    })

    client.on('roleUpdate', async (oldRole, newRole) => {
        const { guild, id } = oldRole

        const status = await moduleStatus(modules, guild, 'auditLogs', 'roles')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const { name: name1, hexColor: color1, hoist: hoist1, mentionable: mention1, permissions: perms1 } = oldRole
        const { name: name2, hexColor: color2, hoist: hoist2, mentionable: mention2, permissions: perms2 } = newRole

        const oldPerms = format(perms1, true)
        const newPerms = format(perms2, true)
        const [added, removed] = comparePerms(oldPerms, newPerms)

        const color1link = `https://www.color-hex.com/color/${color1.replace('#', '')}`
        const color2link = `https://www.color-hex.com/color/${color2.replace('#', '')}`

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated role', guild.iconURL({ dynamic: true }))
            .setDescription(`${oldRole.toString()} ${oldRole.name}`)
            .setFooter(`Role ID: ${id}`)
            .setTimestamp()

        if (name1 !== name2) embed.addField('Name', `${name1} ➜ ${name2}`)

        if (color1 !== color2) embed.addField('Color', `[${color1}](${color1link}) ➜ [${color2}](${color2link})`)

        if (hoist1 !== hoist2) embed.addField('Hoisted', hoist1 ? 'Yes ➜ No' : 'No ➜ Yes')

        if (mention1 !== mention2) embed.addField('Mentionable', mention1 ? 'Yes ➜ No' : 'No ➜ Yes')

        if (added.length !== 0) embed.addField(`${customEmoji('check', false)} Allowed permissions`, added.join(', '))

        if (removed.length !== 0) embed.addField(`${customEmoji('cross', false)} Denied permissions`, removed.join(', '))

        if (embed.fields.length > 0) logsChannel.send(embed)
    })

    client.on('voiceStateUpdate', async (oldState, newState) => {
        const { guild, member, id } = oldState

        const status = await moduleStatus(modules, guild, 'auditLogs', 'members')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const { channel: channel1, serverMute: mute1, serverDeaf: deaf1 } = oldState
        const { channel: channel2, serverMute: mute2, serverDeaf: deaf2 } = newState
        const { user } = member

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated voice state', user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${user.toString()} ${user.tag}`)
            .setFooter(`User ID: ${id}`)
            .setTimestamp()

        if (!channel1) embed.setColor('GREEN').addField(`Joined ${channel2.type} channel`, `${channel2.toString()} ${channel2.name}`)

        if (!channel2) embed.setColor('ORANGE').addField(`Left ${channel1.type} channel`, `${channel1.toString()} ${channel1.name}`)

        if (channel1 && channel2) {
            if (channel1.id !== channel2.id) embed.addField(`Switched ${channel1.type} channels`, `${channel1} ➜ ${channel2}`)
        }

        if (typeof mute1 === 'boolean' && typeof mute2 === 'boolean') {
            if (mute1 !== mute2) embed.addField('Server mute', mute1 ? 'Yes ➜ No' : 'No ➜ Yes')
        }

        if (typeof deaf1 === 'boolean' && typeof deaf2 === 'boolean') {
            if (deaf1 !== deaf2) embed.addField('Server deaf', deaf1 ? 'Yes ➜ No' : 'No ➜ Yes')
        }

        if (embed.fields.length !== 0) logsChannel.send(embed)
    })

    client.on('message', async _message => {
        /** @type {CommandoMessage} */
        const message = await fetchPartial(_message)

        const { guild, author, isCommand, content, channel, url } = message
        if (!guild || author.bot || isCommand) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'misc')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const invites = await guild.fetchInvites()

        for (const link of content.split(/ +/)) {
            const isLink = validURL(link)
            if (!isLink) continue

            /** @type {Invite} */
            const invite = await client.fetchInvite(link).catch(() => null)
            if (!invite) continue
            if (invites.get(invite.code)) continue

            const { channel: invChannel, maxUses, expiresAt, temporary, presenceCount, memberCount, guild: invGuild } = invite

            const embed = new MessageEmbed()
                .setColor('BLUE')
                .setAuthor('Posted invite', author.displayAvatarURL({ dynamic: true }))
                .setDescription(stripIndent`
                    **>** **User:** ${author.toString()} ${author.tag}
                    **>** **Channel:** ${channel.toString()} ${channel.name}
                    **>** **Message:** [Click here](${url})
                    **>** **Invite:** ${invite.toString()}
                `)
                .addField('Invite information', stripIndent`
                    **>** **Server:** ${invGuild.name}
                    **>** **Channel:** ${invChannel.toString()} ${invChannel.name}
                    **>** **Online members:** ${presenceCount}/${memberCount}
                    **>** **Max uses:** ${maxUses || 'No limit'}
                    **>** **Expires at:** ${formatDate(expiresAt) || 'Never'}
                    **>** **Temporary membership:** ${temporary ? 'Yes' : 'No'}
                `)
                .setFooter(`Server ID: ${invGuild.id}`)
                .setTimestamp()
            logsChannel.send(embed)
        }
    })

    client.on('message', async _message => {
        /** @type {CommandoMessage} */
        const message = await fetchPartial(_message)

        const { guild, author, isCommand, command, channel, content, id, url } = message
        const isModCommand = !!command?.userPermissions || command?.ownerOnly || command?.name === 'prefix'

        if (!guild || author.bot || !isCommand || command?.hidden || !isModCommand) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'misc')
        if (!status) return

        const logsChannel = await getChannel(setup, guild)
        if (!logsChannel) return

        const _content = sliceDots(content, 1024)

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor(`Used ${command.name} command`, author.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **User:** ${author.toString()} ${author.tag}
                **>** **Channel:** ${channel.toString()} ${channel.name}
                **>** **Link:** [Click here](${url})
            `)
            .addField('Message', _content)
            .setFooter(stripIndent`
                Author ID: ${author.id}
                Message ID: ${id}
            `)
            .setTimestamp()

        logsChannel.send(embed)
    })
}