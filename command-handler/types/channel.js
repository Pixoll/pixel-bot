/* eslint-disable no-unused-vars */
const ArgumentType = require('./base')
const { disambiguation } = require('../util')
const { Util: { escapeMarkdown }, GuildChannel, ThreadChannel } = require('discord.js')
const { CommandoMessage, Argument } = require('../typings')
/* eslint-enable no-unused-vars */

class ChannelArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'channel')
	}

	/**
	 * @param {string} val Value to validate
	 * @param {CommandoMessage} msg Message that triggered the command
	 * @param {Argument} arg Argument the value was obtained from
	 * @return Whether the value is valid
	 */
	validate(val, msg, arg) {
		const matches = val.match(/^(?:<#)?([0-9]+)>?$/)
		if (matches) return msg.guild.channels.cache.has(matches[1])

		const search = val.toLowerCase()
		let channels = msg.guild.channels.cache.filter(nameFilterInexact(search))
		if (channels.size === 0) return false
		if (channels.size === 1) {
			if (arg.oneOf && !arg.oneOf.includes(channels.first().id)) return false
			return true
		}

		const exactChannels = channels.filter(nameFilterExact(search))
		if (exactChannels.size === 1) {
			if (arg.oneOf && !arg.oneOf.includes(exactChannels.first().id)) return false
			return true
		}
		if (exactChannels.size > 0) channels = exactChannels

		return channels.size <= 15 ?
			`${disambiguation(channels.map(chan => escapeMarkdown(chan.name)), 'channels', null)}\n` :
			'Multiple channels found. Please be more specific.'
	}

	/**
	 * @param {string} val Value to parse
	 * @param {CommandoMessage} msg Message that triggered the command
	 * @return Usable value
	 */
	parse(val, msg) {
		const matches = val.match(/^(?:<#)?([0-9]+)>?$/)
		if (matches) return msg.guild.channels.cache.get(matches[1]) || null

		const search = val.toLowerCase()
		const channels = msg.guild.channels.cache.filter(nameFilterInexact(search))
		if (channels.size === 0) return null
		if (channels.size === 1) return channels.first()

		const exactChannels = channels.filter(nameFilterExact(search))
		if (exactChannels.size === 1) return exactChannels.first()

		return null
	}
}

/** @param {string} search */
function nameFilterExact(search) {
	return /** @param {GuildChannel|ThreadChannel} thing */ thing =>
		thing.name.toLowerCase() === search
}

/** @param {string} search */
function nameFilterInexact(search) {
	return /** @param {GuildChannel|ThreadChannel} thing */ thing =>
		thing.name.toLowerCase().includes(search)
}

module.exports = ChannelArgumentType