const path = require('path')
const { PermissionResolvable, Message, GuildResolvable, User, MessageEmbed } = require('discord.js')
const { stripIndent } = require('common-tags')
const ArgumentCollector = require('./collector')
const { permissions } = require('../util')
const { ThrottlingOptions, CommandInfo, CommandoClient, CommandGroup, CommandoMessage, ArgumentCollectorResult, CommandBlockData, Throttle, CommandBlockReason } = require('../typings')

/** A command that can be run in a client */
class Command {
	/**
	 * @param {CommandoClient} client The client the command is for
	 * @param {CommandInfo} info The command information
	 */
	// eslint-disable-next-line complexity
	constructor(client, info) {
		this.constructor.validateInfo(client, info)

		/**
		 * Client that this command is for
		 * @type {CommandoClient}
		 * @readonly
		 */
		this.client = client

		/**
		 * Name of this command
		 * @type {string}
		 */
		this.name = info.name

		/**
		 * Aliases for this command
		 * @type {string[]}
		 */
		this.aliases = info.aliases || []
		if (typeof info.autoAliases === 'undefined' || info.autoAliases) {
			if (this.name.includes('-')) this.aliases.push(this.name.replace(/-/g, ''))
			for (const alias of this.aliases) {
				if (alias.includes('-')) this.aliases.push(alias.replace(/-/g, ''))
			}
		}

		/**
		 * Id of the group the command belongs to
		 * @type {string}
		 */
		this.groupId = info.group

		/**
		 * The group the command belongs to, assigned upon registration
		 * @type {?CommandGroup}
		 */
		this.group = null

		/**
		 * Name of the command within the group
		 * @type {string}
		 * @default this.name
		 */
		this.memberName = info.memberName || this.name

		/**
		 * Short description of the command
		 * @type {string}
		 */
		this.description = info.description

		/**
		 * Usage format string of the command
		 * @type {string}
		 */
		this.format = info.format || null

		/**
		 * Long description of the command
		 * @type {?string}
		 */
		this.details = info.details || null

		/**
		 * Example usage strings
		 * @type {?string[]}
		 */
		this.examples = info.examples || null

		/**
		 * Whether the command can only be run in direct messages
		 * @type {boolean}
		 * @default false
		 */
		this.dmOnly = Boolean(info.dmOnly)

		/**
		 * Whether the command can only be run in a guild channel
		 * @type {boolean}
		 * @default false
		 */
		this.guildOnly = Boolean(info.guildOnly)

		/**
		 * Whether the command can only be used by a server owner
		 * @type {boolean}
		 * @default false
		 */
		this.serverOwnerOnly = Boolean(info.serverOwnerOnly)

		/**
		 * Whether the command can only be used by an owner
		 * @type {boolean}
		 * @default false
		 */
		this.ownerOnly = Boolean(info.ownerOnly)

		/**
		 * Permissions required by the client to use the command.
		 * @type {?PermissionResolvable[]}
		 */
		this.clientPermissions = info.clientPermissions || null

		/**
		 * Permissions required by the user to use the command.
		 * @type {?PermissionResolvable[]}
		 */
		this.userPermissions = info.userPermissions || null

		/**
		 * Whether the command can only be used in NSFW channels
		 * @type {boolean}
		 * @default false
		 */
		this.nsfw = Boolean(info.nsfw)

		/**
		 * Whether the default command handling is enabled for the command
		 * @type {boolean}
		 * @default true
		 */
		this.defaultHandling = 'defaultHandling' in info ? info.defaultHandling : true

		/**
		 * Options for throttling command usages
		 * @type {?ThrottlingOptions}
		 */
		this.throttling = info.throttling || null

		/**
		 * The argument collector for the command
		 * @type {?ArgumentCollector}
		 */
		this.argsCollector = info.args && info.args.length ?
			new ArgumentCollector(client, info.args, info.argsPromptLimit) :
			null
		if (this.argsCollector && typeof info.format === 'undefined') {
			this.format = this.argsCollector.args.reduce((prev, arg) => {
				const wrapL = arg.default !== null ? '[' : '<'
				const wrapR = arg.default !== null ? ']' : '>'
				return `${prev}${prev ? ' ' : ''}${wrapL}${arg.label}${arg.infinite ? '...' : ''}${wrapR}`
			}, '')
		}

		/**
		 * How the arguments are split when passed to the command's run method
		 * @type {string}
		 * @default 'single'
		 */
		this.argsType = info.argsType || 'single'

		/**
		 * Maximum number of arguments that will be split
		 * @type {number}
		 * @default 0
		 */
		this.argsCount = info.argsCount || 0

		/**
		 * Whether single quotes are allowed to encapsulate an argument
		 * @type {boolean}
		 * @default true
		 */
		this.argsSingleQuotes = 'argsSingleQuotes' in info ? info.argsSingleQuotes : true

		/**
		 * Regular expression triggers
		 * @type {RegExp[]}
		 */
		this.patterns = info.patterns || null

		/**
		 * Whether the command is protected from being disabled
		 * @type {boolean}
		 * @default false
		 */
		this.guarded = Boolean(info.guarded)

		/**
		 * Whether the command should be hidden from the help command
		 * @type {boolean}
		 * @default false
		 */
		this.hidden = Boolean(info.hidden)

		/**
		 * Whether the command will be run when an unknown command is used
		 * @type {boolean}
		 * @default false
		 */
		this.unknown = Boolean(info.unknown)

		/**
		 * Whether the command is enabled globally
		 * @type {boolean}
		 * @private
		 */
		this._globalEnabled = true

		/**
		 * Current throttle objects for the command, mapped by user id
		 * @type {Map<string, Object>}
		 * @private
		 */
		this._throttles = new Map()
	}

