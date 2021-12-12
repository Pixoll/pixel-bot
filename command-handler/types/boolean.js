const ArgumentType = require('./base')

const truthy = new Set(['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+'])
const falsy = new Set(['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-'])

class BooleanArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'boolean')
	}

	/**
	 * @param {string} val Value to validate
	 * @return Whether the value is valid
	 */
	validate(val) {
		const lc = val.toLowerCase()
		return truthy.has(lc) || falsy.has(lc)
	}

	/**
	 * @param {string} val Value to parse
	 * @return Usable value
	 */
	parse(val) {
		const lc = val.toLowerCase()
		if (truthy.has(lc)) return true
		if (falsy.has(lc)) return false
		throw new RangeError('Unknown boolean value.')
	}
}

module.exports = BooleanArgumentType
