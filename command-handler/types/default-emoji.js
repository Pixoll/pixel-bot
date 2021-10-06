const ArgumentType = require('./base')
const emojiRegex = require('emoji-regex')()
const { Argument } = require('../typings')
const { Emoji } = require('discord.js')

class DefaultEmojiArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'default-emoji')
	}

	/**
	 * @param {Emoji} value Value to validate
	 * @param {Argument} arg Argument the value was obtained from
	 * @return Whether the value is valid
	 */
	validate(value, msg, arg) {
		if (!(new RegExp(`^(?:${emojiRegex.source})$`).test(value))) return false
		if (arg.oneOf && !arg.oneOf.includes(value)) {
			return `Please enter one of the following options: ${arg.oneOf.join(' | ')}`
		}
		return true
	}

	/**
	 * @param {Emoji} value Value to validate
	 */
	parse(value) {
		return value
	}
}

module.exports = DefaultEmojiArgumentType