	/**
	 * Checks whether the user has permission to use the command
	 * @param {CommandoMessage} message The triggering command message
	 * @param {boolean} [ownerOverride=true] Whether the bot owner(s) will always have permission
	 * @return Whether the user has permission, or an error message to respond with if they don't
	 */
	hasPermission(message, ownerOverride = true) {
		const { author, channel, guild } = message

		if (!this.serverOwnerOnly && !this.ownerOnly && !this.userPermissions) return true
		if (ownerOverride && this.client.isOwner(author)) return true

		if (this.ownerOnly && (ownerOverride || !this.client.isOwner(author))) {
			return false
		}

		if (this.serverOwnerOnly && guild?.ownerId !== author.id) {
			return false
		}

		if (channel.type !== 'DM' && this.userPermissions) {
			const missing = channel.permissionsFor(author).missing(this.userPermissions)
			if (missing.length > 0) {
				return missing
			}
		}

		return true
	}

	/**
	 * Runs the command
	 * @param {CommandoMessage} message The message the command is being run for
	 * @param {object|string|string[]} args The arguments for the command, or the matches from a pattern.
	 * If args is specified on the command, thise will be the argument values object. If argsType is single, then only
	 * one string will be passed. If multiple, an array of strings will be passed. When fromPattern is true, this is the
	 * matches array from the pattern match
	 * (see [RegExp#exec](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec)).
	 * @param {boolean} fromPattern Whether or not the command is being run from a pattern match
	 * @param {?ArgumentCollectorResult} result Result from obtaining the arguments from the collector (if applicable)
	 * @return {Promise<?Message|?Array<Message>>}
	 * @abstract
	 */
	async run(message, args, fromPattern, result) { // eslint-disable-line no-unused-vars, require-await
		throw new Error(`${this.constructor.name} doesn't have a run() method.`)
	}

