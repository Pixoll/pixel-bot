/* eslint-disable no-unused-vars */
const {
    MessageEmbed, GuildMember, User, Role, MessageOptions, GuildChannel, Message, ColorResolvable, AwaitMessagesOptions,
    MessageActionRow, MessageButton, Invite, MessageSelectMenu, Util
} = require('discord.js')
const { CommandoMessage, CommandoGuild, Command, Argument, CommandInstances } = require('../command-handler/typings')
const CGuildClass = require('../command-handler/extensions/guild')
const { transform, isEqual, isArray, isObject, capitalize } = require('lodash')
const { stripIndent } = require('common-tags')
const myMs = require('./my-ms')
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
    const rest = arr.map(capitalize).join('')
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
            status.push(!!check[prop])
        }
        return !!status.filter(b => b)[0]
    }
    return !!check
}

/**
 * A custom emoji.
 * @typedef {'cross'|'check'|'info'|'neutral'|'loading'|'boost'|'bot'|'online'|'dnd'|'idle'|'invis'} CustomEmoji
 */

/**
 * Returns a certain emoji depending on the specified string.
 * @param {CustomEmoji} [emoji] The emoji you want to get.
 * @param {boolean} [animated] If the emoji you want is animated.
 * @returns {string}
 */
function customEmoji(emoji = '', animated = false) {
    if (!emoji) return ''

    switch (emoji) {
        case 'boost': return '<a:boost:806364586231595028>'
        case 'bot': return '<:bot1:893998060965883904><:bot2:893998060718399528>'
        case 'check': {
            if (animated) return '<a:check:863118691808706580>'
            return '<:check:802617654396715029>'
        }
        case 'cross': {
            if (animated) return '<a:cross:863118691917889556>'
            return '<:cross:802617654442852394>'
        }
        case 'dnd': return '<:dnd:806022690284240936>'
        case 'idle': return '<:idle:806022690443624458>'
        case 'info': return '<:info:802617654262890527>'
        case 'invis': return '<:invis:806022690326315078>'
        case 'loading': return '<a:loading:863666168053366814>'
        case 'neutral': return '<:neutral:819395069608984617>'
        case 'online': return '<:online:806022690196291625>'
        default: return emoji
    }
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

    emoji = customEmoji(emoji)

    const embed = new MessageEmbed()
        .setColor(typeof color === 'string' ? color.toUpperCase() : color)

    if (description) embed.setDescription(`${emoji} ${description}`)
    if (fieldName) {
        if (!fieldValue) throw new Error('The argument fieldValue must be specified')
        embed.addField(`${emoji} ${fieldName}`, fieldValue)
    }
    if (footer) embed.setFooter(footer)

    return embed
}

/**
 * Parses the specified time into a Discord template
 * @param {number|Date} time The time to parse (in milliseconds)
 * @param {'t'|'T'|'d'|'D'|'f'|'F'|'R'} [format='f'] The format of the timestamp
 * - `t`: Short time ➜ `16:20`
 * - `T`: Long time ➜ `16:20:30`
 * - `d`: Short date ➜ `20/04/2021`
 * - `D`: Long date ➜ `20 April 2021`
 * - `f`: Short date/time ➜ `20 April 2021 16:20`
 * - `F`: Long date/time ➜ `Tuesday, 20 April 2021 16:20`
 * - `R`: Relative time ➜ `2 months ago`
 * @param {?boolean} [exact=false] Whether the timestamp should be exact and not rounded
 */
function timestamp(time, format = 'f', exact = false) {
    if (!time) return
    if (time instanceof Date) time = time.getTime()

    const trunc = Math.trunc(time / 1000)
    if (exact) return `<t:${trunc}:${format}>`

    const rem = trunc % 60
    const roundUp = rem >= 20
    const epoch = trunc - rem + (roundUp ? 60 : 0)

    return `<t:${epoch}:${format}>`
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
        if (interaction.deferred || interaction.replied) return await interaction.editReply(options).catch(() => null)
        else return await interaction.reply(options).catch(() => null)
    }
    if (message) {
        return await message.reply({ ...options, ...noReplyInDMs(message) }).catch(() => null)
    }
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

    const toDelete = await replyAll({ message, interaction }, basicEmbed(embedOptions))

    const messages = await (message || interaction).channel.awaitMessages(collectorOptions)
    if (message && shouldDelete) await toDelete?.delete().catch(() => null)

    if (messages.size === 0) {
        await replyAll({ message, interaction }, { content: 'You didn\'t answer in time.', embeds: [] })
        return null
    }
    if (messages.first().content.toLowerCase() === 'cancel') {
        await replyAll({ message, interaction }, { content: 'Cancelled command.', embeds: [] })
        return null
    }

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
 * @param {GuildMember} member The targeted member
 * @param {GuildMember} moderator The member who ran the command
 * @param {Command} cmd The command that's being ran
 * @returns {?BasicEmbedOptions}
 */
