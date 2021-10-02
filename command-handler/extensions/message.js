const { Util: { escapeMarkdown }, Message, MessageEmbed, User, MessageOptions, TextBasedChannels } = require('discord.js')
const { CommandoClient, StringResolvable, CommandoGuild, ClientGuildMember } = require('../typings')
const { oneLine } = require('common-tags')
const Command = require('../commands/base')
const FriendlyError = require('../errors/friendly')
const CommandFormatError = require('../errors/command-format')
const { resolveString } = require('../util')

/**
 * An extension of the base Discord.js Message class to add command-related functionality.
 * @extends Message
 */
class CommandoMessage extends Message {
	/**
	 * @param {CommandoClient} client
	 * @param {Message} data
	 */
	constructor(client, data) {
		const old = data
		data = data.toJSON()
		data.channelId = old.channelId
		data.type = old.type
		data.author = old.author

		super(client, data)

		this._commando = true

		/**
		 * The client the message is for
		 * @type {CommandoClient}
		 */
		this.client

		/**
		 * The channel the message is for
		 * @type {TextBasedChannels}
		 */
		this.channel
		this.channelId = data.channelId

		this.type = data.type

		/**
		 * The author of the message
		 * @type {User}
		 */
		this.author

		/**
		 * The guild this message is for
		 * @type {CommandoGuild}
		 */
		this.guild
		this.guildId = this.guild?.id || null

		/**
		 * The client member this message is for
		 * @type {ClientGuildMember}
		 */
		this.clientMember = this.guild?.members.cache.get(this.client.user.id) || null

		/**
		 * Whether the message contains a command (even an unknown one)
		 * @type {boolean}
		 */
		this.isCommand = false

		/**
		 * Command that the message triggers, if any
		 * @type {?Command}
		 */
		this.command = null

		/**
		 * Argument string for the command
		 * @type {?string}
		 */
		this.argString = null

		/**
		 * Pattern matches (if from a pattern trigger)
		 * @type {?string[]}
		 */
		this.patternMatches = null

		/**
		 * Response messages sent, mapped by channel id (set by the dispatcher after running the command)
		 * @type {?{[key:string]:CommandoMessage[]}}
		 */
		this.responses = null

		/**
		 * Index of the current response that will be edited, mapped by channel id
		 * @type {?{[key:string]:number}}
		 */
		this.responsePositions = null
	}

	/**
	 * Initialises the message for a command
	 * @param {Command} [command] Command the message triggers
	 * @param {string} [argString] Argument string for the command
	 * @param {?Array<string>} [patternMatches] Command pattern matches (if from a pattern trigger)
	 * @return {Message} This message
	 * @private
	 */
	initCommand(command, argString, patternMatches) {
		this.isCommand = true
		this.command = command
		this.argString = argString
		this.patternMatches = patternMatches
		return this
	}

	/**
	 * Creates a usage string for the message's command
	 * @param {string} [argString] A string of arguments for the command
	 * @param {string} [prefix=this.guild.prefix || this.client.prefix] Prefix to use for the
	 * prefixed command format
	 * @param {User} [user=this.client.user] User to use for the mention command format
	 * @return {string}
	 */
	usage(argString, prefix, user = this.client.user) {
		if (typeof prefix === 'undefined') {
			if (this.guild) prefix = this.guild.prefix
			else prefix = this.client.prefix
		}
		return this.command.usage(argString, prefix, user)
	}

	/**
	 * Creates a usage string for any command
	 * @param {string} [command] A command + arg string
	 * @param {string} [prefix=this.guild.prefix || this.client.prefix] Prefix to use for the
	 * prefixed command format
	 * @param {User} [user=this.client.user] User to use for the mention command format
	 * @return {string}
	 */
	anyUsage(command, prefix, user = this.client.user) {
		if (typeof prefix === 'undefined') {
			if (this.guild) prefix = this.guild.prefix
			else prefix = this.client.prefix
		}
		return Command.usage(command, prefix, user)
	}

	/**
	 * Parses the argString into usable arguments, based on the argsType and argsCount of the command
	 * @return {string|string[]}
	 * @see {@link Command#run}
	 */
	parseArgs() {
		switch (this.command.argsType) {
			case 'single':
				return this.argString.trim().replace(
					this.command.argsSingleQuotes ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g, '$2'
				)
			case 'multiple':
				return this.constructor.parseArgs(this.argString, this.command.argsCount, this.command.argsSingleQuotes)
			default:
				throw new RangeError(`Unknown argsType "${this.command.argsType}".`)
		}
	}