	/**
	 * Called when the command is prevented from running
	 * @param {CommandoMessage} message Command message that the command is running from
	 * @param {CommandBlockReason} reason Reason that the command was blocked
	 * @param {CommandBlockData} [data] Additional data associated with the block. Built-in reason data properties:
	 * - guildOnly: none
	 * - nsfw: none
	 * - throttling: `throttle` ({@link Object}), `remaining` ({@link number}) time in seconds
	 * - userPermissions & clientPermissions: `missing` ({@link Array}<{@link string}>) permission names
	 * @returns {Promise<?Message|?Array<Message>>}
	 */
	onBlock(message, reason, data) {
		switch (reason) {
			case 'dmOnly':
				return message.replyEmbed(embed(
					`The \`${this.name}\` command can only be used in direct messages.`
				))
			case 'guildOnly':
				return message.replyEmbed(embed(
					`The \`${this.name}\` command can only be used in a server channel.`
				))
			case 'serverOwnerOnly':
				return message.replyEmbed(embed(
					`The \`${this.name}\` command can only be used by the server's owner.`
				))
			case 'nsfw':
				return message.replyEmbed(embed(
					`The \`${this.name}\` command can only be used in a NSFW channel.`
				))
			case 'ownerOnly': {
				return message.replyEmbed(embed(
					`The \`${this.name}\` command can only be used by the bot's owner.`
				))
			}
			case 'userPermissions':
				return message.replyEmbed(embed(
					'You are missing the following permissions:',
					data.missing.map(perm => `\`${permissions[perm]}\``).join(', ')
				))
			case 'clientPermissions':
				return message.replyEmbed(embed(
					'The bot is missing the following permissions:',
					data.missing.map(perm => `\`${permissions[perm]}\``).join(', ')
				))
			case 'throttling':
				return message.replyEmbed(embed(
					`Please wait **${data.remaining.toFixed(1)} seconds** before using the \`${this.name}\` command again.`
				))
		}
	}

	/**
	 * Called when the command produces an error while running
	 * @param {Error} err Error that was thrown
	 * @param {CommandoMessage} message Command message that the command is running from (see {@link Command#run})
	 * @param {Object|string|string[]} args Arguments for the command (see {@link Command#run})
	 * @param {boolean} fromPattern Whether the args are pattern matches (see {@link Command#run})
	 * @param {?ArgumentCollectorResult} result Result from obtaining the arguments from the collector
	 * (if applicable see {@link Command#run})
	 * @returns {Promise<?Message|?Array<Message>>}
	 */
	onError(err, message, args, fromPattern, result) {
		const owner = message.client.owners[0]
		const { serverInvite } = message.client.options
		const emoji = '<:cross:802617654442852394>'

		const reply = new MessageEmbed()
			.setColor('RED')
			.setDescription(stripIndent`
				${emoji} **An unexpected error happened**
				Please contact ${owner.toString()} (${owner.tag}), or join the [support server](${serverInvite}).
			`)
			.addField(err.name, '```' + err.message + '```')

		message.replyEmbed(reply)
	}

	/**
	 * Creates/obtains the throttle object for a user, if necessary (owners are excluded)
	 * @param {string} userId Id of the user to throttle for
	 * @return {?Throttle}
	 * @private
	 */
	throttle(userId) {
		if (!this.throttling || this.client.isOwner(userId)) return null

		let throttle = this._throttles.get(userId)
		if (!throttle) {
			throttle = {
				start: Date.now(),
				usages: 0,
				timeout: setTimeout(() => {
					this._throttles.delete(userId)
				}, this.throttling.duration * 1000)
			}
			this._throttles.set(userId, throttle)
		}

		return throttle
	}

	/**
	 * Enables or disables the command in a guild
	 * @param {?GuildResolvable} guild Guild to enable/disable the command in
	 * @param {boolean} enabled Whether the command should be enabled or disabled
	 */
	setEnabledIn(guild, enabled) {
		if (typeof guild === 'undefined') throw new TypeError('Guild must not be undefined.')
		if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.')
		if (this.guarded) throw new Error('The command is guarded.')
		if (!guild) {
			this._globalEnabled = enabled
			this.client.emit('commandStatusChange', null, this, enabled)
			return
		}
		guild = this.client.guilds.resolve(guild)
		guild.setCommandEnabled(this, enabled)
	}

