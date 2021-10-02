const { Invite } = require('discord.js')
const ArgumentType = require('./base')

class InviteArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'invite')

		/**
		 * The fetched invite
		 * @type {Invite}
		 */
		this.fetched
	}

    /**
     * @param {string} val Value to validate
     * @return Whether the value is valid
     */
    async validate(val) {
		const invite = await this.client.fetchInvite(val).catch(() => null)
		this.fetched = invite
		return Boolean(invite)
	}

	/**
	 * @param {string} val Value to parse
	 * @return Usable value
	 */
	async parse(val) {
		if (this.fetched) return this.fetched
		return await this.client.fetchInvite(val)
	}
}

module.exports = InviteArgumentType