	/**
	 * Runs the command
	 * @return {Promise<?Message|?Array<Message>>}
	 */
	async run() { // eslint-disable-line complexity
		// Obtain the member if we don't have it
		if (this.channel.type !== 'DM' && !this.guild.members.cache.has(this.author.id) && !this.webhookId) {
			this.member = await this.guild.members.fetch(this.author)
		}

		// Obtain the member for the ClientUser if it doesn't already exist
		if (this.channel.type !== 'DM' && !this.guild.members.cache.has(this.client.user.id)) {
			await this.guild.members.fetch(this.client.user.id)
		}

		// Make sure the command is usable in this context
		if (this.command.dmOnly && this.guild) {
			this.client.emit('commandBlock', this, 'dmOnly')
			return this.command.onBlock(this, 'dmOnly')
		}

		// Make sure the command is usable in this context
		if ((this.command.guildOnly || this.command.serverOwnerOnly) && !this.guild) {
			this.client.emit('commandBlock', this, 'guildOnly')
			return this.command.onBlock(this, 'guildOnly')
		}

		// Ensure the channel is a NSFW one if required
		if (this.command.nsfw && !this.channel.nsfw) {
			this.client.emit('commandBlock', this, 'nsfw')
			return this.command.onBlock(this, 'nsfw')
		}

		// Ensure the user has permission to use the command
		const hasPermission = this.command.hasPermission(this)
		if (hasPermission === false || hasPermission instanceof Array) {
			if (!hasPermission) {
				if (this.command.ownerOnly && !this.client.isOwner(this.author)) {
					this.client.emit('commandBlock', this, 'ownerOnly')
					return this.command.onBlock(this, 'ownerOnly')
				}

				if (this.command.serverOwnerOnly && this.guild.ownerId !== this.author.id) {
					this.client.emit('commandBlock', this, 'serverOwnerOnly')
					return this.command.onBlock(this, 'serverOwnerOnly')
				}
			}
			const data = { missing: hasPermission }
			this.client.emit('commandBlock', this, 'userPermissions', data)
			return this.command.onBlock(this, 'userPermissions', data)
		}

		// Ensure the client user has the required permissions
		if (this.channel.type !== 'DM' && this.command.clientPermissions) {
			const missing = this.channel.permissionsFor(this.client.user).missing(this.command.clientPermissions)
			if (missing.length > 0) {
				const data = { missing }
				this.client.emit('commandBlock', this, 'clientPermissions', data)
				return this.command.onBlock(this, 'clientPermissions', data)
			}
		}

		// Throttle the command
		const throttle = this.command.throttle(this.author.id)
		if (throttle && throttle.usages + 1 > this.command.throttling.usages) {
			const remaining = (throttle.start + (this.command.throttling.duration * 1000) - Date.now()) / 1000
			const data = { throttle, remaining }
			this.client.emit('commandBlock', this, 'throttling', data)
			return this.command.onBlock(this, 'throttling', data)
		}

		// Figure out the command arguments
		let args = this.patternMatches
		let collResult = null
		if (!args && this.command.argsCollector) {
			const collArgs = this.command.argsCollector.args
			const count = collArgs[collArgs.length - 1].infinite ? Infinity : collArgs.length
			const provided = this.constructor.parseArgs(this.argString.trim(), count, this.command.argsSingleQuotes)

			collResult = await this.command.argsCollector.obtain(this, provided)
			if (collResult.cancelled) {
				if (collResult.prompts.length === 0 || collResult.cancelled === 'promptLimit') {
					const err = new CommandFormatError(this)
					return this.reply({ content: err.message, ...noReplyInDMs(this) })
				}

				this.client.emit('commandCancel', this.command, collResult.cancelled, this, collResult)
				return this.reply({ content: 'Cancelled command.', ...noReplyInDMs(this) })
			}
			args = collResult.values
		}
		if (!args) args = this.parseArgs()
		const fromPattern = Boolean(this.patternMatches)

		// Run the command
		if (throttle) throttle.usages++
		try {
			this.client.emit('debug', `Running command ${this.command.groupId}:${this.command.memberName}.`)
			const promise = this.command.run(this, args, fromPattern, collResult)

			this.client.emit('commandRun', this.command, promise, this, args, fromPattern, collResult)
			const retVal = await promise
			if (!(retVal instanceof Message || retVal instanceof Array || retVal === null || retVal === undefined)) {
				throw new TypeError(oneLine`
					Command ${this.command.name}'s run() resolved with an unknown type
					(${retVal !== null ? retVal && retVal.constructor ? retVal.constructor.name : typeof retVal : null}).
					Command run methods must return a Promise that resolve with a Message, Array of Messages, or null/undefined.
				`)
			}
			return retVal
		} catch (err) {
			this.client.emit('commandError', this.command, err, this, args, fromPattern, collResult)
			if (err instanceof FriendlyError) {
				return this.reply(err.message)
			} else {
				return this.command.onError(err, this, args, fromPattern, collResult)
			}
		}
	}

