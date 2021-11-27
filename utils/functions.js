/* eslint-disable no-unused-vars */
const {
    MessageEmbed, GuildMember, User, Role, MessageOptions, TextChannel, GuildChannel, Message, ColorResolvable,
    AwaitMessagesOptions, MessageActionRow, MessageButton, Invite, MessageSelectMenu, Util
} = require('discord.js')
const { CommandoMessage, CommandoGuild, Command, Argument, CommandInstances } = require('../command-handler/typings')
const CGuildClass = require('../command-handler/extensions/guild')
const { transform, isEqual, isArray, isObject } = require('lodash')
const { stripIndent, oneLine } = require('common-tags')
const { myMs, timestamp } = require('./custom-ms')
const { version } = require('../package.json')
const { moderations, active } = require('../schemas')
const { permissions } = require('../command-handler/util')
const { Module, AuditLog } = require('../schemas/types')
/* eslint-enable no-unused-vars */

/**
 * Pauses the command's execution
 * @param {number} s Amount of seconds
 */
function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

/**
 * Calculates the probability of something
 * @param {number} n The probability (in decimals or percentage) to calculate
 */
function probability(n) {
    if (n > 1) n /= 100
    return !!n && Math.random() <= n
}

/**
 * Slices the directory/name of the file to their last 2 references.
 * @param {string} fileDir The directory/name of the file.
 */
function sliceFileName(fileDir) {
    const arr = fileDir.split(/[/\\]+/g)
    const fileName = arr.pop().split('.').shift()
    const folderName = arr.pop()
    return `${folderName}/${fileName}`
}

/**
 * Orders an array in alphabetical order
 * @param {string} str1 The first string
 * @param {string} str2 The seconds string
 */
function abcOrder(str1, str2) {
    if (str1 < str2) return -1
    if (str1 > str2) return 1
    return 0
}

/**
 * Parses a string to have code block style
 * @param {string} str The string to parse
 * @param {string} [lang] The language to use for this block
 */
function code(str, lang = '') {
    return `\`\`\`${lang}\n${Util.escapeMarkdown(str)}\n\`\`\``
}

/**
 * Fetches the provided partial object
 * @param {*} object The partial object
 */
async function fetchPartial(object) {
    if (object.partial) return await object.fetch().catch(() => object)
    return object
}

/**
 * Adds dashes to the string on every upper case letter
 * @param {string} str The string to parse
 * @param {boolean} [under] Wether to use underscores instead or not
 */
function addDashes(str, under = false) {
    if (!str) return
    if (typeof under !== 'boolean') under = false
    return str.replace(/[A-Z]/g, under ? '_$&' : '-$&').toLowerCase()
}

/**
 * Removes dashes from the string and capitalizes the remaining strings
 * @param {string} str The string to parse
 */
function removeDashes(str) {
    if (!str) return
    const arr = str.split('-')
    const first = arr.shift()
    const rest = arr.map(s => capitalize(s)).join('')
    return first + rest
}

/**
 * Checks if the module is enabled
 * @param {CommandoGuild} guild The guild to look into
 * @param {Module} module The module to check
 * @param {AuditLog} [subModule] The sub-module to check
 */
async function isModuleEnabled(guild, module, subModule) {
    const data = await guild.database.modules.fetch()
    module = removeDashes(module)
    subModule = removeDashes(subModule)
    const check = subModule ? data?.[module]?.[subModule] : data?.[module]
    if (typeof check === 'object') {
        const status = []
        for (const prop in check) {
            if (typeof check[prop] === 'function') continue
            status.push(check[prop] === true)
        }
        return !!status.filter(b => b)[0]
    }
    return check === true
}

/**
 * Gets the audit-logs channel
 * @param {CommandoGuild} guild The guild to look into
 * @returns {Promise<?TextChannel>}
 */
async function getLogsChannel(guild) {
    const data = await guild.database.setup.fetch()
    const channel = guild.channels.resolve(data?.logsChannel)
    return channel
}

/**
 * A custom emoji.
 * @typedef {'cross'|'check'|'info'|'neutral'|'loading'|'boost'|'bot'} CustomEmoji
 */

/**
 * Returns a certain emoji depending on the specified string.
 * @param {CustomEmoji} [emoji] The emoji you want to get.
 * @param {boolean} [animated] If the emoji you want is animated.
 * @returns {string}
 */
function customEmoji(emoji = '', animated = false) {
    if (!emoji) return ''

    if (emoji === 'loading') return '<a:loading:863666168053366814>'
    if (emoji === 'neutral') return '<:neutral:819395069608984617>'
    if (emoji === 'info') return '<:info:802617654262890527>'
    if (emoji === 'boost') return '<a:boost:806364586231595028>'
    if (emoji === 'bot') return '<:bot1:893998060965883904><:bot2:893998060718399528>'

    if (animated) {
        if (emoji === 'cross') return '<a:cross:863118691917889556>'
        if (emoji === 'check') return '<a:check:863118691808706580>'
    } else {
        if (emoji === 'cross') return '<:cross:802617654442852394>'
        if (emoji === 'check') return '<:check:802617654396715029>'
    }

    return emoji
}