	/**
	 * Checks if the command is enabled in a guild
	 * @param {?GuildResolvable} guild Guild to check in
	 * @param {boolean} [bypassGroup] Whether to bypass checking the group's status
	 * @return {boolean}
	 */
	isEnabledIn(guild, bypassGroup) {
		if (this.guarded) return true
		if (!guild) return this.group._globalEnabled && this._globalEnabled
		guild = this.client.guilds.resolve(guild)
		return (bypassGroup || guild.isGroupEnabled(this.group)) && guild.isCommandEnabled(this)
	}

	/**
	 * Checks if the command is usable for a message
	 * @param {?Message} message The message
	 * @return {boolean}
	 */
	isUsable(message = null) {
		if (!message) return this._globalEnabled
		if (this.guildOnly && message && !message.guild) return false
		const hasPermission = this.hasPermission(message)
		return this.isEnabledIn(message.guild) && hasPermission && typeof hasPermission !== 'string'
	}

	/**
	 * Creates a usage string for the command
	 * @param {string} [argString] A string of arguments for the command
	 * @param {string} [prefix=this.client.prefix] Prefix to use for the prefixed command format
	 * @param {User} [user=this.client.user] User to use for the mention command format
	 * @return {string}
	 */
	usage(argString, prefix = this.client.prefix, user = this.client.user) {
		return this.constructor.usage(`${this.name}${argString ? ` ${argString}` : ''}`, prefix, user)
	}

	/**
	 * Reloads the command
	 */
	reload() {
		let cmdPath, cached, newCmd
		try {
			cmdPath = this.client.registry.resolveCommandPath(this.groupId, this.memberName)
			cached = require.cache[cmdPath]
			delete require.cache[cmdPath]
			newCmd = require(cmdPath)
		} catch (err) {
			if (cached) require.cache[cmdPath] = cached
			try {
				cmdPath = path.join(__dirname, this.groupId, `${this.memberName}.js`)
				cached = require.cache[cmdPath]
				delete require.cache[cmdPath]
				newCmd = require(cmdPath)
			} catch (err2) {
				if (cached) require.cache[cmdPath] = cached
				if (err2.message.includes('Cannot find module')) throw err; else throw err2;
			}
		}

		this.client.registry.reregisterCommand(newCmd, this)
	}

	/**
	 * Unloads the command
	 */
	unload() {
		const cmdPath = this.client.registry.resolveCommandPath(this.groupId, this.memberName)
		if (!require.cache[cmdPath]) throw new Error('Command cannot be unloaded.')
		delete require.cache[cmdPath]
		this.client.registry.unregisterCommand(this)
	}

	/**
	 * Creates a usage string for a command
	 * @param {string} command A command + arg string
	 * @param {string} [prefix] Prefix to use for the prefixed command format
	 * @param {User} [user] User to use for the mention command format
	 * @return {string}
	 */
	static usage(command, prefix = null, user = null) {
		const nbcmd = command.replace(/ /g, '\xa0')
		if (!prefix && !user) return `\`${nbcmd}\``

		let prefixPart
		if (prefix) {
			if (prefix.length > 1 && !prefix.endsWith(' ')) prefix += ' '
			prefix = prefix.replace(/ /g, '\xa0')
			prefixPart = `\`${prefix}${nbcmd}\``
		}

		let mentionPart
		if (user) mentionPart = `\`@${user.username.replace(/ /g, '\xa0')}#${user.discriminator}\xa0${nbcmd}\``

		return `${prefixPart || ''}${prefix && user ? ' or ' : ''}${mentionPart || ''}`
	}

