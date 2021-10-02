const ArgumentType = require('./base')
const { disambiguation } = require('../util')
const { Util: { escapeMarkdown }, GuildMember } = require('discord.js')
const { CommandoMessage, Argument } = require('../typings')

class UserArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'user')
	}

	/**
	 * @param {string} val Value to validate
	 * @param {CommandoMessage} msg Message that triggered the command
	 * @param {Argument} arg Argument the value was obtained from
	 * @return Whether the value is valid
	 */
	async validate(val, msg, arg) {
		const matches = val.match(/^(?:<@!?)?([0-9]+)>?$/)
		if (matches) {
			try {
				const user = await msg.client.users.fetch(matches[1])
				if (!user) return false
				if (arg.oneOf && !arg.oneOf.includes(user.id)) return false
				return true
			} catch (err) {
				return false
			}
		}

		if (!msg.guild) return false

		const search = val.toLowerCase()
		let members = msg.guild.members.cache.filter(memberFilterInexact(search))
		if (members.size === 0) return false
		if (members.size === 1) {
			if (arg.oneOf && !arg.oneOf.includes(members.first().id)) return false
			return true
		}

		const exactMembers = members.filter(memberFilterExact(search))
		if (exactMembers.size === 1) {
			if (arg.oneOf && !arg.oneOf.includes(exactMembers.first().id)) return false
			return true
		}
		if (exactMembers.size > 0) members = exactMembers

		return members.size <= 15 ?
			`${disambiguation(
				members.map(mem => `${escapeMarkdown(mem.user.username)}#${mem.user.discriminator}`), 'users', null
			)}\n` :
			'Multiple users found. Please be more specific.'
	}

	/**
	 * @param {string} val Value to parse
	 * @param {CommandoMessage} msg Message that triggered the command
	 * @return Usable value
	 */
	parse(val, msg) {
		const matches = val.match(/^(?:<@!?)?([0-9]+)>?$/)
		if (matches) return msg.client.users.cache.get(matches[1]) || null

		if (!msg.guild) return null

		const search = val.toLowerCase()
		const members = msg.guild.members.cache.filter(memberFilterInexact(search))
		if (members.size === 0) return null
		if (members.size === 1) return members.first().user

		const exactMembers = members.filter(memberFilterExact(search))
		if (exactMembers.size === 1) return exactMembers.first().user

		return null
	}
}

/** @param {string} search */
function memberFilterExact(search) {
	return /** @param {GuildMember} mem */ mem =>
		mem.user.username.toLowerCase() === search ||
		mem.nickname?.toLowerCase() === search ||
		mem.user.tag.toLowerCase() === search
}

/** @param {string} search */
function memberFilterInexact(search) {
	return /** @param {GuildMember} mem */ mem =>
		mem.user.username.toLowerCase().includes(search) ||
		mem.nickname?.toLowerCase().includes(search) ||
		mem.user.tag.toLowerCase().includes(search)
}

module.exports = UserArgumentType