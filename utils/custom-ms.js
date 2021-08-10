const now = new Date()
const days_in_month = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
const weeks_in_month = days_in_month / 7

const s = 1000
const m = s * 60
const h = m * 60
const d = h * 24
const w = d * 7
const mth = w * weeks_in_month
const y = mth * 12

/**
 * Parses the milliseconds into a string, or a string into milliseconds
 * @param {number|string} val The amount of milliseconds or string to parse
 * @param {object} [options] Only appliable if the input is a number
 * @param {boolean} options.long If the string should return the whole words
 * @param {number} options.length How many parameters should the string return
 * @param {boolean} options.showMs If the string should show the `ms`
 * @param {boolean} options.showAnd If the string should show and before the last item
 * @returns {string|number}
 */
function ms(val, options = {}) {
    if (!val) return
    if (!['number', 'string'].includes(typeof val)) throw new TypeError('Expected a number or string.')

    const isNumber = !!Number(val) || Number(val) === 0

    if (typeof val === 'string' && !isNumber) {
        const ms = _parse(val)
        return ms
    }

    const roundToZero = val > 0 ? Math.floor : Math.ceil

    const obj = {
        year: roundToZero(val / y),
        month: roundToZero(val / mth) % 12,
        week: Math.trunc(roundToZero(val / w) % 4.345),
        day: roundToZero(val / d) % 7,
        hour: roundToZero(val / h) % 24,
        minute: roundToZero(val / m) % 60,
        second: roundToZero(val / s) % 60,
        millisecond: val % 1000,
    }

    const arr = []
    for (const prop in obj) {
        const val = Math.abs(obj[prop])
        if (typeof val !== 'number' || val === 0) continue

        if (!options.showMs && prop === 'millisecond') continue

        if (options.long) {
            const plural = val > 1 ? prop + 's' : prop
            arr.push(`${val} ${plural}`)
        }

        else {
            var char = prop.charAt(0)
            if (prop === 'month') char = 'mth'
            if (prop === 'millisecond') char = 'ms'

            arr.push(`${val}${char}`)
        }
    }

    if (arr.length === 0) {
        if (options.long) return '0 milliseconds'
        return '0ms'
    }

    const and = str => options.showAnd ? str.replace(/,(?=[^,]*$)/, ' and') : str

    if (options.length) return and(arr.slice(0, options.length).join(', '))
    return and(arr.join(', '))
}

/** Converts ms and strings into future dates */
class Duration {
    /**
     * Create a new Duration instance
     * @param {number|string} val The ms or string to parse
     */
    constructor(val) {
        const isNumber = !!Number(val) || Number(val) === 0

        /**
         * The offset
         * @type {number}
         */
        this.offset = isNumber ? val : ms(val)

        /** Get the date from now */
        this.fromNow = new Date(Date.now() + this.offset)

        /** Formats the date */
        this.format = this._formatDate(this.fromNow)
    }

    /**
     * Gives any date the following format: `30/12/2020, 23:59`
     * @param {Date|number} date The date in `Date` format or a number.
     * @private
     */
    _formatDate(date) {
        return new Intl.DateTimeFormat('en-GB', {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', timeZone: 'UTC'//, timeZoneName: 'short'
        }).format(date)
    }
}

/**
 * Shows the user friendly duration of time between a period and now
 * @param {(Date|number|string)} earlier The time to compare
 * @param {boolean} [showIn] Whether the output should be prefixed
 */
function toNow(earlier, showIn) {
    if (!(earlier instanceof Date)) earlier = new Date(earlier)
    const returnString = showIn ? 'in ' : ''
    var duration = Math.abs((Date.now() - earlier) / 1000)

    // Compare the duration in seconds
    if (duration < 45) return `${returnString}a few seconds`
    else if (duration < 90) return `${returnString}a minute`

    // Compare the duration in minutes
    duration /= 60
    if (duration < 45) return `${returnString + Math.round(duration)} minutes`
    else if (duration < 90) return `${returnString}an hour`

    // Compare the duration in hours
    duration /= 60
    if (duration < 22) return `${returnString + Math.round(duration)} hours`
    else if (duration < 36) return `${returnString}a day`

    // Compare the duration in days
    duration /= 24
    if (duration < 26) return `${returnString + Math.round(duration)} days`
    else if (duration < 46) return `${returnString}a month`
    else if (duration < 320) return `${returnString + Math.round(duration / 30)} months`
    else if (duration < 548) return `${returnString}a year`

    return `${returnString + Math.round(duration / 365)} years`
}

exports.ms = ms
exports.Duration = Duration
exports.toNow = toNow

/**
 * Parses the string into milliseconds
 * @param {string} str The string to parse
 * @private
 */
function _parse(str) {
    if (typeof str !== 'string') throw new TypeError('Expected a string.')

    const regex = /(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|mths?|years?|yrs?|[smhdwy])?/gi
    const match = str.match(regex)
    if (!match) return

    const arr = match.map((q, n, p) => regex.exec(p)).map((array) => array.splice(1))
    var number = 0

    for (const [val, char] of arr) {
        const res = Number(val)
        const type = (char || 'ms').toLowerCase()

        if (type === 'y') number += res * y
        if (type === 'mth') number += res * mth
        if (type === 'w') number += res * w
        if (type === 'd') number += res * d
        if (type === 'h') number += res * h
        if (type === 'm') number += res * m
        if (type === 's') number += res * s
        if (type === 'ms') number += res
    }

    return number
}