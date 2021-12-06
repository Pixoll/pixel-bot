/* eslint-disable no-unused-vars */
const { Invite } = require('discord.js')
const ArgumentType = require('./base')
/* eslint-enable no-unused-vars */

class InviteArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'invite')

		/**
		 * The fetched invite
		 * @type {Invite}
		 */
		this.fetched = null
	}

	/**
	 * @param {string} val Value to validate
	 * @return Whether the value is valid
	 */
	async validate(val) {
		const invite = await this.client.fetchInvite(val).catch(() => null)
		this.fetched = invite
		return !!invite
	}

	/**
	 * @param {string} val Value to parse
	 * @return Usable value
	 */
	async parse(val) {
		if (this.fetched) {
			const { fetched } = this
			this.fetched = null
			return fetched
		}
		return await this.client.fetchInvite(val)
	}
}

module.exports = InviteArgumentType