/**
 * Options for the basic embed.
 * @typedef {Object} BasicEmbedOptions
 * @property {string} description The description of the embed.
 * @property {ColorResolvable} [color='#4c9f4c'] The color of the embed.
 * @property {CustomEmoji} [emoji] The emoji to use with the text or field name.
 * @property {string} [fieldName] The name of the field.
 * @property {string} [fieldValue] The value of the field.
 * Only usable if `fieldName` is specified.
 * @property {string} [footer] The footer of the field.
 */

/**
 * Creates a basic custom embed.
 * @param {BasicEmbedOptions} options Options for the embed.
 */
function basicEmbed({ color = '#4c9f4c', description, emoji, fieldName, fieldValue, footer }) {
    if (!description && !fieldName) throw new Error('The argument description or fieldName must be specified')

    const embedText = `${customEmoji(emoji)} ${fieldName || description}`

    const embed = new MessageEmbed()
        .setColor(typeof color === 'string' ? color.toUpperCase() : color)

    if (description) embed.setDescription(embedText)
    if (fieldName) {
        if (!fieldValue) throw new Error('The argument fieldValue must be specified')
        embed.addField(embedText, fieldValue)
    }
    if (footer) embed.setFooter(footer)

    return embed
}

/**
 * Formats the bytes to its most divisable point
 * @param {number|string} bytes The bytes to format
 * @param {number} [decimals] The amount od decimals to display
 * @param {boolean} [showUnit] Whether to display the units or not
 */
function formatBytes(bytes, decimals = 2, showUnit = true) {
    if (bytes === 0) {
        if (showUnit) return '0 B'
        return '0'
    }

    const k = 1000
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const float = parseFloat(
        (bytes / Math.pow(k, i)).toFixed(dm)
    ).toString()

    if (showUnit) return `${float} ${sizes[i]}`
    return float
}

/**
 * Determines whether a user should be pinged in a reply.
 * If the message is in DMs, no ping should be sent.
 * @param {Message} msg The message to reply.
 * @returns Whether the user should be pinged or not.
 */
function noReplyInDMs(msg) {
    if (!msg) return {}
    /** @type {MessageOptions} */
    const options = msg.channel.type === 'DM' ? {
        allowedMentions: { repliedUser: false }
    } : {}

    return options
}

/**
 * Replies to the corresponding instances
 * @param {CommandInstances} instances The instances to reply
 * @param {MessageOptions|string|MessageEmbed} options The options of the message
 * @returns {Promise<?Message<boolean>>}
 */
async function replyAll({ message, interaction }, options) {
    if (options instanceof MessageEmbed) options = { embeds: [options] }
    if (typeof options === 'string') options = { content: options }
    if (interaction) {
        if (interaction.deferred || interaction.replied) return await interaction.editReply(options)
        else return await interaction.reply(options)
    }
    if (message) return await message.reply({ ...options, ...noReplyInDMs(message) })
    return null
}

/**
 * Creates a basic collector with the given parameters.
 * @param {CommandInstances} instances The instances the command is being run for
 * @param {BasicEmbedOptions} embedOptions The options for the response messages.
 * @param {AwaitMessagesOptions} [collectorOptions] The collector's options.
 * @param {boolean} [shouldDelete] Whether the prompt should be deleted after it gets a value or not.
 */
async function basicCollector({ message, interaction } = {}, embedOptions, collectorOptions = {}, shouldDelete) {
    if (!message && !interaction) throw new Error('The argument instances must be specified')
    if (!embedOptions) throw new Error('The argument embedOptions must be specified')
    if (collectorOptions === null) collectorOptions = {}

    if (!collectorOptions.time) collectorOptions.time = 30 * 1000
    if (!collectorOptions.max) collectorOptions.max = 1
    if (!collectorOptions.filter) {
        collectorOptions.filter = m => m.author.id === (message?.author || interaction.user).id
    }

    if (!embedOptions.color) embedOptions.color = 'BLUE'
    if (!embedOptions.fieldValue) embedOptions.fieldValue = 'Respond with `cancel` to cancel the command.'
    if (!embedOptions.footer) {
        embedOptions.footer = `The command will automatically be cancelled in ${myMs(
            collectorOptions.time, { long: true, length: 1 }
        )}`
    }

    const toDelete = await message?.replyEmbed(basicEmbed(embedOptions))

    const messages = await (message || interaction).channel.awaitMessages(collectorOptions)
    if (messages.size === 0) {
        await replyAll({ message, interaction }, { content: 'You didn\'t answer in time.' })
        return null
    }
    if (messages.first().content.toLowerCase() === 'cancel') {
        await replyAll({ message, interaction }, { content: 'Cancelled command.' })
        return null
    }

    if (shouldDelete) await toDelete?.delete()
    return messages.first()
}

/**
 * Get's a single argument
 * @param {CommandoMessage} msg The message to get the argument from
 * @param {Argument} arg The argument to get
 */
async function getArgument(msg, arg) {
    arg.required = true
    const response = await arg.obtain(msg)
    arg.required = false
    if (response.cancelled) await msg.reply({ content: 'Cancelled command.', ...noReplyInDMs(msg) })
    return response
}

