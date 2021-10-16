const { myMs } = require('../../utils')
const ArgumentType = require('./base')
const regex = /^([0-2]?\d(?::[0-5]?\d)?)?([aApP]\.?[mM]\.?)?$/
const timeParser = new Map([
    ['am', 0],
    ['a.m.', 0],
    ['pm', 12],
    ['p.m.', 12],
    [undefined, 0],
    [null, 0],
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
        const date = this._parseDate(val.match(regex)?.slice(1, 4))
        if (!Boolean(date)) {
            return 'Please enter a valid date format. Use the `help` command for more information.'
        }

        return true
    }

    /**
     * @param {string} val Value to parse
     * @return Usable value
     */
    parse(val) {
        return this._parseDate(val.match(regex)?.slice(1, 3))
    }

    /**
     * @param {string[]} matches
     * @private
     */
    _parseDate(matches) {
        if (!matches) return null
        if (matches.length === 0) return null
        const defDate = new Date()

        const dateNums = [defDate.getUTCFullYear(), defDate.getUTCMonth(), defDate.getUTCDate()]
        const timeNums = matches[0]?.split(':').map((s, i) => {
            if (i === 0) {
                const formatter = timeParser.get(matches[1]?.toLowerCase())
                const parsed = Number.parseInt(s)
                if (formatter === 12 && parsed === 12) {
                    return parsed - tzOffset
                }
                return parsed + formatter - tzOffset
            }
            return Number.parseInt(s)
        }) || [defDate.getUTCHours(), defDate.getUTCMinutes()]
        const arr = [...dateNums, ...timeNums].filter(n => n !== undefined)
        const date = new Date(...arr)
        return date
    }
}

module.exports = TimeArgumentType