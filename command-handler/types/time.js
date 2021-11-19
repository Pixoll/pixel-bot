const ArgumentType = require('./base')

const timeMatcher = '([0-2]?\\d(?::[0-5]?\\d)?)'
const formatMatcher = '([aApP]\\.?[mM]\\.?)'
const offsetMatcher = '([+-]\\d\\d?)'
const regex = new RegExp(`^${timeMatcher}?${formatMatcher}?(?: +)?${offsetMatcher}?$`)

const timeParser = new Map([
    ['am', 0],
    ['a.m.', 0],
    ['pm', 12],
    ['p.m.', 12]
])
const tzOffset = new Date().getTimezoneOffset() / 60

class TimeArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'time')
    }

    /**
     * @param {string} val Value to validate
     * @return Whether the value is valid
     */
    validate(val) {
        const date = this._parseDate(val.match(regex)?.slice(1, 4), val)
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
        return this._parseDate(val.match(regex)?.slice(1, 4), val)
    }

    /**
     * @param {string[]} matches
     * @param {string} val
     * @private
     */
    _parseDate(matches, val) {
        if (val.toLowerCase() === 'now') return new Date()

        if (!matches) return null
        if (matches.length === 0) return null
        const defDate = new Date()

        const dateNums = [defDate.getUTCFullYear(), defDate.getUTCMonth(), defDate.getUTCDate()]
        const timeNums = matches[0]?.split(':').map((s, i) => {
            const parsed = Number.parseInt(s)
            if (i !== 0) return parsed

            const offset = tzOffset + Number.parseInt(matches[2] ?? 0)
            const formatter = timeParser.get(matches[1]?.toLowerCase()) ?? 0
            if (formatter === 12 && parsed === 12) {
                return parsed - offset
            }
            return parsed + formatter - offset
        }) || [defDate.getUTCHours(), defDate.getUTCMinutes()]
        const arr = [...dateNums, ...timeNums].filter(n => n !== undefined)
        const date = new Date(...arr)
        return date
    }
}

module.exports = TimeArgumentType