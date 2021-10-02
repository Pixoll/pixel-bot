const { myMs } = require('../../utils')
const ArgumentType = require('./base')
const regex = /<t:([0-9]+)>|<t:([0-9]+):(t|T|d|D|f|F|R)>/

class TimestampArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'timestamp')
    }

    /**
     * @param {string} val Value to validate
     * @return Whether the value is valid
     */
    validate(val) {
        const stamp = val.match(regex)?.[0]
        if (!stamp) {
            return 'Please enter a valid timestamp format. Use the `help` command for more information.'
        }

        const int = Number.parseInt(stamp.match(/[0-9]+/)[0]) * 1000
        if (int <= Date.now()) {
            return 'Please enter a date that\'s in the future.'
        }
        if (int > (Date.now() + myMs('5y'))) {
            return 'The max. usable date is `5 years` in the future. Please try again.'
        }

        return true
    }

    /**
     * @param {string} val Value to parse
     * @return Usable value
     */
    parse(val) {
        const stamp = val.match(regex)?.[0]
        const int = Number.parseInt(stamp.match(/[0-9]+/)[0]) * 1000
        const date = new Date(int)
        return date
    }
}

module.exports = TimestampArgumentType