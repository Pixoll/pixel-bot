const { myMs } = require('../../utils')
const ArgumentType = require('./base')

class DateArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'date')
    }

    /**
     * @param {string} val Value to validate
     * @return Whether the value is valid
     */
    validate(val) {
        const [d, mo, y, h = 0, m = 0, s = 0] = val.split(/\/|-|:/g).map(s => Number.parseInt(s))
        const date = new Date(y, mo - 1, d, h, m, s)

        if (!Boolean(date * 1)) {
            return 'Please enter a valid date format. Use the `help` command for more information.'
        }

        const int = date.getTime()
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
        const [d, mo, y, h = 0, m = 0, s = 0] = val.split(/\/|-|:/g).map(s => Number.parseInt(s))
        const date = new Date(y, mo - 1, d, h, m, s)
        return date
    }
}

module.exports = DateArgumentType