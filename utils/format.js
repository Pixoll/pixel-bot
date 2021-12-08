const { capitalize } = require('lodash')

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

module.exports = {
    addDashes,
    customEmoji,
    pluralize,
    removeDashes,
    sliceDots,
}