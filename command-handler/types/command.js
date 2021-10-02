const ArgumentType = require('./base')
const { disambiguation } = require('../util')
const { Util: { escapeMarkdown } } = require('discord.js')

class CommandArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'command')
	}

	/**
	 * @param {string} val Value to validate
	 * @return Whether the value is valid
	 */
	validate(val) {
		const commands = this.client.registry.findCommands(val)
		if (commands.length === 1) return true
		if (commands.length === 0) return false
		return commands.length <= 15 ?
			`${disambiguation(commands.map(cmd => escapeMarkdown(cmd.name)), 'commands', null)}\n` :
			'Multiple commands found. Please be more specific.'
	}

	/**
	 * @param {string} val Value to parse
	 * @return Usable value
	 */
	parse(val) {
		return this.client.registry.findCommands(val)[0]
	}
}

module.exports = CommandArgumentType