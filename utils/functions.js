const { stripIndent } = require('common-tags')
const { MessageEmbed, GuildMember, User, Role, Emoji, GuildEmoji, PermissionResolvable, TextChannel } = require('discord.js')
const { CommandoClient, CommandoGuild, Command, CommandoMessage } = require('discord.js-commando')
const { transform, isEqual, isArray, isObject } = require('lodash')
const { ms } = require('./custom-ms')
const { version } = require('../package.json')
const { moderations, active } = require('./mongodb-schemas')

/**
 * Pauses the command's execution
 * @param {number} s Amount of seconds
 */
function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

/**
 * Fetches the provided partial object
 * @param {*} object The partial object
 */
async function fetchPartial(object) {
    if (object.partial) return await object.fetch(true).catch(() => object)
    return object
}

/**
 * Checks if the module is enabled
 * @param {Model<any, {}, {}>} db The database to look into
 * @param {CommandoGuild} guild The guild to look into
 * @param {string} module The module to check
 * @param {string} [subModule] The sub-module to check
 */
 async function moduleStatus(db, guild, module, subModule) {
    const data = await db.findOne({ guild: guild.id })
    const check = subModule ? data?.[module]?.[subModule] : data?.[module]
    const status = typeof check === 'boolean' && !check
    return !status
}

/**
 * Gets the audit-logs channel
 * @param {*} db The database to look into
 * @param {CommandoGuild} guild The guild to look into
 */
 async function getLogsChannel(db, guild) {
    const data = await db.findOne({ guild: guild.id })
    /** @type {TextChannel} */
    const channel = guild.channels.cache.get(data?.logsChannel)
    return channel
}

/**
 * Formats the provided time into milliseconds.
 * @param {string|number} time The time to format.
 * @returns {number}
 */
function formatTime(time) {
    if (time === 'off') return 0
    if (Number(time)) return Math.abs(time) * 1000
    return ms(time)
}

/**
 * Returns a certain emoji depending on the specified string.
 * @param {string|Emoji|GuildEmoji} emoji The emoji you want to get. Either cross, check, info or loading.
 * @param {boolean} [animated] If the emoji you want is animated.
 * @returns {string}
 */
function customEmoji(emoji, animated = true) {
    if (animated) {
        if (emoji === 'cross') return '<a:cross:863118691917889556>'
        if (emoji === 'check') return '<a:check:863118691808706580>'
        if (emoji === 'loading') return '<a:loading:863666168053366814>'
        if (emoji === 'info') return '<:info:802617654262890527>'
        return emoji
    }
    if (emoji === 'cross') return '<:cross:802617654442852394>'
    if (emoji === 'check') return '<:check:802617654396715029>'
    if (emoji === 'neutral') return '<:neutral:819395069608984617>'
    if (emoji === 'info') return '<:info:802617654262890527>'
    return emoji
}

/**
 * Creates a basic custom embed.
 * @param {string} color The color of the embed.
 * @param {string} emoji The emoji to use with the text.
 * @param {string} text The text to fill the embed with.
 * @param {string} value The value of the field.
 * @returns {MessageEmbed}
 */
function basicEmbed(color, emoji, text, value) {
    const embedText = `${customEmoji(emoji)} ${text}`

    const embed = new MessageEmbed()
        .setColor(color.toUpperCase())

    if (value) embed.addField(embedText, value)
    else embed.setDescription(embedText)

    return embed
}

/**
 * Checks if the role or member is considered a moderator by checking their permissions.
 * @param {Role|GuildMember} roleOrMember A role or member.
 * @returns {boolean|undefined}
 */
function isMod(roleOrMember) {
    return roleOrMember?.permissions.has(
        'KICK_MEMBERS' ||
        'BAN_MEMBERS' ||
        'MANAGE_CHANNELS' ||
        'MANAGE_GUILD' ||
        'VIEW_AUDIT_LOG' ||
        'MANAGE_MESSAGES' ||
        'VIEW_GUILD_INSIGHTS' ||
        'MUTE_MEMBERS' ||
        'MOVE_MEMBERS' ||
        'DEAFEN_MEMBERS' ||
        'MANAGE_NICKNAMES' ||
        'MANAGE_ROLES' ||
        'MANAGE_WEBHOOKS' ||
        'MANAGE_EMOJIS' ||
        'ADMINISTRATOR'
    )
}

