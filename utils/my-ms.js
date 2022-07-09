const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;
const mth = y / 12;

/**
 * Parses the milliseconds into a string, or a string into milliseconds
 * @param {number|string} val The amount of milliseconds or string to parse
 * @param {object} [options] Only applicable if the input is a number
 * @param {boolean} [options.number=false] Whether to force the returned value to be a number or not
 * @param {boolean} [options.long=false] If the string should return the whole words
 * @param {number} [options.length] How many parameters should the string return
 * @param {boolean} [options.showMs=false] If the string should show the `ms`
 * @param {boolean} [options.showAnd=false] If the string should show and before the last item
 * @param {boolean} [options.noCommas=false] If the string should **not** have commas
 * @returns {string|number}
 */
function myMs(val, options = {}) {
    if (typeof val === 'undefined' || val === null) return;
    if (!['number', 'string'].includes(typeof val)) throw new TypeError('Expected a number or string.');

    const isNumber = !!Number(val) || Number(val) === 0;

    if (options.number) {
        if (isNumber) return Math.abs(Number(val));
        return parseMs(val);
    }

    if (typeof val === 'string' && !isNumber) {
        const ms = parseMs(val);
        return ms;
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
    };

    const arr = [];
    for (const prop in obj) {
        const val = Math.abs(obj[prop]);
        if (typeof val !== 'number' || val === 0) continue;

        if (!options.showMs && prop === 'millisecond') continue;

        if (options.long) {
            const plural = val > 1 ? prop + 's' : prop;
            arr.push(`${val} ${plural}`);
        } else {
            let char = prop.charAt(0);
            if (prop === 'month') char = 'mth';
            if (prop === 'millisecond') char = 'ms';

            arr.push(`${val}${char}`);
        }
    }

    if (arr.length === 0) {
        if (options.long) return '0 milliseconds';
        return '0ms';
    }

    const and = str => options.showAnd ? str.replace(/,(?=[^,]*$)/, ' and') : str;

    const commas = options.noCommas ? '' : ', ';
    if (options.length) return and(arr.slice(0, options.length).join(commas));
    return and(arr.join(commas));
}

module.exports = myMs;

/**
 * Parses the string into milliseconds
 * @param {string} str The string to parse
 * @private
 */
function parseMs(str) {
    if (typeof str !== 'string') throw new TypeError('Expected a string.');

    const regex = new RegExp(
        '((?:\\d+)?\\.?\\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|'
        + 'minutes?|mins?|hours?|hrs?|days?|weeks?|months?|mths?|years?|yrs?|[smhdwy])?',
        'gi'
    );
    const match = str.match(regex);
    if (!match) return;

    const arr = match.map((q, n, p) => regex.exec(p)).map((array) => array.splice(1));
    let number = 0;

    for (const [val, char] of arr) {
        const res = Number(val);
        const type = (char || 'ms').toLowerCase();

        if (type === 'y') number += res * y;
        if (type === 'mth') number += res * mth;
        if (type === 'w') number += res * w;
        if (type === 'd') number += res * d;
        if (type === 'h') number += res * h;
        if (type === 'm') number += res * m;
        if (type === 's') number += res * s;
        if (type === 'ms') number += res;
    }

    return number;
}
