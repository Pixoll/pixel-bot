/* eslint-disable no-unused-vars */
const { Argument } = require('../typings')
const ArgumentType = require('./base')
/* eslint-enable no-unused-vars */

class StringArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'string')
	}

	/**
	 * @param {string} val Value to validate
	 * @param {Argument} arg Argument the value was obtained from
	 * @return Whether the value is valid
	 */
	validate(val, msg, arg) {
		if (arg.oneOf && !arg.oneOf.includes(val.toLowerCase())) {
			return `Please enter one of the following options: ${arg.oneOf.map(opt => `\`${opt}\``).join(', ')}`
		}
		if (arg.min !== null && typeof arg.min !== 'undefined' && val.length < arg.min) {
			return `Please keep the ${arg.label} above or exactly ${arg.min} characters.`
		}
		if (arg.max !== null && typeof arg.max !== 'undefined' && val.length > arg.max) {
			return `Please keep the ${arg.label} below or exactly ${arg.max} characters.`
		}

		return true
	}

	/**
	 * @param {string} val Value to parse
	 * @return Usable value
	 */
	parse(val) {
		return val
	}
}

module.exports = StringArgumentType