/**
 * Gets the key permissions from a role or member.
 * @param {Role|GuildMember} roleOrMember A role or member.
 * @returns {string}
 */
function getKeyPerms(roleOrMember) {
    if (!roleOrMember) return

    if (roleOrMember.permissions.has('ADMINISTRATOR')) return 'Administrator'

    const filtered = roleOrMember.permissions.toArray().filter(perms => perms.replace(/ADMINISTRATOR|CREATE_INSTANT_INVITE|ADD_REACTIONS|VIEW_AUDIT_LOG|PRIORITY_SPEAKER|STREAM|VIEW_CHANNEL|SEND_MESSAGES|SEND_TTS_MESSAGES|EMBED_LINKS|ATTACH_FILES|READ_MESSAGE_HISTORY|USE_EXTERNAL_EMOJIS|VIEW_GUILD_INSIGHTS|CONNECT|SPEAK|MUTE_MEMBERS|DEAFEN_MEMBERS|MOVE_MEMBERS|USE_VAD|CHANGE_NICKNAME|MANAGE_WEBHOOKS/g, ''))

    if (filtered.length === 0) return 'None'

    return filtered.map(format => capitalize(format.replace(/_/g, ' '))).join(', ')
}

/**
 * Format's a permission into a string.
 * @param {PermissionResolvable} perm The permission to format.
 * @param {boolean} [codeLike] If the resulting string should be surrounded by \`these\`.
 */
function formatPerm(perm, codeLike) {
    const string = capitalize(perm.replace(/_/g, ' '))

    if (codeLike) return `\`${string}\``
    return string
}

/**
 * Capitalizes every word of a string.
 * @param {string} str The string to capitalize.
 * @returns {string}
 */
function capitalize(str) {
    var splitStr = str.toLowerCase().split(/ +/)
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
    }
    return splitStr.join(' ')
}

/**
 * Pluralizes a string, adding `s` or `es` at the end of it
 * @param {string} string The string to pluralize
 * @param {number} number The number to check with
 * @param {boolean} showNum If it should show the number
 */
function pluralize(string, number, showNum = true) {
    if (number === 1) {
        if (!showNum) return string
        return `${number} ${string}`
    }

    var s
    for (const end of ['ch', 'sh', 's', 'x', 'z']) {
        if (string.endsWith(end)) s = true
    }

    if (s) {
        if (!showNum) return string + 'es'
        return `${number} ${string}es`
    }
    if (!showNum) return string + 's'
    return `${number} ${string}s`
}

/**
 * Removes Discord's formatting from a string.
 * @param {string} str The string.
 * @returns {string}
 */