	/**
	 * Validates the constructor parameters
	 * @param {CommandoClient} client Client to validate
	 * @param {CommandInfo} info Info to validate
	 * @private
	 */
	static validateInfo(client, info) { // eslint-disable-line complexity
		if (!client) throw new Error('A client must be specified.')
		if (typeof info !== 'object') throw new TypeError('Command info must be an Object.')
		if (typeof info.name !== 'string') throw new TypeError('Command name must be a string.')
		if (info.name !== info.name.toLowerCase()) throw new Error('Command name must be lowercase.')
		if (info.name.replace(/ +/g, '') !== info.name) throw new Error('Command name must not include spaces.')
		if (info.aliases && (!Array.isArray(info.aliases) || info.aliases.some(ali => typeof ali !== 'string'))) {
			throw new TypeError('Command aliases must be an Array of strings.')
		}
		if (info.aliases && info.aliases.some(ali => ali !== ali.toLowerCase())) {
			throw new RangeError('Command aliases must be lowercase.')
		}
		if (typeof info.group !== 'string') throw new TypeError('Command group must be a string.')
		if (info.group !== info.group.toLowerCase()) throw new RangeError('Command group must be lowercase.')
		if (typeof info.name !== 'string' && typeof info.memberName !== 'string') throw new TypeError('Command memberName must be a string.')
		if (info.memberName !== info.memberName?.toLowerCase() && info.memberName === 'string') throw new Error('Command memberName must be lowercase.')
		if (typeof info.description !== 'string') throw new TypeError('Command description must be a string.')
		if ('format' in info && typeof info.format !== 'string') throw new TypeError('Command format must be a string.')
		if ('details' in info && typeof info.details !== 'string') throw new TypeError('Command details must be a string.')
		if (info.examples && (!Array.isArray(info.examples) || info.examples.some(ex => typeof ex !== 'string'))) {
			throw new TypeError('Command examples must be an Array of strings.')
		}
		if (info.clientPermissions) {
			if (!Array.isArray(info.clientPermissions)) {
				throw new TypeError('Command clientPermissions must be an Array of permission key strings.')
			}
			for (const perm of info.clientPermissions) {
				if (!permissions[perm]) throw new RangeError(`Invalid command clientPermission: ${perm}`)
			}
		}
		if (info.userPermissions) {
			if (!Array.isArray(info.userPermissions)) {
				throw new TypeError('Command userPermissions must be an Array of permission key strings.')
			}
			for (const perm of info.userPermissions) {
				if (!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`)
			}
		}
		if (info.throttling) {
			if (typeof info.throttling !== 'object') throw new TypeError('Command throttling must be an Object.')
			if (typeof info.throttling.usages !== 'number' || isNaN(info.throttling.usages)) {
				throw new TypeError('Command throttling usages must be a number.')
			}
			if (info.throttling.usages < 1) throw new RangeError('Command throttling usages must be at least 1.')
			if (typeof info.throttling.duration !== 'number' || isNaN(info.throttling.duration)) {
				throw new TypeError('Command throttling duration must be a number.')
			}
			if (info.throttling.duration < 1) throw new RangeError('Command throttling duration must be at least 1.')
		}
		if (info.args && !Array.isArray(info.args)) throw new TypeError('Command args must be an Array.')
		if ('argsPromptLimit' in info && typeof info.argsPromptLimit !== 'number') {
			throw new TypeError('Command argsPromptLimit must be a number.')
		}
		if ('argsPromptLimit' in info && info.argsPromptLimit < 0) {
			throw new RangeError('Command argsPromptLimit must be at least 0.')
		}
		if (info.argsType && !['single', 'multiple'].includes(info.argsType)) {
			throw new RangeError('Command argsType must be one of "single" or "multiple".')
		}
		if (info.argsType === 'multiple' && info.argsCount && info.argsCount < 2) {
			throw new RangeError('Command argsCount must be at least 2.')
		}
		if (info.patterns && (!Array.isArray(info.patterns) || info.patterns.some(pat => !(pat instanceof RegExp)))) {
			throw new TypeError('Command patterns must be an Array of regular expressions.')
		}
	}
}

module.exports = Command

/**
 * Creates a basic embed.
 * @param {string} text The text to fill the embed with.
 * @param {string} [value] The value of the field.
 * @returns {MessageEmbed}
 */
function embed(text, value) {
	const embed = new MessageEmbed().setColor('RED')

	if (value) embed.addField(text, value)
	else embed.setDescription(text)

	return embed
}