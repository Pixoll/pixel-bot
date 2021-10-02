const { Argument } = require('../typings')
const ArgumentType = require('./base')
const { myMs } = require('../../utils')

class DurationArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'duration')
    }

    /**
     * @param {string} val Value to validate
     * @param {Argument} arg Argument the value was obtained from
     * @return Whether the value is valid
     */
    validate(val, msg, arg) {
        /** @type {number} */
        const int = myMs(val, { number: true })
        if (!int) {
            return 'Please enter a valid duration format. Use the `help` command for more information.'
        }

        if (int > myMs('5y')) {
            return 'The max. usable duration is `5 years`. Please try again.'
        }

        if (arg.min !== null && typeof arg.min !== 'undefined' && int < arg.min) {
            return `Please enter a duration above or exactly ${myMs(arg.min)}.`
        }
        if (arg.max !== null && typeof arg.max !== 'undefined' && int > arg.max) {
            return `Please enter a duration below or exactly ${myMs(arg.max)}.`
        }

        return true
    }

    /**
     * @param {string} val Value to parse
     * @return {number} Usable value
     */
    parse(val) {
        return myMs(val, { number: true })
    }
}

module.exports = DurationArgumentType