const { myMs } = require('../../utils')
const ArgumentType = require('./base')
const regex = /^([1-3]?\d[\/\-\.,][01]?\d[\/\-\.,]\d{2}(?:\d{2})?)?(?:[^\d]+)?([0-2]?\d(?::[0-5]?\d)?)?([aApP]\.?[mM]\.?)?$/
const timeParser = new Map([
    ['am', 0],
    ['a.m.', 0],
    ['pm', 12],
    ['p.m.', 12],
    [undefined, 0],
    [null, 0],
])
const tzOffset = new Date().getTimezoneOffset() / 60

class DateArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'date')
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

        const int = date.getTime()
        if (int <= Date.now()) {
            return 'Please enter a date that\'s in the future.'
        }
        if (int > (Date.now() + myMs('1y'))) {
            return 'The max. usable date is `1 year` in the future. Please try again.'
        }

        return true
    }

    /**
     * @param {string} val Value to parse
     * @return Usable value
     */
    parse(val) {
        return this._parseDate(val.match(regex)?.slice(1, 4))
    }

    /**
     * @param {string[]} matches
     * @private
     */
    _parseDate(matches) {
        if (!matches) return null
        if (matches.length === 0) return null
        const defDate = new Date()

        const dateNums = matches[0]?.split(/[\/\-\.,]/g).map((s, i) => {
            if (i === 1) return Number.parseInt(s) - 1
            if (i === 2) return (s.length === 2 ? Number.parseInt(s) + 2000 : Number.parseInt(s))
            return Number.parseInt(s)
        }).reverse() || [defDate.getUTCFullYear(), defDate.getUTCMonth(), defDate.getUTCDate()]
        const timeNums = matches[1]?.split(':').map((s, i) => {
            if (i === 0) {
                const formatter = timeParser.get(matches[2]?.toLowerCase())
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

module.exports = DateArgumentType