	/**
	 * Type of the response
	 * @typedef {'reply'|'direct'|'plain'|'code'} ResponseType
	 */

	/**
	 * Options for the response
	 * @typedef {Object} ResponseOptions
	 * @property {ResponseType} [type] Type of the response
	 * @property {MessageOptions} [options] Options of the response
	 * @property {string} [lang] Language of the response, if its type is `code`
	 * @property {boolean} [fromEdit] If the response is from an edited message
	 */

	/**
	 * Responds to the command message
	 * @param {ResponseOptions} [options] Options for the response
	 * @return {Message|Message[]}
	 * @private
	 */
	respond({ type = 'reply', content = '', options = {}, lang = '', fromEdit = false }) {
		const shouldEdit = this.responses && !fromEdit

		if (type === 'reply' && this.channel.type === 'dm') type = 'plain'
		if (type !== 'direct') {
			if (this.guild && !this.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
				type = 'direct'
			}
		}

		if (content) options.content = resolveString(content)
		options = { ...options, ...noReplyInDMs(this) }

		switch (type) {
			case 'plain':
				if (!shouldEdit) return this.channel.send(options)
				return this.editCurrentResponse(channelIdOrDM(this.channel), { type, options })
			case 'reply':
				if (!shouldEdit) return super.reply(options)
				return this.editCurrentResponse(channelIdOrDM(this.channel), { type, options })
			case 'direct':
				if (!shouldEdit) return this.author.send(options)
				return this.editCurrentResponse('dm', { type, options })
			case 'code':
				options.content = `\`\`\`${lang}\n${escapeMarkdown(content, true)}\n\`\`\``
				if (!shouldEdit) return this.channel.send(options)
				return this.editCurrentResponse(channelIdOrDM(this.channel), { type, options })
			default:
				throw new RangeError(`Unknown response type "${type}".`)
		}
	}

	/**
	 * Edits a response to the command message
	 * @param {Message|Message[]} response The response message(s) to edit
	 * @param {ResponseOptions} [options] Options for the response
	 * @return {Promise<Message>}
	 * @private
	 */
	editResponse(response, { type, options }) {
		if (!response) return this.respond({ type, options, fromEdit: true })

		if (options.content instanceof Array) {
			const promises = []
			if (response instanceof Array) {
				for (let i = 0; i < options.content.length; i++) {
					if (response.length > i) promises.push(response[i].edit(`${options.content[i]}`/* , options */))
					else promises.push(response[0].channel.send(`${options.content[i]}`))
				}
			} else {
				promises.push(response.edit(`${options.content[0]}`/* , options */))
				for (let i = 1; i < options.content.length; i++) {
					promises.push(response.channel.send(`${options.content[i]}`))
				}
			}
			return Promise.all(promises)
		} else {
			if (response instanceof Array) { // eslint-disable-line no-lonely-if
				for (let i = response.length - 1; i > 0; i--) response[i].delete()
				return response[0].edit(options)
			} else {
				return response.edit(options)
			}
		}
	}

	/**
	 * Edits the current response
	 * @param {string} id The id of the channel the response is in ("DM" for direct messages)
	 * @param {ResponseOptions} [options] Options for the response
	 * @return {Promise<Message>}
	 * @private
	 */
	editCurrentResponse(id, options) {
		if (typeof this.responses[id] === 'undefined') this.responses[id] = []
		if (typeof this.responsePositions[id] === 'undefined') this.responsePositions[id] = -1
		this.responsePositions[id]++
		return this.editResponse(this.responses[id][this.responsePositions[id]], options)
	}

	/**
	 * Responds with a plain message
	 * @param {StringResolvable} content Content for the message
	 * @param {MessageOptions} [options] Options for the message
	 * @return {Promise<Message>}
	 */
	say(content, options) {
		if (!options && typeof content === 'object' && !(content instanceof Array)) {
			options = content
			content = ''
		}
		return this.respond({ type: 'plain', content, options })
	}

	/**
	 * Responds with a direct message
	 * @param {StringResolvable} content Content for the message
	 * @param {MessageOptions} [options] Options for the message
	 * @return {Promise<Message>}
	 */
	direct(content, options) {
		if (!options && typeof content === 'object' && !(content instanceof Array)) {
			options = content
			content = ''
		}
		return this.respond({ type: 'direct', content, options })
	}

	/**
	 * Responds with a code message
	 * @param {string} lang Language for the code block
	 * @param {StringResolvable} content Content for the message
	 * @param {MessageOptions} [options] Options for the message
	 * @return {Promise<Message>}
	 */
	code(lang, content, options) {
		if (!options && typeof content === 'object' && !(content instanceof Array)) {
			options = content
			content = ''
		}
		if (typeof options !== 'object') options = {}
		return this.respond({ type: 'code', content, lang, options })
	}

