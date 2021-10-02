const ArgumentType = require('./base')
const { disambiguation } = require('../util')
const { Util: { escapeMarkdown } } = require('discord.js')

class GroupArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'group')
	}

	/**
	 * @param {string} val Value to validate
	 * @return Whether the value is valid
	 */
	validate(val) {
		const groups = this.client.registry.findGroups(val)
		if (groups.length === 1) return true
		if (groups.length === 0) return false
		return groups.length <= 15 ?
			`${disambiguation(groups.map(grp => escapeMarkdown(grp.name)), 'groups', null)}\n` :
			'Multiple groups found. Please be more specific.'
	}

	/**
	 * @param {string} val Value to parse¿
	 * @return Usable value
	 */
	parse(val) {
		return this.client.registry.findGroups(val)[0]
	}
}

module.exports = GroupArgumentType