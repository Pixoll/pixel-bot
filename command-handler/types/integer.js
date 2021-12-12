/* eslint-disable no-unused-vars */
const { Argument } = require('../typings')
const ArgumentType = require('./base')
/* eslint-enable no-unused-vars */

class IntegerArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'integer')
	}

	/**
	 * @param {string} val Value to validate
	 * @param {Argument} arg Argument the value was obtained from
	 * @return Whether the value is valid
	 */
	validate(val, msg, arg) {
		const int = parseInt(val)
		if (isNaN(int)) return false

		if (arg.oneOf && !arg.oneOf.includes(int)) {
			return `Please enter one of the following options: ${arg.oneOf.map(opt => `\`${opt}\``).join(', ')}`
		}
		if (arg.min !== null && typeof arg.min !== 'undefined' && int < arg.min) {
			return `Please enter a number above or exactly ${arg.min}.`
		}
		if (arg.max !== null && typeof arg.max !== 'undefined' && int > arg.max) {
			return `Please enter a number below or exactly ${arg.max}.`
		}

		return true
	}

	/**
	 * @param {string} val Value to parse
	 * @return Usable value
	 */
	parse(val) {
		return parseInt(val)
	}
}

module.exports = IntegerArgumentType