	/**
	 * Responds with an embed
	 * @param {MessageEmbed|MessageEmbed[]} embed Embed to send
	 * @param {StringResolvable} [content] Content for the message
	 * @param {MessageOptions} [options] Options for the message
	 * @return {Promise<Message>}
	 */
	embed(embed, content = '', options) {
		if (!options && typeof content === 'object' && !(content instanceof Array)) {
			options = content
			content = ''
		}
		if (typeof options !== 'object') options = {}
		options.embeds = embed instanceof Array ? embed : [embed]
		return this.respond({ type: 'plain', content, options })
	}

	/**
	 * Responds with a reply + embed
	 * @param {MessageEmbed|MessageEmbed[]} embed Embed to send
	 * @param {StringResolvable} [content] Content for the message
	 * @param {MessageOptions} [options] Options for the message
	 * @return {Promise<Message>}
	 */
	replyEmbed(embed, content = '', options) {
		if (!options && typeof content === 'object' && !(content instanceof Array)) {
			options = content
			content = ''
		}
		if (typeof options !== 'object') options = {}
		options.embeds = embed instanceof Array ? embed : [embed]
		return this.respond({ type: 'reply', content, options })
	}

	/**
	 * Finalizes the command message by setting the responses and deleting any remaining prior ones
	 * @param {?Array<Message|Message[]>} responses Responses to the message
	 * @private
	 */
	finalize(responses) {
		if (this.responses) this.deleteRemainingResponses()
		this.responses = {}
		this.responsePositions = {}

		if (responses instanceof Array) {
			for (const response of responses) {
				const channel = (response instanceof Array ? response[0] : response).channel
				const id = channelIdOrDM(channel)
				if (!this.responses[id]) {
					this.responses[id] = []
					this.responsePositions[id] = -1
				}
				this.responses[id].push(response)
			}
		} else if (responses) {
			const id = channelIdOrDM(responses.channel)
			this.responses[id] = [responses]
			this.responsePositions[id] = -1
		}
	}

	/**
	 * Deletes any prior responses that haven't been updated
	 * @private
	 */
	deleteRemainingResponses() {
		for (const id of Object.keys(this.responses)) {
			const responses = this.responses[id]
			for (let i = this.responsePositions[id] + 1; i < responses.length; i++) {
				const response = responses[i]
				if (response instanceof Array) {
					for (const resp of response) resp.delete()
				} else {
					response.delete()
				}
			}
		}
	}

	/**
	 * Parses an argument string into an array of arguments
	 * @param {string} argString The argument string to parse
	 * @param {number} [argCount] The number of arguments to extract from the string
	 * @param {boolean} [allowSingleQuote=true] Whether or not single quotes should be allowed to wrap arguments,
	 * in addition to double quotes
	 * @return {string[]} The array of arguments
	 */
	static parseArgs(argString, argCount, allowSingleQuote = true) {
		const argStringModified = removeSmartQuotes(argString, allowSingleQuote)
		const re = allowSingleQuote ? /\s*(?:("|')([^]*?)\1|(\S+))\s*/g : /\s*(?:(")([^]*?)"|(\S+))\s*/g
		const result = []
		let match = []
		// Large enough to get all items
		argCount = argCount || argStringModified.length
		// Get match and push the capture group that is not null to the result
		while (--argCount && (match = re.exec(argStringModified))) result.push(match[2] || match[3])
		// If text remains, push it to the array as-is (except for wrapping quotes, which are removed)
		if (match && re.lastIndex < argStringModified.length) {
			const re2 = allowSingleQuote ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g
			result.push(argStringModified.substr(re.lastIndex).replace(re2, '$2'))
		}
		return result
	}
}

/**
 * @param {string} argString
 * @param {boolean} [allowSingleQuote=true]
 */
function removeSmartQuotes(argString, allowSingleQuote = true) {
	let replacementArgString = argString
	const singleSmartQuote = /[‘’]/g
	const doubleSmartQuote = /[“”]/g
	if (allowSingleQuote) replacementArgString = argString.replace(singleSmartQuote, '\'')
	return replacementArgString
		.replace(doubleSmartQuote, '"')
}

/** @param {TextBasedChannels} channel */
function channelIdOrDM(channel) {
	if (channel.type !== 'DM') return channel.id
	return 'dm'
}

/**
 * Determines whether a user should be pinged in a reply.
 * If the message is in DMs, no ping should be sent.
 * @param {Message} msg The message to reply.
 * @returns Whether the user should be pinged or not.
 */
function noReplyInDMs(msg) {
	/** @type {MessageOptions} */
	const options = msg.channel.type === 'DM' ? {
		allowedMentions: { repliedUser: false }
	} : {}

	return options
}

module.exports = CommandoMessage