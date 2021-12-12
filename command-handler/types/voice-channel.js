/* eslint-disable no-unused-vars */
const ArgumentType = require('./base')
const { disambiguation } = require('../util')
const { Util: { escapeMarkdown }, GuildChannel, VoiceChannel } = require('discord.js')
const { CommandoMessage, Argument } = require('../typings')
/* eslint-enable no-unused-vars */

class VoiceChannelArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'voice-channel')
	}

	/**
	 * @param {string} val Value to validate
	 * @param {CommandoMessage} msg Message that triggered the command
	 * @param {Argument} arg Argument the value was obtained from
	 * @return Whether the value is valid
	 */
	validate(val, msg, arg) {
		const matches = val.match(/^(?:<#)?([0-9]+)>?$/)
		if (matches) {
			try {
				const channel = msg.client.channels.resolve(matches[1])
				if (!channel || channel.type !== 'GUILD_VOICE') return false
				if (arg.oneOf && !arg.oneOf.includes(channel.id)) return false
				return true
			} catch (err) {
				return false
			}
		}

		if (!msg.guild) return false

		const search = val.toLowerCase()
		let channels = msg.guild.channels.cache.filter(channelFilterInexact(search))
		if (channels.size === 0) return false
		if (channels.size === 1) {
			if (arg.oneOf && !arg.oneOf.includes(channels.first().id)) return false
			return true
		}

		const exactChannels = channels.filter(channelFilterExact(search))
		if (exactChannels.size === 1) {
			if (arg.oneOf && !arg.oneOf.includes(exactChannels.first().id)) return false
			return true
		}
		if (exactChannels.size > 0) channels = exactChannels

		return channels.size <= 15 ?
			`${disambiguation(
				channels.map(chan => escapeMarkdown(chan.name)), 'voice channels', null
			)}\n` :
			'Multiple voice channels found. Please be more specific.'
	}

	/**
	 * @param {string} val Value to parse
	 * @param {CommandoMessage} msg Message that triggered the command
	 * @return {VoiceChannel} Usable value
	 */
	parse(val, msg) {
		const matches = val.match(/^(?:<#)?([0-9]+)>?$/)
		if (matches) return msg.client.channels.resolve(matches[1]) || null

		if (!msg.guild) return null

		const search = val.toLowerCase()
		const channels = msg.guild.channels.cache.filter(channelFilterInexact(search))
		if (channels.size === 0) return null
		if (channels.size === 1) return channels.first()

		const exactChannels = channels.filter(channelFilterExact(search))
		if (exactChannels.size === 1) return exactChannels.first()

		return null
	}
}

/** @param {string} search */
function channelFilterExact(search) {
	return /** @param {GuildChannel} chan */ chan =>
		chan.type === 'GUILD_VOICE' && chan.name.toLowerCase() === search
}

/** @param {string} search */
function channelFilterInexact(search) {
	return /** @param {GuildChannel} chan */ chan =>
		chan.type === 'GUILD_VOICE' && chan.name.toLowerCase().includes(search)
}

module.exports = VoiceChannelArgumentType
