/* eslint-disable no-unused-vars */
const { Message } = require('discord.js')
const { CommandoMessage } = require('../typings')
const ArgumentType = require('./base')
/* eslint-enable no-unused-vars */

class MessageArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'message')
	}

	/**
	 * @param {string} val Value to validate
	 * @param {CommandoMessage} msg Message that triggered the command
	 * @return Whether the value is valid
	 */
	async validate(val, msg) {
		if (!/^\d+$/.test(val)) return false
		const message = await msg.channel.messages.fetch(val).catch(() => null)
		return !!message
	}

	/**
	 * @param {string} val Value to parse
	 * @param {Message} msg Message that triggered the command
	 * @return Usable value
	 */
	parse(val, msg) {
		return msg.channel.messages.cache.get(val)
	}
}

module.exports = MessageArgumentType