/**
 * Makes sure the moderation command is usable by the user
 * @param {User} user The user targeted in the the command
 * @param {User} author The user who ran the command
 * @param {Command} cmd The command that's being ran
 * @return {?BasicEmbedOptions}
 */
function userException(user, author, { client, name }) {
    /** @type {BasicEmbedOptions} */
    const options = { color: 'RED', emoji: 'cross' }

    if (user.id === client.user.id) {
        return {
            ...options,
            description: `You can't make me ${name} myself.`
        }
    }
    if (user.id === author.id) {
        return {
            ...options,
            description: `You can't ${name} yourself.`
        }
    }

    return null
}

/**
 * Makes sure the moderation command is usable by the member
 * @param {GuildMember} member The member who ran the command
 * @param {Command} cmd The command that's being ran
 * @returns {?BasicEmbedOptions}
 */
function memberException(member, { client, name }) {
    if (!member) return null

    /** @type {BasicEmbedOptions} */
    const options = { color: 'RED', emoji: 'cross' }

    if (!member.bannable) {
        return {
            ...options,
            fieldName: `Unable to ${name} ${member.user.tag}`,
            fieldValue: 'Please check the role hierarchy or server ownership.'
        }
    }
    if (!client.isOwner(member) && isMod(member)) {
        return {
            ...options,
            description: `That user is a mod/admin, you can't ${name} them.`
        }
    }

    return null
}

/**
 * Creates a {@link MessageActionRow} with a {@link MessageButton} with the provided invite
 * @param {Invite|string} invite The invite to user for the button
 * @param {string} [label] The label of the button
 */
function inviteButton(invite, label = 'Join back') {
    return new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel(label)
                .setStyle('LINK')
                .setURL(invite.toString())
        )
}

/**
 * Checks if the role or member is considered a moderator by checking their permissions.
 * @param {Role|GuildMember} roleOrMember A role or member.
 * @param {boolean} noAdmin Whether to skip the `ADMINISTRATOR` permission or not.
 */
function isMod(roleOrMember, noAdmin) {
    if (!roleOrMember) return
    const { permissions } = roleOrMember

    const conditions = [
        'BAN_MEMBERS', 'DEAFEN_MEMBERS', 'KICK_MEMBERS', 'MANAGE_CHANNELS', 'MANAGE_EMOJIS_AND_STICKERS', 'MANAGE_GUILD',
        'MANAGE_MESSAGES', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'MANAGE_THREADS', 'MANAGE_WEBHOOKS', 'MOVE_MEMBERS',
        'MUTE_MEMBERS'
    ]

    const values = []
    if (noAdmin) {
        for (const condition of conditions) {
            values.push(permissions.has(condition))
        }
        const isTrue = values.filter(b => b === true)[0] ?? false
        return !permissions.has('ADMINISTRATOR') && isTrue
    }

    for (const condition of conditions) {
        values.push(permissions.has(condition))
    }
    const isTrue = values.filter(b => b === true)[0] ?? false
    return isTrue
}

/**
 * Gets the mod permissions from a role or member.
 * @param {Role|GuildMember} roleOrMember A role or member.
 */
function getKeyPerms(roleOrMember) {
    if (!roleOrMember) return
    const perms = roleOrMember.permissions

    if (perms.has('ADMINISTRATOR')) return 'Administrator'

    const filter = [
        'BAN_MEMBERS', 'DEAFEN_MEMBERS', 'KICK_MEMBERS', 'MANAGE_CHANNELS', 'MANAGE_EMOJIS_AND_STICKERS', 'MANAGE_GUILD',
        'MANAGE_MESSAGES', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'MANAGE_THREADS', 'MANAGE_WEBHOOKS', 'MOVE_MEMBERS',
        'MUTE_MEMBERS'
    ]

    const filtered = perms.toArray().filter(perm => filter.includes(perm))
    if (filtered.length === 0) return 'None'

    return filtered.map(perm => permissions[perm.toString()]).join(', ')
}

/**
 * Format's a permission into a string.
 * @param {string} perm The permission to format.
 * @param {boolean} [codeLike] If the resulting string should be surrounded by \`these\`.
 */
function removeUnderscores(perm, codeLike) {
    const string = capitalize(perm.replace(/_/g, ' '))

    if (codeLike) return `\`${string}\``
    return string
}

/**
 * Capitalizes every word of a string.
 * @param {string} str The string to capitalize.
 */