function remDiscFormat(str) {
    return str.replace(/\||_|\*|`|~|>/g, '\\$&')
}

/**
 * Slices the string at the specified length, and adds `...` if the length of the original is greater than the modified
 * @param {string} string The string to slice
 * @param {number} length The length of the sliced string
 */
function sliceDots(string, length) {
    if (!string) return

    const og = string
    const sliced = string.slice(0, length - 3)
    const dots = og.length > sliced.length ? '...' : ''

    return sliced + dots
}

/**
 * Gives any date the following format: `30/12/2020, 23:59`
 * @param {Date|number} date The date in `Date` format or a number.
 * @returns {string}
 */
function formatDate(date) {
    const timeFormat = new Intl.DateTimeFormat('en-GB', {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric',
        timeZone: 'UTC'//, timeZoneName: 'short'
    })

    if (!date && date !== 0) return

    const isValidDate = typeof date === 'number' ? null : !!date.getTime()
    const isValidNumber = date / 1 < 8.64e+15

    if (!isValidDate && !isValidNumber) return

    return timeFormat.format(date)
}

/**
 * Get's the full difference between the specified date and now in this format:
 * `[years, months, days, hours, minutes, seconds]`
 * @param {Date|number} date The date in `Date` format or a number.
 * @returns {string[]}
 */
function getDateDiff(date) {
    const milliseconds = Math.abs(Date.now() - date)

    // [years, months, days, hours, minutes, seconds]
    const difference = new Date(milliseconds).toISOString().replace(/T|:/g, '-').substring(0, 19).split('-').map(v => Number(v))
    var [years, months, days, hours, minutes, seconds] = difference

    years -= 1970 // makes sure the year starts on 0

    return [years + 'y', --months + 'mo', --days + 'd', hours + 'h', minutes + 'm', seconds + 's'].filter(value => !value.startsWith('0'))
}

/**
 * Get's the difference in days between the specified date and now.
 * @param {string|Date} date The date in `Date` format or a string.
 * @returns {number}
 */
function getDayDiff(date) {
    const string = typeof (date) === 'string' ? date : new Date(date).toISOString().split('T')[0]
    const arr = string.split(/\/|,|-/, 3)
    const newDate = new Date(arr)
    const difference = new Date() - newDate.getTime()
    const daysDiff = Math.trunc(difference / 86400000)
    return daysDiff
}

/**
 * Compares if two arrays have the same values in the same order. *It does not check for nested values*.
 * @param {array} first The first array.
 * @param {array} second The second array.
 * @returns {boolean}
 */
function arrayEquals(first, second) {
    return Array.isArray(first) &&
        Array.isArray(second) &&
        first.length === second.length &&
        first.every((val, index) => val === second[index])
}

/**
 * Compares if two arrays have the same values **without consider their order**. *It does not check for nested values*.
 * @param {array} first The first array.
 * @param {array} second The second array.
 * @returns {boolean}
 */
function arrayEqualsIgnoreOrder(first, second) {
    if (first.length !== second.length) return false
    const uniqueValues = new Set([...first, ...second])
    for (const value of uniqueValues) {
        const aCount = first.filter(e => e === value).length
        const bCount = second.filter(e => e === value).length
        if (aCount !== bCount) return false
    }
    return true
}

/**
 * Loops over every element contained on both arrays and checks wether they have common elements.
 * @param {array} first The first array.
 * @param {array} second The second array.
 * @returns {boolean}
 */
function findCommonElement(first, second) {
    for (var i = 0; i < first.length; i++) {
        for (var j = 0; j < second.length; j++) {
            if (first[i] === second[j]) return true
        }
    }
    return false
}

/**
 * Compares if two objects are equal and returns the differences.
 * @param {object} first The first object.
 * @param {object} second The second object.
 * @returns {object}
 */
function difference(first, second) {
    function changes(newObj, origObj) {
        var arrayIndexCounter = 0
        return transform(newObj, function (result, value, key) {
            if (!isEqual(value, origObj[key])) {
                var resultKey = isArray(origObj) ? arrayIndexCounter++ : key
                result[resultKey] = (isObject(value) && isObject(origObj[key])) ? changes(value, origObj[key]) : value
            }
        })
    }
    return changes(second, first)
}

/** Checks whether the string is a valid URL.
 * @param {string} str The string to verify.
 * @returns {boolean}
*/
function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
    return !!pattern.test(str)
}

/**
 * Bans an user.
 * @param {CommandoGuild} guild The guild where the user is being banned.
 * @param {User} bot The bot user.
 * @param {User} user The user to ban.
 * @param {string} reason The reason of the ban.
 * @returns {Promise<void>}
 */
async function ban(guild, bot, user, reason = 'No reason given.') {
    const { members, id: guildID, name: guildName } = guild

    const member = members.cache.get(user.id)

    if (reason.length > 512 || !member?.bannable || isMod(member)) return

    if (member && !user.bot) await user.send(stripIndent`
        You have been **banned** from **${guildName}**
        **Reason:** ${reason}
        **Moderator:** ${bot.tag} - Auto-moderation system
    `).catch(console.error)

    await members.ban(user, { days: 7, reason: reason }).catch(console.error)

    const doc = {
        _id: docID(),
        type: 'ban',
        guild: guildID,
        user: user.id,
        mod: bot.id,
        reason: reason
    }

    await new moderations(doc).save()
}

/**
 * Temporally bans a user.
 * @param {CommandoGuild} guild The guild where the user is being banned.
 * @param {User} bot The bot user.
 * @param {User} user The user to ban.
 * @param {number} time How long the ban should last.
 * @param {string} reason The reason of the ban.
 * @returns {Promise<void>}
 */
async function tempban(guild, bot, user, time, reason = 'No reason given.') {
    const { members, channels, name: guildName, id: guildID } = guild

    const member = members.cache.get(user.id)

    if (reason.length > 512 || !member?.bannable || isMod(member)) return

    const duration = ms(time, { long: true })

    if (member && !user.bot) {
        const invite = await channels.cache.filter(({ type }) => !['category', 'store'].includes(type)).first().createInvite({ maxAge: 0, maxUses: 1 })
        await user.send(stripIndent`
            You have been **banned** from **${guildName}** for **${duration}**
            **Reason:** ${reason}
            **Moderator:** ${bot.tag} - Auto-moderation system
            
            Feel free to join back when your ban expires: ${invite.toString()}
        `).catch(console.error)
    }

    await members.ban(user, { days: 7, reason: reason }).catch(console.error)

    const doc1 = {
        _id: docID(),
        type: 'tempban',
        guild: guildID,
        user: user.id,
        mod: bot.id,
        reason: reason,
        duration: duration
    }

    const doc2 = {
        type: 'tempban',
        guild: guildID,
        user: user.id,
        duration: Date.now() + time
    }

    await new moderations(doc1).save()
    await new active(doc2).save()
}

/**
 * Kicks a member.
 * @param {CommandoGuild} guild The guild where the user is being kicked.
 * @param {User} bot The bot user.
 * @param {GuildMember} member The member to kick.
 * @param {string} reason The reason of the kick.
 * @returns {Promise<void>}
 */
async function kick(guild, bot, member, reason = 'No reason given.') {
    const { channels, name: guildName, id: guildID } = guild

    if (reason.length > 512 || !member.kickable || isMod(member)) return

    if (!member.user.bot) {
        const invite = await channels.cache.filter(ch => !['category', 'store'].includes(ch.type)).first().createInvite({ maxAge: 604800, maxUses: 1 })
        await member.send(stripIndent`
            You have been **kicked** from **${guildName}**
            **Reason:** ${reason}
            **Moderator:** ${bot} - Auto-moderation system
            
            Feel free to join back: ${invite.toString()}
            *This invite will expire in 1 week.*
        `).catch(console.error)
    }

    await member.kick(reason).catch(console.error)

    const doc = {
        _id: docID(),
        type: 'kick',
        guild: guildID,
        user: member.id,
        mod: bot.id,
        reason: reason
    }

    await new moderations(doc).save()
}

/**
 * Mutes a member.
 * @param {CommandoGuild} guild The guild where the user is being muted.
 * @param {User} bot The bot user.
 * @param {GuildMember} member The member to mute.
 * @param {Role} role The 'Muted' role.
 * @param {number} time The duration of the mute.
 * @param {string} reason The reason of the mute.
 * @returns {Promise<void>}
 */
async function mute(guild, bot, member, role, time, reason = 'No reason given.') {
    const { name: guildName, id: guildID } = guild

    if (reason.length > 512 || !member.manageable || isMod(member) || member.roles.cache.has(role.id)) return

    const duration = ms(time, { long: true })

    if (!member.user.bot) await member.send(stripIndent`
        You have been **muted** on **${guildName}** for **${duration}**
        **Reason:** ${reason}
        **Moderator:** ${bot.tag} - Auto-moderation system
    `).catch(console.error)

    await member.roles.add(role).catch(console.error)

    const doc1 = {
        _id: docID(),
        type: 'mute',
        guild: guildID,
        user: member.id,
        mod: bot.id,
        reason: reason,
        duration: duration
    }

    const doc2 = {
        type: 'mute',
        guild: guildID,
        user: member.id,
        duration: Date.now() + time
    }

    await new moderations(doc1).save()
    await new active(doc2).save()
}

/**
 * Creates a random Mongo document ID.
 * @returns {string}
 */
function docID() {
    return Math.floor(Math.random() * (2 ** 48)).toString(16)
}

/**
 * Creates a basic paged embed with the template provided.
 * @param {CommandoMessage} message Used to send the embed.
 * @param {object} data The number of pages the embed should have.
 * @param {number} data.number The number of chunks of data to be displayed in one page.
 * @param {number} data.total The total chunks of data.
 * @param {() => MessageEmbed} template The embed template to use.
 * @param {array} extra Extra data for the embed template. Has to be provided in order
 * @returns {MessageEmbed}
 */
function pagedEmbed(message, data, template, ...extra) {
    message.say(template(0, ...extra)).then(msg => {
        if (data.total <= data.number) return

        // reacts with the navigation arrows
        if (!message.guild) msg.react('⬅️')
        msg.react('➡️')

        // creates a collector for the reactions
        const collector = msg.createReactionCollector((reaction, user) => {
            return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id
        }, { time: 60000 })
        var index = 0

        collector.on('collect', async ({ emoji }) => {
            if (message.guild) await msg.reactions.removeAll()

            // goes down a page if the reaction is ⬅️, and up in the opposite case
            if (emoji.name === '⬅️') index -= data.number
            else index += data.number

            // edits the message with the new page
            msg.edit(template(index, ...extra))

            if (!message.guild) return

            if (index > 0) await msg.react('⬅️')
            if (index + data.number < data.total) msg.react('➡️')
        })
    })
}

/**
 * Generates a paged embed based off the `array` and `embedOptions`
 * @param {CommandoMessage} message This lets me know where to send the embed
 * @param {array} array The array that contains the data to be displayed
 * @param {object} data Some extra data for the embed
 * @param {number} [data.number] The number of chunks to display per page
 * @param {string} [data.color] The color of the embed
 * @param {string} data.authorName The name of the author
 * @param {string} data.authorIconURL The icon URL of the author
 * @param {string} [data.title] The title of each section in the embed
 * @param {boolean} [data.useDescription] Whether to use `setDescription()` or not
 * @param {boolean} [data.inLine] Whether the data should be displayed inline in the embed
 * @param {boolean} [data.hasObjects] Whether `array` contains objects inside or not
 * @param {boolean} [data.boldText] Whether to use bold text for the properties or not, effect visible only if `data.hasObjects` is `true`
 * @param {object} [data.keyTitle] A custom key data to use from the nested objects on the title
 * @param {string} [data.keyTitle.name] The name of the key
 * @param {boolean} [data.keyTitle.isDate] Whether `data.keyTitle.name` is a date or not
 * @param {string[]} [data.keys] The properties to display in the embed. If empty I will use every property
 * @param {string[]} [data.keysExclude] The properties to exclude on the embed. If empty I will use `data.keys` or every property
 * @param {string} [data.useDocID] Whether to use the document's ID on each data chunk
 * @param {boolean} [isDoc] Whether the provided the data comes from a MongoDB document or not
 * @returns {MessageEmbed}
 */
function generateEmbed(message, array, data, isDoc) {
    const { number = 6, color = '#4c9f4c', authorName, authorIconURL, useDescription, title = '', inLine, hasObjects, boldText, keyTitle, keys, keysExclude = [], useDocID } = data

    if (array.length === 0) throw new Error('array cannot be empty')
    if (!authorName) throw new Error('authorName cannot be undefined or empty')

    function createEmbed(start) {
        const pages = Math.trunc(array.length / number) + ((array.length / number) % 1 === 0 ? 0 : 1)
        const current = array.slice(start, start + number)

        const embed = new MessageEmbed()
            .setColor(color.toUpperCase())
            .setAuthor(authorName, authorIconURL || null)
            .setTimestamp()
        if (pages > 1) embed.setFooter(`Page ${start / number + 1} of ${pages}`)

        if (useDescription) return embed.setDescription(current)

        function bold(str) { return `**${str}**` }
        function code(str) { return `\`${str}\`` }

        current.forEach((item, i) => {
            const objKeys = hasObjects ? Object.keys(isDoc ? item._doc : item).filter(key => (keys ? keys.includes(key) : key) && (!keysExclude.includes(key))) : null
            embed.addField(
                `${title} ${useDocID && isDoc ? item._doc._id : keyTitle ? (keyTitle.isDate ? formatDate(item[keyTitle.name]) : item[keyTitle.name]) : start + i + 1}`,
                objKeys ? objKeys.map(key =>
                    objKeys.length > 1 ? `**>** ${boldText ? bold(capitalize(isDoc ? key.replace('createdAt', 'date') : key)) : capitalize(isDoc ? key.replace('createdAt', 'date') : key)}: ${isDoc ? (key === 'type' ? (boldText ? capitalize(item[key]) : code(capitalize(item[key]))) : ['mod', 'user'].includes(key) ? `<@${item[key]}>` : key === 'createdAt' ? (boldText ? formatDate(item[key]) : code(formatDate(item[key]))) : key === 'channel' ? `<#${item[key]}>` : key === 'duration' && Number(item[key]) ? (boldText ? ms(item[key], { long: true }) : code(ms(item[key], { long: true }))) : key === 'timeout' ? `\`${formatDate(item[key])} (in ${getDateDiff(item[key]).slice(0, 2).join(' and ').toLowerCase()})\`` : (boldText ? item[key] : code(item[key]))) : typeof (item[key]) === 'object' ? item[key] : (boldText ? item[key] : code(item[key]))}` : typeof (item[key]) === 'object' ? item[key] : (boldText ? item[key] : code(item[key]))
                ).join('\n') : item,
                inLine
            )
        })

        return embed
    }

    pagedEmbed(message, { number, total: array.length }, createEmbed)
}

