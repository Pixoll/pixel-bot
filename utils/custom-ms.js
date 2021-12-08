const s = 1000
const m = s * 60
const h = m * 60
const d = h * 24
const w = d * 7
const y = d * 365.25
const mth = y / 12

/**
 * Parses the milliseconds into a string, or a string into milliseconds
 * @param {number|string} val The amount of milliseconds or string to parse
 * @param {object} [options] Only appliable if the input is a number
 * @param {boolean} [options.number=false] Whether to force the returned value to be a number or not
 * @param {boolean} [options.long=false] If the string should return the whole words
 * @param {number} [options.length] How many parameters should the string return
 * @param {boolean} [options.showMs=false] If the string should show the `ms`
 * @param {boolean} [options.showAnd=false] If the string should show and before the last item
 * @param {boolean} [options.noCommas=false] If the string should **not** have commas
 * @returns {string|number}
 */
function myMs(val, options = {}) {
    if (val === undefined || val === null) return
    if (!['number', 'string'].includes(typeof val)) throw new TypeError('Expected a number or string.')

    const isNumber = !!Number(val) || Number(val) === 0

    if (options.number) {
        if (isNumber) return Math.abs(Number(val))
        return _parse(val)
    }

    if (typeof val === 'string' && !isNumber) {
        const ms = _parse(val)
        return ms
    }

    const obj = {
        year: Math.trunc(val / y),
        month: Math.trunc(val / mth) % 12,
        week: Math.trunc(Math.trunc(val / w) % 4.345),
        day: Math.trunc(val / d) % 7,
        hour: Math.trunc(val / h) % 24,
        minute: Math.trunc(val / m) % 60,
        second: Math.trunc(val / s) % 60,
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
        } else {
            let char = prop.charAt(0)
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

    const commas = options.noCommas ? '' : ', '
    if (options.length) return and(arr.slice(0, options.length).join(commas))
    return and(arr.join(commas))
}

/**
 * Parses the specified time into a Discord template
 * @param {number|Date} time The time to parse (in milliseconds)
 * @param {'t'|'T'|'d'|'D'|'f'|'F'|'R'} [format] The format of the timestamp
 * - `t`: Short time ➜ `16:20`
 * - `T`: Long time ➜ `16:20:30`
 * - `d`: Short date ➜ `20/04/2021`
 * - `D`: Long date ➜ `20 April 2021`
 * - `f`: Short date/time ➜ `20 April 2021 16:20`
 * - `F`: Long date/time ➜ `Tuesday, 20 April 2021 16:20`
 * - `R`: Relative time ➜ `2 months ago`
 */
function timestamp(time, format = 'f') {
    if (!time) return
    if (time instanceof Date) time = time.getTime()

    const trunc = Math.trunc(time / 1000)
    const rem = trunc % 60
    const roundUp = rem >= 20
    const epoch = trunc - rem + (roundUp ? 60 : 0)

    return `<t:${epoch}:${format}>`
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
        this.offset = isNumber ? val : myMs(val)

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
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZone: 'UTC',
            // timeZoneName: 'short'
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
    let duration = Math.abs((Date.now() - earlier) / 1000)

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

module.exports = {
    Duration,
    myMs,
    toNow,
    timestamp
}

/**
 * Parses the string into milliseconds
 * @param {string} str The string to parse
 * @private
 */
function _parse(str) {
    if (typeof str !== 'string') throw new TypeError('Expected a string.')

    const regex = new RegExp(
        '(-?(?:\\d+)?\\.?\\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|' +
        'minutes?|mins?|hours?|hrs?|days?|weeks?|months?|mths?|years?|yrs?|[smhdwy])?',
        'gi'
    )
    const match = str.match(regex)
    if (!match) return

    const arr = match.map((q, n, p) => regex.exec(p)).map((array) => array.splice(1))
    let number = 0

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