function memberException(member, moderator, { client, name }) {
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

    if (client.isOwner(moderator)) return null

    const highestTarget = member.roles.highest
    const highestMod = moderator.roles.highest
    const bannable = highestMod.comparePositionTo(highestTarget) > 0
    if (!bannable || client.isOwner(member)) {
        return {
            ...options,
            fieldName: `You can't ${name} ${member.user.tag}`,
            fieldValue: 'Please check the role hierarchy or server ownership.'
        }
    }

    if (isMod(member)) {
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

    if (permissions.has('ADMINISTRATOR')) return true

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

    return filtered.map(perm => permissions[perm]).join(', ')
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

// /**
//  * Checks if the whole embed's structure exceeds the maximum string length (6,000).
//  * @param {MessageEmbed} embed The embed to check.
//  */
// function embedExceedsMax(embed) {
//     const { title, description, fields, footer, author } = embed
//     let length = 0

//     if (title) {
//         length += title.length
//         if (length > 6000) {
//             return { exceeded: true, trigger: 'title', index: null }
//         }
//     }

//     if (description) {
//         length += description.length
//         if (length > 6000) {
//             return { exceeded: true, trigger: 'description', index: null }
//         }
//     }

//     if (footer?.text) {
//         length += footer.text.length
//         if (length > 6000) {
//             return { exceeded: true, trigger: 'footer.text', index: null }
//         }
//     }

//     if (author?.name) {
//         length += author.name.length
//         if (length > 6000) {
//             return { exceeded: true, trigger: 'author.name', index: null }
//         }
//     }

//     for (let i = 0; i < fields.length; i++) {
//         const field = fields[i]
//         length += field.name.length
//         length += field.value.length
//         if (length > 6000) {
//             return { exceeded: true, trigger: 'fields', index: i }
//         }
//     }

//     return { exceeded: false, trigger: null, index: null }
// }

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
 * @param {any[]} oldArr The old array
 * @param {any[]} newArr The new array
 * @returns {[any[], any[]]} `[added, removed]`
 */
function compareArrays(oldArr = [], newArr = []) {
    const map1 = new Map()
    oldArr.forEach(e => map1.set(e, true))
    const removed = newArr.filter(e => !map1.has(e))
    map1.clear()

    const map2 = new Map()
    newArr.forEach(e => map2.set(e, true))
    const added = oldArr.filter(e => !map2.has(e))
    map2.clear()

    return [added, removed]
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
        if (interaction) msg = await replyAll({ interaction }, msgOptions)
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
        const button = buttons?.components.find(b => b.customId.endsWith(target))
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
        else replyAll({ interaction }, { components: [] }).catch(() => null)
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
 * @param {boolean} [data.hasObjects=true] Whether `array` contains objects inside or not
 * @param {boolean} [data.numbered=false] Whether to number the items or not
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

                const propName = capitalize(key.replace('createdAt', 'date')).replace('id', '')
                if (propName.endsWith('tag')) continue

                const userStr = key === 'userId' ? `<@${item.userId}> ${item.userTag}` : null
                const modStr = key === 'modId' ? `<@${item.modId}> ${item.modTag}` : null
                /** @type {GuildChannel} */
                const channel = key === 'channel' ? channels.resolve(item[key]) : null

                const created = key === 'createdAt' ? timestamp(item[key]) : null
                const duration = key === 'duration' && Number(item[key]) ?
                    myMs(item[key], { long: true, length: 2, showAnd: true }) : null
                const endsAt = key === 'endsAt' ? `${timestamp(item[key])} (${timestamp(item[key], 'R')})` : null

                const docData = userStr || modStr || channel?.toString() || created || duration || endsAt || item[key]

                value.push(`**${propName}:** ${docData}`)
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
                    **ID:** ${target.id}
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
    if (interaction) msg = await replyAll({ interaction }, msgData)
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
        time: 30_000,
        componentType: 'BUTTON'
    }).catch(() => null)

    if (message) await msg?.delete()

    await replyAll({ interaction }, { components: [] })

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

module.exports = {
    abcOrder,
    addDashes,
    arrayEquals,
    basicCollector,
    basicEmbed,
    code,
    confirmButtons,
    compareArrays,
    customEmoji,
    difference,
    docId,
    // embedExceedsMax,
    generateEmbed,
    getArgument,
    getKeyPerms,
    inviteButton,
    isMod,
    isModuleEnabled,
    isValidRole,
    memberException,
    pagedEmbed,
    pluralize,
    replyAll,
    noReplyInDMs,
    sleep,
    sliceDots,
    timestamp,
    userException,
    validURL
}
