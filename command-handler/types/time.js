const ArgumentType = require('./base')

class TimeArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'time')
        this.regex = new RegExp(
            '([0-2]?\\d(?::[0-5]?\\d)?)?' + // time/hour
            '([aApP]\\.?[mM]\\.?)?' + // am pm
            '(?:\\s+)?' + // space
            '([+-]\\d\\d?)?$' // time zone offset
        )
    }

    /**
     * @param {string} val Value to validate
     * @return Whether the value is valid
     */
    validate(val) {
        const date = parseDate(val.match(this.regex)?.slice(1, 4), val)
        if (!date) {
            return 'Please enter a valid date format. Use the `help` command for more information.'
        }

        return true
    }

    /**
     * @param {string} val Value to parse
     * @return Usable value
     */
    parse(val) {
        return parseDate(val.match(this.regex)?.slice(1, 4), val)
    }
}

module.exports = TimeArgumentType

/**
 * @param {string[]} matches
 * @param {string} val
 */
function parseDate(matches, val) {
    if (val.toLowerCase() === 'now') return new Date()

    if (!matches) return null
    if (matches.length === 0) return null
    const defDate = new Date()

    const dateNums = [defDate.getUTCFullYear(), defDate.getUTCMonth(), defDate.getUTCDate()]
    const timeNums = matches[0]?.split(':').map((s, i) => {
        const parsed = parseInt(s)
        if (i !== 0) return parsed

        const tzOffset = new Date().getTimezoneOffset() / 60
        const offset = tzOffset + parseInt(matches[2] ?? 0)

        const ampm = matches[1]?.toLowerCase().replace(/\./g, '')
        const formatter = ampm ? (ampm === 'am' ? 0 : 12) : 0

        if (formatter === 12 && parsed === 12) {
            return parsed - offset
        }
        return parsed + formatter - offset
    }) || [defDate.getUTCHours(), defDate.getUTCMinutes()]
    const arr = [...dateNums, ...timeNums].filter(n => typeof n !== 'undefined')
    const date = new Date(...arr)
    return date
}
