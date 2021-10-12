const { Guild, User } = require('discord.js')
const Command = require('../commands/base')
const GuildSettingsHelper = require('../providers/helper')
const { CommandoClient, CommandResolvable, CommandGroupResolvable } = require('../typings')

/**
 * A fancier Guild for fancier people.
 * @extends Guild
 */
class CommandoGuild extends Guild {
	/**
	 * @param {CommandoClient} client 
	 * @param {Guild} data 
	 */
	constructor(client, data) {
		super(client, { id: data.id })
		for (const prop in data) {
			this[prop] = data[prop]
		}
		client.emit('debug', `Created new ${this.constructor.name} with id ${this.id}`)

		this._commando = true

		/**
		 * The client the guild is for
		 * @type {CommandoClient}
		 */
		this.client

		/**
		 * Shortcut to use setting provider methods for this guild
		 * @type {GuildSettingsHelper}
		 */
		this.settings = new GuildSettingsHelper(this.client, this)

		/**
		 * Internal command prefix for the guild, controlled by the {@link CommandoGuild#prefix}
		 * getter/setter
		 * @name CommandoGuild#_prefix
		 * @type {?string}
		 * @private
		 */
		this._prefix = null
	}

	/**
	 * Command prefix in the guild. An empty string indicates that there is no prefix, and only mentions will be used.
	 * Setting to `null` means that the prefix from {@link CommandoClient#prefix} will be used instead.
	 * @type {string}
	 * @emits {@link CommandoClient#commandPrefixChange}
	 */
	get prefix() {
		if (this._prefix === null) return this.client.prefix
		return this._prefix
	}

	set prefix(prefix) {
		this._prefix = prefix
		this.client.emit('commandPrefixChange', this, this._prefix)
	}

	/**
	 * Sets whether a command is enabled in the guild
	 * @param {CommandResolvable} command Command to set status of
	 * @param {boolean} enabled Whether the command should be enabled
	 */
	setCommandEnabled(command, enabled) {
		command = this.client.registry.resolveCommand(command)
		if (command.guarded) throw new Error('The command is guarded.')
		if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.')
		enabled = Boolean(enabled)
		if (!this._commandsEnabled) {
			/**
			 * Map object of internal command statuses, mapped by command name
			 * @type {Object}
			 * @private
			 */
			this._commandsEnabled = {}
		}
		this._commandsEnabled[command.name] = enabled
		this.client.emit('commandStatusChange', this, command, enabled)
	}

	/**
	 * Checks whether a command is enabled in the guild (does not take the command's group status into account)
	 * @param {CommandResolvable} command Command to check status of
	 * @return {boolean}
	 */
	isCommandEnabled(command) {
		command = this.client.registry.resolveCommand(command)
		if (command.guarded) return true
		if (!this._commandsEnabled || typeof this._commandsEnabled[command.name] === 'undefined') {
			return command._globalEnabled
		}
		return this._commandsEnabled[command.name]
	}

	/**
	 * Sets whether a command group is enabled in the guild
	 * @param {CommandGroupResolvable} group Group to set status of
	 * @param {boolean} enabled Whether the group should be enabled
	 */
	setGroupEnabled(group, enabled) {
		group = this.client.registry.resolveGroup(group)
		if (group.guarded) throw new Error('The group is guarded.')
		if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.')
		enabled = Boolean(enabled)
		if (!this._groupsEnabled) {
			/**
			 * Internal map object of group statuses, mapped by group id
			 * @type {Object}
			 * @private
			 */
			this._groupsEnabled = {}
		}
		this._groupsEnabled[group.id] = enabled
		this.client.emit('groupStatusChange', this, group, enabled)
	}

	/**
	 * Checks whether a command group is enabled in the guild
	 * @param {CommandGroupResolvable} group Group to check status of
	 * @return {boolean}
	 */
	isGroupEnabled(group) {
		group = this.client.registry.resolveGroup(group)
		if (group.guarded) return true
		if (!this._groupsEnabled || typeof this._groupsEnabled[group.id] === 'undefined') return group._globalEnabled
		return this._groupsEnabled[group.id]
	}

	/**
	 * Creates a command usage string using the guild's prefix
	 * @param {string} [command] A command + arg string
	 * @param {User} [user=this.client.user] User to use for the mention command format
	 * @return {string}
	 */
	commandUsage(command, user = this.client.user) {
		return Command.usage(command, this.prefix, user)
	}
}

module.exports = CommandoGuild