const { Message } = require('discord.js')
const { CommandoMessage } = require('../typings')
const ArgumentType = require('./base')

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
		if (!/^[0-9]+$/.test(val)) return false
		return Boolean(await msg.channel.messages.fetch(val).catch(() => null))
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