/**
 * Creates an embed containing the information about the command.
 * @param {CommandoClient} client The bot client.
 * @param {CommandoGuild} guild The guild where the command is used.
 * @param {Command} command The command to get information from.
 * @returns {MessageEmbed}
 */
function commandInfo(client, guild, command) {
    const { commandPrefix, user: bot, owners } = client
    var { name, description, details, format, examples, aliases, group, guarded, throttling, clientPermissions, userPermissions, ownerOnly } = command

    // gets data that will be used later
    const prefix = guild?.commandPrefix || commandPrefix

    format = format?.split('\n').map(string => {
        const [cmd, ...desc] = string.split(/\s*-\s*/)
        if (desc.length >= 1) return `**>** \`${prefix}${cmd}\` - ${desc.join('-')}`
        return `**>** \`${prefix}${cmd}\``
    }).join('\n') || `**>** \`${prefix}${name}\``

    clientPermissions = clientPermissions?.map(perm => capitalize(perm.replace(/_/g, ' ').toLowerCase())).join(', ') || 'None'
    userPermissions = userPermissions?.map(perm => capitalize(perm.replace(/_/g, ' ').toLowerCase())).join(', ') || 'None'

    // creates the information embed
    const embed = new MessageEmbed()
        .setColor('#4c9f4c')
        .setAuthor(`Command information for ${name}`, bot.displayAvatarURL({ dynamic: true }))
        .setDescription(stripIndent`
            **>** **Description:** ${description}
            ${details ? `**>** **Details:** ${details}` : ''}
        `)
        .addField('Usage', format)
        .setFooter(`Version: ${version} | Developers: ${owners.map(({ tag }) => tag).join(', ')}`, bot.displayAvatarURL({ dynamic: true }))

    // displays the examples if there's any
    if (examples) embed.addField('Examples', examples.map(example => `**>** \`${prefix}${example}\``).join('\n'))

    // adds some extra data
    embed.addFields(
        {
            name: 'Information', value: stripIndent`
                **>** **Name:** ${capitalize(name)}
                **>** **Aliases:** ${aliases.join(', ') || 'None'}
                **>** **Category:** ${group.name}
                **>** **Cooldown:** ${throttling ? `${throttling.duration} seconds` : 'None'}
            `, inline: true
        },
        {
            name: '\u200B', value: stripIndent`
                **>** **Guarged:** ${guarded ? 'Yes' : 'No'}
                **>** **Status:** ${command.isEnabledIn(guild) ? 'Enabled' : 'Disabled'}
                **>** **Bot perms:** ${clientPermissions}
                **>** **User perms:** ${ownerOnly ? 'Bot\'s owner' : userPermissions}
            `, inline: true
        }
    )

    return embed
}

module.exports = {
    arrayEquals,
    arrayEqualsIgnoreOrder,
    ban,
    basicEmbed,
    capitalize,
    commandInfo,
    customEmoji,
    difference,
    docID,
    fetchPartial,
    findCommonElement,
    formatDate,
    formatPerm,
    formatTime,
    generateEmbed,
    getDateDiff,
    getDayDiff,
    getKeyPerms,
    getLogsChannel,
    isMod,
    kick,
    moduleStatus,
    mute,
    pagedEmbed,
    pluralize,
    remDiscFormat,
    sleep,
    sliceDots,
    tempban,
    validURL
}