function capitalize(str) {
    if (!str) return ''

    const splitStr = str.toLowerCase().split(/ +/)
    for (let i = 0; i < splitStr.length; i++) {
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

    let es
    for (const end of ['ch', 'sh', 's', 'x', 'z']) {
        if (string.endsWith(end)) es = true
    }

    if (!showNum) return string + (es ? 'es' : 's')
    return `${number} ${string}${es ? 'es' : 's'}`
}

/**
 * Removes Discord's formatting from a string.
 * @param {string} str The string.
 */
function remDiscFormat(str) {
    if (!str) return ''
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
 * @deprecated
 */
function formatDate(date) {
    const timeFormat = new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'UTC',
        // timeZoneName: 'short'
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
 * @deprecated
 */
function getDateDiff(date) {
    const milliseconds = Math.abs(Date.now() - date)

    // [years, months, days, hours, minutes, seconds]
    const difference = new Date(milliseconds).toISOString().replace(/T|:/g, '-')
        .substring(0, 19).split('-').map(v => Number(v))
    let [years, months, days, hours, minutes, seconds] = difference

    years -= 1970 // makes sure the year starts on 0

    return [years + 'y', --months + 'mo', --days + 'd', hours + 'h', minutes + 'm', seconds + 's']
        .filter(value => !value.startsWith('0'))
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
 * Compares if two arrays have the same values. *It does not check for nested values*.
 * @param {array} first The first array.
 * @param {array} second The second array.
 * @returns {boolean}
 */
function arrayEquals(first, second) {
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
 * Compares and returns the difference between a set of arrays
 * @param {any[]} Old The old array
 * @param {any[]} New The new array
 */
function compareArrays(oldArr = [], newArr = []) {
    const arr1 = newArr.filter(val => !oldArr.includes(val))
    const arr2 = oldArr.filter(val => !newArr.includes(val))
    return [arr1, arr2]
}

/**
 * Loops over every element contained on both arrays and checks wether they have common elements.
 * @param {array} first The first array.
 * @param {array} second The second array.
 * @returns {boolean}
 */
function findCommonElement(first, second) {
    for (let i = 0; i < first?.length; i++) {
        for (let j = 0; j < second?.length; j++) {
            if (first[i] === second[j]) return true
        }
    }
    return false
}

/**
 * Removes all duplicated items in an array
 * @param {any[]} arr The array to filter
 */
function removeDuplicated(arr) {
    return [...new Set(arr)]
}

/**
 * Compares if two objects are equal and returns the differences.
 * @param {object} first The first object.
 * @param {object} second The second object.
 * @returns {object}
 */
function difference(first, second) {
    function changes(newObj, origObj) {
        let arrayIndexCounter = 0
        return transform(newObj, function (result, value, key) {
            if (!isEqual(value, origObj[key])) {
                const resultKey = isArray(origObj) ? arrayIndexCounter++ : key
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
    if (!str.includes('.') || !str.includes('/')) return false

    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator

    return pattern.test(str)
}

/**
 * Bans an user.
 * @param {CommandoGuild} guild The guild where the user is being banned.
 * @param {User} bot The bot user.
 * @param {User} user The user to ban.
 * @param {string} reason The reason of the ban.
 * @deprecated
 */
async function ban(guild, bot, user, reason = 'No reason given.') {
    const { members, id: guildId, name: guildName } = guild

    const member = members.cache.get(user.id)

    if (reason.length > 512 || !member?.bannable || isMod(member)) return

    if (member && !user.bot) {
        await user.send(stripIndent`
            You have been **banned** from **${guildName}**
            **Reason:** ${reason}
            **Moderator:** ${bot.tag} - Auto-moderation system
        `).catch(() => null)
    }

    await members.ban(user, { days: 7, reason: reason }).catch(() => null)

    const doc = {
        _id: docId(),
        type: 'ban',
        guild: guildId,
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
 * @deprecated
 */
async function tempban(guild, bot, user, time, reason = 'No reason given.') {
    const { members, channels, name: guildName, id: guildId } = guild

    const member = members.cache.get(user.id)

    if (reason.length > 512 || !member?.bannable || isMod(member)) return

    const duration = myMs(time, { long: true })

    if (member && !user.bot) {
        const invite = await channels.cache.filter(({ type }) =>
            !['category', 'store'].includes(type)
        ).first().createInvite({ maxAge: 0, maxUses: 1 })
        await user.send(stripIndent`
            You have been **banned** from **${guildName}** for **${duration}**
            **Reason:** ${reason}
            **Moderator:** ${bot.tag} - Auto-moderation system
            
            Feel free to join back when your ban expires: ${invite.toString()}
        `).catch(() => null)
    }

    await members.ban(user, { days: 7, reason: reason }).catch(() => null)

    const doc1 = {
        _id: docId(),
        type: 'temp-ban',
        guild: guildId,
        user: user.id,
        mod: bot.id,
        reason: reason,
        duration: duration
    }

    const doc2 = {
        type: 'temp-ban',
        guild: guildId,
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
 * @deprecated
 */
async function kick(guild, bot, member, reason = 'No reason given.') {
    const { channels, name: guildName, id: guildId } = guild

    if (reason.length > 512 || !member.kickable || isMod(member)) return

    if (!member.user.bot) {
        const invite = await channels.cache.filter(ch =>
            !['category', 'store'].includes(ch.type)
        ).first().createInvite({ maxAge: 604800, maxUses: 1 })
        await member.send(stripIndent`
            You have been **kicked** from **${guildName}**
            **Reason:** ${reason}
            **Moderator:** ${bot} - Auto-moderation system
            
            Feel free to join back: ${invite.toString()}
            *This invite will expire in 1 week.*
        `).catch(() => null)
    }

    await member.kick(reason).catch(() => null)

    const doc = {
        _id: docId(),
        type: 'kick',
        guild: guildId,
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
 * @deprecated
 */
async function mute(guild, bot, member, role, time, reason = 'No reason given.') {
    const { name: guildName, id: guildId } = guild

    if (reason.length > 512 || !member.manageable || isMod(member) || member.roles.cache.has(role.id)) return

    const duration = myMs(time, { long: true })

    if (!member.user.bot) {
        await member.send(stripIndent`
            You have been **muted** on **${guildName}** for **${duration}**
            **Reason:** ${reason}
            **Moderator:** ${bot.tag} - Auto-moderation system
        `).catch(() => null)
    }

    await member.roles.add(role).catch(() => null)

    const doc1 = {
        _id: docId(),
        type: 'mute',
        guild: guildId,
        user: member.id,
        mod: bot.id,
        reason: reason,
        duration: duration
    }

    const doc2 = {
        type: 'mute',
        guild: guildId,
        user: member.id,
        duration: Date.now() + time
    }

    await new moderations(doc1).save()
    await new active(doc2).save()
}

/**
 * Validates a {@link Role} to be used in commands
 * @param {CommandoMessage} msg The message instance
 * @param {Role} role The role to validate
 */
function isValidRole(msg, role) {
    if (!(role instanceof Role)) return false
    if (!role) return false
    if (role.managed) return false

    const { member, client, author, guild } = msg
    const botId = client.user.id

    const botManageable = guild.me.roles.highest.comparePositionTo(role)
    if (botManageable < 1) return false

    const isOwner = author.id === botId
    if (isOwner) return true

    const memberManageable = member.roles.highest.comparePositionTo(role)
    if (memberManageable < 1) return false
    if (isMod(role)) return false

    return true
}

/**
 * Creates a random Mongo document id.
 * @returns {string}
 */
function docId() {
    const int = Math.floor(Math.random() * (2 ** 48))
    return int.toString(16)
}

/**
 * @typedef {(start: number, filter?: string) => Promise<{embed: MessageEmbed, total: number}>} TemplateEmbedFunction
 */

/**
 * Creates a basic paged embed with the template provided.
 * @param {CommandInstances} instances The instances for this embed
 * @param {object} data The number of pages the embed should have.
 * @param {number} data.number The number of chunks of data to be displayed in one page.
 * @param {number} data.total The total chunks of data.
 * @param {boolean} [data.toUser=false] Whether to send the embed to the user DMs or not.
 * @param {string} [data.dmMsg=''] Whether to send the embed to the user DMs or not.
 * @param {MessageActionRow[]} [data.components=[]] The components to attatch to the message
 * @param {boolean} [data.skipMaxButtons=false] Whether to skip the page start and page end buttons
 * @param {TemplateEmbedFunction} template The embed template to use.
 */
async function pagedEmbed({ message, interaction }, data, template) {
    const { channel, id } = message || interaction
    const author = message?.author || interaction.user
    const isDMs = channel.type === 'DM'
    const targetChan = data.toUser ? await author.createDM() : channel

    if (!data.components) {
        data.components = []
    }

    const ids = {
        start: `${id}:page_start`,
        down: `${id}:page_down`,
        up: `${id}:page_up`,
        end: `${id}:page_end`
    }

    const pageStart = new MessageButton()
        .setStyle('PRIMARY')
        .setCustomId(ids.start)
        .setEmoji('⏪')
        .setDisabled()
    const pageDown = new MessageButton()
        .setStyle('PRIMARY')
        .setCustomId(ids.down)
        .setEmoji('⬅️')
        .setDisabled()
    const pageUp = new MessageButton()
        .setStyle('PRIMARY')
        .setCustomId(ids.up)
        .setEmoji('➡️')
    const pageEnd = new MessageButton()
        .setStyle('PRIMARY')
        .setCustomId(ids.end)
        .setEmoji('⏩')

    const buttons = data.total <= data.number ? null : new MessageActionRow()
        .addComponents(data.skipMaxButtons ?
            [pageDown, pageUp] : [pageStart, pageDown, pageUp, pageEnd]
        )

    if (data.toUser && !isDMs) {
        await replyAll({ message, interaction }, stripIndent`
            ${data.dmMsg || ''}
            **Didn\'t get the DM?** Then please allow DMs from server members.
        `)
    }

    if (message) await targetChan.sendTyping().catch(() => null)

    const first = await template(0)
    const msgOptions = {
        embeds: [first.embed],
        components: [...data.components, buttons].filter(c => c),
        ...noReplyInDMs(message)
    }

    /** @type {Message} */
    let msg
    if (data.toUser && !isDMs) msg = await targetChan.send(msgOptions).catch(() => null)
    else {
        if (interaction) msg = await interaction.editReply(msgOptions)
        else msg = await message.reply(msgOptions)
    }

    if (data.total <= data.number && !data.components[0]) return

    let index = 0
    const collector = targetChan.createMessageComponentCollector({
        filter: async int => {
            if (msg.id !== int.message?.id) return false
            if (!int.isButton() && !int.isSelectMenu()) return false
            if (int.user.id !== author.id) {
                await int.reply({
                    content: 'This interaction doesn\'t belong to you.', ephemeral: true
                })
                return false
            }
            return true
        },
        time: 60 * 1000
    })

    const disableButton = (target, disabled = true) => {
        const button = buttons.components.find(b => b.customId.endsWith(target))
        if (!button) return
        button.setDisabled(disabled)
    }

    /** @type {?string[]} */
    const menuOptions = data.components[0] ?
        data.components[0].components.filter(c => c instanceof MessageSelectMenu)[0].options.map(op => op.value) :
        []
    let option = 'all'

    collector.on('collect', async int => {
        if (int.isButton()) {
            const oldData = await template(index, option)
            if (typeof oldData.total !== 'number') oldData.total = data.total

            if (int.customId === ids.start) {
                index = 0
                disableButton('up', false)
                disableButton('end', false)
                disableButton('down')
                disableButton('start')
            }
            if (int.customId === ids.down) {
                index -= data.number
                disableButton('up', false)
                disableButton('end', false)
                if (index === 0) {
                    disableButton('down')
                    disableButton('start')
                }
            }
            if (int.customId === ids.up) {
                index += data.number
                disableButton('down', false)
                disableButton('start', false)
                if (index >= oldData.total - data.number) {
                    disableButton('up')
                    disableButton('end')
                }
            }
            if (int.customId === ids.end) {
                const newIndex = oldData.total - (oldData.total % data.number)
                index = oldData.total === newIndex ? newIndex - data.number : newIndex
                disableButton('down', false)
                disableButton('start', false)
                disableButton('up')
                disableButton('end')
            }
            const templateData = await template(index, option)

            return await int.update({
                embeds: [templateData.embed],
                components: [...data.components, buttons].filter(c => c),
                ...noReplyInDMs(msg)
            }).catch(() => null)
        }

        if (int.isSelectMenu()) {
            option = menuOptions.find(op => op === int.values[0])
            const templateData = await template(0, option)
            disableButton('up', templateData.total <= data.number)
            disableButton('end', templateData.total <= data.number)
            disableButton('down')
            disableButton('start')

            return await int.update({
                embeds: [templateData.embed],
                components: [...data.components, buttons].filter(c => c),
                ...noReplyInDMs(msg)
            }).catch(() => null)
        }
    })

    collector.on('end', async () => {
        if (msg) await msg.edit({ components: [] }).catch(() => null)
        else interaction.editReply({ components: [] }).catch(() => null)
    })
}

/**
 * Generates a paged embed based off the `array` and `embedOptions`
 * @param {CommandInstances} instances The instances for this embed
 * @param {array} array The array that contains the data to be displayed
 * @param {object} data Some extra data for the embed
 * @param {number} [data.number=6] The number of chunks to display per page
 * @param {string} [data.color='#4c9f4c'] The color of the embed
 * @param {string} [data.embedTitle] The title of the embed
 * @param {string} [data.authorName] The name of the author
 * @param {string} [data.authorIconURL=null] The icon URL of the author
 * @param {string} [data.title=''] The title of each section in the embed
 * @param {boolean} [data.useDescription=false] Whether to use `setDescription()` or not
 * @param {MessageActionRow[]} [data.components=[]] The components to attatch to the message
 * @param {boolean} [data.inLine=false] Whether the data should be displayed inline in the embed
 * @param {boolean} [data.toUser=false] Whether to send the embed to the user DMs or not
 * @param {boolean} [data.dmMsg=''] The message to send to the user in DMs. Only if `toUser` is true
 * @param {boolean} [data.skipMaxButtons=false] Whether to skip the page start and page end buttons
 * @param {boolean} [data.hasObjects] Whether `array` contains objects inside or not
 * @param {boolean} [data.numbered] Whether to number the items or not
 * @param {object} [data.keyTitle={}] A custom key data to use from the nested objects on the title
 * @param {string} [data.keyTitle.suffix] The name of the key to use as a suffix
 * @param {string} [data.keyTitle.prefix] The name of the key to use as a prefix
 * @param {string[]} [data.keys=undefined] The properties to display in the embed. If empty I will use every property
 * @param {string[]} [data.keysExclude=[]] The properties to exclude on the embed.
 * If empty I will use `data.keys` or every property
 * @param {boolean} [data.useDocId=false] Whether to use the document's id on each data chunk
 */
async function generateEmbed({ message, interaction }, array, data) {
    const {
        number = 6, color = '#4c9f4c', authorName, authorIconURL = null, useDescription = false,
        title = '', inLine = false, toUser = false, dmMsg = '', hasObjects = true, keyTitle = {},
        keys, keysExclude = [], useDocId = false, components = [], embedTitle, skipMaxButtons = false,
        numbered = false
    } = data

    if (array.length === 0) throw new Error('array cannot be empty')
    keysExclude.push(...[keyTitle.prefix, keyTitle.suffix, '_id', '__v'])

    /** @param {number} start @param {string} [filter] */
    async function createEmbed(start, filter) {
        const _array = filter ? (
            filter === 'all' ? array :
                array.filter(doc => doc.type === filter)
        ) : array

        const pages = Math.trunc(_array.length / number) + ((_array.length / number) % 1 === 0 ? 0 : 1)
        const current = _array.slice(start, start + number)

        const embed = new MessageEmbed()
            .setColor(color.toUpperCase())
            .setTimestamp()

        if (embedTitle) embed.setTitle(embedTitle)
        if (authorName) embed.setAuthor(authorName, authorIconURL)
        if (pages > 1) embed.setFooter(`Page ${Math.round(start / number + 1)} of ${pages}`)
        if (useDescription) {
            return {
                embed: embed.setDescription(current.join('\n')),
                total: _array.length
            }
        }

        if (_array.length === 0) {
            return {
                embed: embed.addField('There\'s nothing to see here', 'Please try with another filter.'),
                total: _array.length
            }
        }

        const { channels } = (message || interaction).client

        let index = 0
        for (const item of current) {
            const objFilter = key => (keys ? keys.includes(key) : key) && !keysExclude.includes(key)
            const objKeys = hasObjects ? Object.keys(item._doc || item).filter(objFilter) : []

            const docId = useDocId ? item._doc?._id || item._id : null
            const numberPrefix = numbered ? `${start + index + 1}.` : ''
            const prefix = capitalize(item[keyTitle?.prefix] || null)
            const suffix = docId ||
                (
                    item[keyTitle?.suffix] && typeof item[keyTitle?.suffix] !== 'string' ?
                        timestamp(item[keyTitle?.suffix] / 1) : null
                ) ||
                item[keyTitle?.suffix] || start + index + 1

            const value = []
            for (const key of objKeys) {
                if (objKeys.length === 1) {
                    value.push(item[key])
                    break
                }

                const propName = capitalize(key.replace('createdAt', 'date'))

                const userStr = key === 'userId' ? `<@${item.userId}> ${item.userTag}` : null
                const modStr = key === 'modId' ? `<@${item.modId}> ${item.modTag}` : null
                /** @type {GuildChannel} */
                const channel = key === 'channel' ? channels.resolve(item[key]) : null

                const created = key === 'createdAt' ? timestamp(item[key]) : null
                const duration = key === 'duration' && Number(item[key]) ?
                    myMs(item[key], { long: true, length: 2, showAnd: true }) : null
                const endsAt = key === 'endsAt' ? `${timestamp(item[key])} (${timestamp(item[key], 'R')})` : null

                const docData = userStr || modStr || channel?.toString() || created || duration || endsAt || item[key]

                value.push(`**>** **${propName}:** ${docData}`)
            }

            embed.addField(
                `${numberPrefix} ${prefix} ${title} ${suffix}`.replace(/ +/g, ' '),
                `${value.length !== 0 ? value.join('\n') : item}`,
                inLine
            )
            index++
        }

        return { embed: embed, total: _array.length }
    }

    await pagedEmbed(
        { message, interaction },
        { number, total: array.length, toUser, dmMsg, components, skipMaxButtons },
        createEmbed
    )
}

/**
 * Creates and manages confirmation buttons (y/n) for moderation actions
 * @param {CommandInstances} instances The instances for these buttons
 * @param {string} action The action for confirmation
 * @param {User|string|CommandoGuild} [target] The target on which this action is being executed
 * @param {object} [data] The data of this action
 * @param {string} [data.reason] The reason of this action
 * @param {string} [data.duration] The duration of this action
 * @param {boolean} [sendCancelled=true] Whether to send 'Cancelled command.' or not
 */
async function confirmButtons({ message, interaction }, action, target, data = {}, sendCancelled = true) {
    const { id } = message || interaction
    const author = message?.author || interaction.user

    const ids = { yes: `${id}:yes`, no: `${id}:no` }
    const targetStr = target instanceof User ? target.tag :
        target instanceof CGuildClass ? target.name : target || null

    const confirmEmbed = new MessageEmbed()
        .setColor('GOLD')
        .setFooter('The command will automatically be cancelled in 30 seconds.')

    if (!targetStr && Object.keys(data).length === 0) {
        confirmEmbed.setDescription(`**Are you sure you want to ${action}?**`)
    } else {
        confirmEmbed.addField(
            `Are you sure you want to ${action}${targetStr ? ` ${targetStr}` : ''}?`,
            stripIndent`
                ${!targetStr ? '' : target instanceof User ? stripIndent`
                    **User:** ${target.toString()} ${target.tag}
                    **Id:** ${target.id}
                ` : `**Target:** ${targetStr}`}
                **Action:** ${action}
                ${data.reason ? `**Reason:** ${data.reason}` : ''}
                ${data.duration ? `**Duration:** ${data.duration}` : ''}
            `
        )
    }

    const yesButton = new MessageButton()
        .setStyle('SUCCESS')
        .setCustomId(ids.yes)
        .setEmoji(customEmoji('check'))
    const noButton = new MessageButton()
        .setStyle('DANGER')
        .setCustomId(ids.no)
        .setEmoji(customEmoji('cross'))

    /** @type {Message} */
    let msg
    const msgData = {
        embeds: [confirmEmbed],
        components: [new MessageActionRow().addComponents(yesButton, noButton)],
        ...noReplyInDMs(message)
    }
    if (interaction) msg = await interaction.editReply(msgData)
    else msg = await message.reply(msgData)

    const pushed = await msg.awaitMessageComponent({
        filter: async int => {
            if (msg.id !== int.message?.id) return false
            if (int.user.id !== author.id) {
                await int.reply({
                    content: 'This interaction doesn\'t belong to you.', ephemeral: true
                })
                return false
            }
            return true
        },
        time: myMs('30s'),
        componentType: 'BUTTON'
    }).catch(() => null)

    if (message) await msg?.delete()

    await interaction?.editReply({ components: [] })

    if (!pushed || pushed.customId === ids.no) {
        if (sendCancelled) {
            await replyAll({ message, interaction }, {
                content: 'Cancelled command.', embeds: []
            })
        }
        return false
    }

    await message?.channel.sendTyping().catch(() => null)
    return true
}

/**
 * Creates an embed containing the information about the command.
 * @param {Command} cmd The command to get information from.
 * @param {CommandoGuild} guild The guild where the command is used.
 */
function commandInfo(cmd, guild) {
    const { prefix: _prefix, user, owners } = cmd.client
    const {
        name, description, details, examples, aliases, group, guarded, throttling, ownerOnly, guildOnly,
        dmOnly, deprecated, replacing, slash
    } = cmd

    const prefix = guild?.prefix || _prefix

    const usage = cmd.format?.split('\n').map(format => {
        if (format.startsWith('<') || format.startsWith('[')) {
            return `**>** \`${prefix + name} ${format}\``
        }

        const [cmd, desc] = format.split(' - ')
        const str = `**>** \`${prefix + cmd}\``

        if (desc) return str + ' - ' + desc
        return str
    }).join('\n') || `**>** \`${prefix + name}\``

    const clientPermissions = cmd.clientPermissions?.map(perm => permissions[perm]).join(', ')
    const userPermissions = cmd.userPermissions?.map(perm => permissions[perm]).join(', ')

    const embed = new MessageEmbed()
        .setColor('#4c9f4c')
        .setAuthor(
            `Information for command: ${name} ${deprecated ? '(Deprecated)' : ''}`,
            user.displayAvatarURL({ dynamic: true })
        )
        .setDescription(stripIndent`
            ${deprecated ? oneLine`
                **This command has been marked as deprecated, which means it will be removed in future updates.
                Please start using the \`${replacing}\` command from now on.**
            ` : ''}
            ${description}
            ${details ? `\n>>> ${details}` : ''}
        `)
        .addField('Usage', usage)
        .setFooter(
            `Version: ${version} | Developer: ${owners[0].tag}`,
            user.displayAvatarURL({ dynamic: true })
        )

    if (examples) embed.addField('Examples', examples.map(ex => `**>** \`${prefix + ex}\``).join('\n'))

    const information = {
        Category: group.name,
        Aliases: aliases.join(', ') || null,
        Slash: slash ? 'Yes' : 'No',
        Cooldown: throttling ?
            `${pluralize('usage', throttling.usages)} per ${myMs(throttling.duration * 1000, { long: true })}` :
            null,
        Guarded: guarded ? 'Yes' : 'No',
        Status: !guarded ? (cmd.isEnabledIn(guild) ? 'Enabled' : 'Disabled') : null,
        'Server only': guildOnly ? 'Yes' : null,
        'DMs only': dmOnly ? 'Yes' : null,
        'Bot perms': clientPermissions || null,
        'User perms': userPermissions || (ownerOnly ? 'Bot\'s owner only' : null)
    }

    const info = []
    for (const prop in information) {
        if (!information[prop]) continue
        info.push(`**>** **${prop}:** ${information[prop]}`)
    }

    const first = info.splice(0, Math.round(info.length / 2 + 0.1))

    embed.addFields(
        { name: 'Information', value: first.join('\n'), inline: true },
        { name: '\u200B', value: info.join('\n'), inline: true }
    )

    return embed
}

module.exports = {
    abcOrder,
    addDashes,
    arrayEquals,
    ban,
    basicCollector,
    basicEmbed,
    capitalize,
    code,
    confirmButtons,
    commandInfo,
    compareArrays,
    customEmoji,
    difference,
    docId,
    fetchPartial,
    findCommonElement,
    formatBytes,
    formatDate,
    generateEmbed,
    getArgument,
    getDateDiff,
    getDayDiff,
    getKeyPerms,
    getLogsChannel,
    inviteButton,
    isMod,
    isModuleEnabled,
    isValidRole,
    kick,
    memberException,
    mute,
    pagedEmbed,
    pluralize,
    probability,
    remDiscFormat,
    removeDashes,
    removeDuplicated,
    removeUnderscores,
    replyAll,
    noReplyInDMs,
    sleep,
    sliceDots,
    sliceFileName,
    tempban,
    userException,
    validURL
}