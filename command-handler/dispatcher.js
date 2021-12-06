/* eslint-disable no-unused-vars */
const { escapeRegex } = require('./util')
const isPromise = require('is-promise')
const CommandoRegistry = require('./registry')
const { Message, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const { CommandoMessage, Inhibition, Inhibitor, CommandoClient, CommandoInteraction } = require('./typings')
const { oneLine, stripIndent } = require('common-tags')
const { probability, embedColor } = require('../utils')
const FriendlyError = require('./errors/friendly')
/* eslint-enable no-unused-vars */

/** Handles parsing messages and running commands from them */
class CommandDispatcher {
	/**
	 * @param {CommandoClient} client Client the dispatcher is for
	 * @param {CommandoRegistry} registry Registry the dispatcher will use
	 */
	constructor(client, registry) {
		/**
		 * Client this dispatcher handles messages for
		 * @type {CommandoClient}
		 * @readonly
		 */
		this.client = client

		/**
		 * Registry this dispatcher uses
		 * @type {CommandoRegistry}
		 */
		this.registry = registry

		/**
		 * Functions that can block commands from running
		 * @type {Set<Function>}
		 */
		this.inhibitors = new Set()

		/**
		 * Map of {@link RegExp}s that match command messages, mapped by string prefix
		 * @type {Map<string, RegExp>}
		 * @private
		 */
		this._commandPatterns = new Map()

		/**
		 * Old command message results, mapped by original message id
		 * @type {Map<string, CommandoMessage>}
		 * @private
		 */
		this._results = new Map()

		/**
		 * Tuples in string form of user id and channel id that are currently awaiting messages from a user in a channel
		 * @type {Set<string>}
		 * @private
		 */
		this._awaiting = new Set()
	}

	/* eslint-disable no-tabs */
	/**
	 * Adds an inhibitor
	 * @param {Inhibitor} inhibitor The inhibitor function to add
	 * @return {boolean} Whether the addition was successful
	 * @example
	 * client.dispatcher.addInhibitor(msg => {
	 * 	if(blacklistedUsers.has(msg.author.id)) return 'blacklisted'
	 * })
	 * @example
	 * client.dispatcher.addInhibitor(msg => {
	 * 	if(!coolUsers.has(msg.author.id)) return {
	 * 		reason: 'cool',
	 * 		response: msg.reply('You\'re not cool enough!')
	 * 	}
	 * })
	 */
	/* eslint-enable no-tabs */
	addInhibitor(inhibitor) {
		if (typeof inhibitor !== 'function') throw new TypeError('The inhibitor must be a function.')
		if (this.inhibitors.has(inhibitor)) return false
		this.inhibitors.add(inhibitor)
		return true
	}

	/**
	 * Removes an inhibitor
	 * @param {Inhibitor} inhibitor The inhibitor function to remove
	 * @return {boolean} Whether the removal was successful
	 */
	removeInhibitor(inhibitor) {
		if (typeof inhibitor !== 'function') throw new TypeError('The inhibitor must be a function.')
		return this.inhibitors.delete(inhibitor)
	}

	/**
	 * Handle a new message or a message update
	 * @param {Message} message The message to handle
	 * @param {Message} [oldMessage] The old message before the update
	 * @return {Promise<void>}
	 * @private
	 */
	async handleMessage(message, oldMessage) {
		if (!this.shouldHandleMessage(message, oldMessage)) return

		// Parse the message, and get the old result if it exists
		let cmdMsg, oldCmdMsg
		if (oldMessage) {
			oldCmdMsg = this._results.get(oldMessage.id)
			if (!oldCmdMsg && !this.client.options.nonCommandEditable) return
			cmdMsg = this.parseMessage(message)
			if (cmdMsg && oldCmdMsg) {
				cmdMsg.responses = oldCmdMsg.responses
				cmdMsg.responsePositions = oldCmdMsg.responsePositions
			}
		} else {
			cmdMsg = this.parseMessage(message)
		}

		// Run the command, or reply with an error
		let responses
		if (cmdMsg) {
			const inhibited = this.inhibit(cmdMsg)

			if (!inhibited) {
				if (cmdMsg.command) {
					if (!cmdMsg.command.isEnabledIn(message.guild)) {
						if (!cmdMsg.command.unknown) {
							responses = await cmdMsg.replyEmbed(
								new MessageEmbed().setColor('RED').setDescription(
									`The \`${cmdMsg.command.name}\` command is disabled.`
								)
							)
						} else {
							this.client.emit('unknownCommand', cmdMsg)
							responses = undefined
						}
					} else if (!oldMessage || typeof oldCmdMsg !== 'undefined') {
						responses = await cmdMsg.run()
						if (typeof responses === 'undefined') responses = null
						if (Array.isArray(responses)) responses = await Promise.all(responses)
					}
				} else {
					this.client.emit('unknownCommand', cmdMsg)
					responses = undefined
				}
			} else {
				responses = await inhibited.response
			}

			cmdMsg.finalize(responses)
		} else if (oldCmdMsg) {
			oldCmdMsg.finalize(null)
			if (!this.client.options.nonCommandEditable) this._results.delete(message.id)
		}

		if (cmdMsg && oldMessage) {
			this.client.emit('cMessageUpdate', oldMessage, cmdMsg)
		}

		this.cacheCommandoMessage(message, oldMessage, cmdMsg, responses)
	}

	/**
	 * Handle a slash command interaction
	 * @param {CommandoInteraction} interaction The interaction to handle
	 * @return {Promise<void>}
	 * @private
	 */
	async handleSlash(interaction) {
		if (!interaction.isCommand()) return

		// Get the matching command
		/** @type {CommandoInteraction} */
		const { commandName, channelId, channel, guild, user, guildId, client } = interaction
		const command = this.registry.resolveCommand(commandName)
		if (!command) return
		const { groupId, memberName } = command

		const missingSlash = guild?.me.permissionsIn(channel).missing('USE_APPLICATION_COMMANDS')
		if (missingSlash && missingSlash.length !== 0) {
			return await user.send(stripIndent`
				It seems like I cannot **Use Application Commands** in this channel: ${channel.toString()}
				Please try in another channel, or contact the admins of **${guild.name}** to solve this issue.
			`).catch(() => null)
		}

		// Obtain the member if we don't have it
		if (channel.type !== 'DM' && !guild.members.cache.has(user.id)) {
			interaction.member = await guild.members.fetch(user)
		}

		// Obtain the member for the ClientUser if it doesn't already exist
		if (channel.type !== 'DM' && !guild.members.cache.has(client.user.id)) {
			await guild.members.fetch(client.user.id)
		}

		// Defers the reply
		await interaction.deferReply({ ephemeral: !!command.slash.ephemeral }).catch(() => null)

		// Make sure the command is usable in this context
		if (command.dmOnly && guild) {
			client.emit('commandBlock', { interaction }, 'dmOnly')
			return await command.onBlock({ interaction }, 'dmOnly')
		}

		// Make sure the command is usable in this context
		if ((command.guildOnly || command.guildOwnerOnly) && !guild) {
			client.emit('commandBlock', { interaction }, 'guildOnly')
			return await command.onBlock({ interaction }, 'guildOnly')
		}

		// Ensure the channel is a NSFW one if required
		if (command.nsfw && !channel.nsfw) {
			client.emit('commandBlock', { interaction }, 'nsfw')
			return await command.onBlock({ interaction }, 'nsfw')
		}

		// Ensure the user has permission to use the command
		const isOwner = client.isOwner(user)
		const hasPermission = command.hasPermission({ interaction })
		if (!isOwner && hasPermission !== true) {
			if (typeof hasPermission === 'string') {
				client.emit('commandBlock', { interaction }, hasPermission)
				return await command.onBlock({ interaction }, hasPermission)
			}
			const data = { missing: hasPermission }
			client.emit('commandBlock', { interaction }, 'userPermissions', data)
			return await command.onBlock({ interaction }, 'userPermissions', data)
		}

		// Ensure the client user has the required permissions
		if (channel.type !== 'DM' && command.clientPermissions) {
			const missing = channel.permissionsFor(client.user).missing(command.clientPermissions)
			if (missing.length > 0) {
				const data = { missing }
				client.emit('commandBlock', { interaction }, 'clientPermissions', data)
				return await command.onBlock({ interaction }, 'clientPermissions', data)
			}
		}

		// Run the command
		try {
			// Parses the options into an arguments object
			const options = {}
			for (const option of interaction.options.data) {
				/** @param {option} opt */
				function concat(opt) {
					if (opt.name && [undefined, null].includes(opt.value)) {
						options.subCommand = opt.name
					} else {
						const name = removeDashes(opt.name)
						switch (opt.type) {
							case 'BOOLEAN':
							case 'INTEGER':
							case 'NUMBER':
							case 'STRING':
							case 'SUB_COMMAND':
								options[name] = opt.value ?? null
								break
							case 'CHANNEL':
								options[name] = opt.channel ?? null
								break
							case 'MENTIONABLE':
								options[name] = opt.member ?? opt.user ?? opt.channel ?? opt.role ?? null
								break
							case 'ROLE':
								options[name] = opt.role ?? null
								break
							case 'USER':
								options[name] = opt.member ?? opt.user ?? null
								break
						}
					}
					opt.options?.forEach(concat)
				}
				concat(option)
			}

			client.emit('debug', `Running slash command "${groupId}:${memberName}" at "${guildId}-${channelId}".`)
			const promise = command.run({ interaction }, options, false, {})
			client.emit('commandRun', command, promise, { interaction }, options, false, {})
			await promise

			if (probability(2)) {
				const { user, botInvite } = client
				const embed = new MessageEmbed()
					.setColor(embedColor)
					.addField(`Enjoying ${user.username}?`, oneLine`
						The please consider voting for it! It helps the bot to become more noticed
						between other bots. And perhaps consider adding it to any of your own servers
						as well!
					`)
				const vote = new MessageButton()
					.setEmoji('👍')
					.setLabel('Vote me')
					.setStyle('LINK')
					.setURL('https://top.gg/bot/802267523058761759/vote')
				const invite = new MessageButton()
					.setEmoji('🔗')
					.setLabel('Invite me')
					.setStyle('LINK')
					.setURL(botInvite)
				const row = new MessageActionRow().addComponents(vote, invite)
				await channel.send({ embeds: [embed], components: [row] }).catch(() => null)
			}

			return
		} catch (err) {
			client.emit('commandError', command, err, { interaction })
			if (err instanceof FriendlyError) {
				if (interaction.deferred || interaction.replied) {
					return await interaction.editReply({ content: err.message, components: [], embeds: [] })
				} else {
					return await interaction.reply(err.message)
				}
			} else {
				return await command.onError(err, { interaction })
			}
		}
	}

	/**
	 * Check whether a message should be handled
	 * @param {Message} message The message to handle
	 * @param {Message} [oldMessage] The old message before the update
	 * @return {boolean}
	 * @private
	 */
	shouldHandleMessage(message, oldMessage) {
		// Ignore partial messages
		if (message.partial) return false

		if (message.author.bot) return false
		else if (message.author.id === this.client.user.id) return false

		// Ignore messages from users that the bot is already waiting for input from
		if (this._awaiting.has(message.author.id + message.channel.id)) return false

		// Make sure the edit actually changed the message content
		if (oldMessage && message.content === oldMessage.content) return false

		return true
	}

	/**
	 * Inhibits a command message
	 * @param {CommandoMessage} cmdMsg Command message to inhibit
	 * @return {?Inhibition}
	 * @private
	 */
	inhibit(cmdMsg) {
		for (const inhibitor of this.inhibitors) {
			let inhibit = inhibitor(cmdMsg)
			if (inhibit) {
				if (typeof inhibit !== 'object') inhibit = { reason: inhibit, response: undefined }

				const valid = typeof inhibit.reason === 'string' && (
					typeof inhibit.response === 'undefined' ||
					inhibit.response === null ||
					isPromise(inhibit.response)
				)
				if (!valid) {
					throw new TypeError(
						`Inhibitor "${inhibitor.name}" had an invalid result must be a string or an Inhibition object.`
					)
				}

				this.client.emit('commandBlock', { message: cmdMsg }, inhibit.reason, inhibit)
				return inhibit
			}
		}
		return null
	}

	/**
	 * Caches a command message to be editable
	 * @param {Message} message Triggering message
	 * @param {Message} oldMessage Triggering message's old version
	 * @param {CommandoMessage} cmdMsg Command message to cache
	 * @param {Message|Message[]} responses Responses to the message
	 * @private
	 */
	cacheCommandoMessage(message, oldMessage, cmdMsg, responses) {
		if (this.client.options.commandEditableDuration <= 0) return
		if (!cmdMsg && !this.client.options.nonCommandEditable) return
		if (responses !== null) {
			this._results.set(message.id, cmdMsg)
			if (!oldMessage) {
				setTimeout(() => {
					this._results.delete(message.id)
				}, this.client.options.commandEditableDuration * 1000)
			}
		} else {
			this._results.delete(message.id)
		}
	}

	/**
	 * Parses a message to find details about command usage in it
	 * @param {CommandoMessage} message The message
	 * @return {?CommandoMessage}
	 * @private
	 */
	parseMessage(message) {
		// Find the command to run by patterns
		for (const command of this.registry.commands.values()) {
			if (!command.patterns) continue
			for (const pattern of command.patterns) {
				const matches = pattern.exec(message.content)
				if (matches) return message.initCommand(command, null, matches)
			}
		}

		// Find the command to run with default command handling
		const prefix = message.guild?.prefix || this.client.prefix
		if (!this._commandPatterns.get(prefix)) this.buildCommandPattern(prefix)
		let cmdMsg = this.matchDefault(message, this._commandPatterns.get(prefix), 2)
		if (!cmdMsg && !message.guild) cmdMsg = this.matchDefault(message, /^([^\s]+)/i, 1, true)
		return cmdMsg
	}

	/**
	 * Matches a message against a guild command pattern
	 * @param {Message} message The message
	 * @param {RegExp} pattern The pattern to match against
	 * @param {number} commandNameIndex The index of the command name in the pattern matches
	 * @param {boolean} prefixless Whether the match is happening for a prefixless usage
	 * @return {?CommandoMessage}
	 * @private
	 */
	matchDefault(message, pattern, commandNameIndex = 1, prefixless = false) {
		const matches = pattern.exec(message.content)
		if (!matches) return null
		const commands = this.registry.findCommands(matches[commandNameIndex], true)
		if (commands.length !== 1 || !commands[0].defaultHandling) {
			return message.initCommand(this.registry.unknownCommand, prefixless ? message.content : matches[1])
		}
		const argString = message.content.substring(matches[1].length + (matches[2] ? matches[2].length : 0))
		return message.initCommand(commands[0], argString)
	}

	/**
	 * Creates a regular expression to match the command prefix and name in a message
	 * @param {?string} prefix Prefix to build the pattern for
	 * @return {RegExp}
	 * @private
	 */
	buildCommandPattern(prefix) {
		let pattern
		if (prefix) {
			const escapedPrefix = escapeRegex(prefix)
			pattern = new RegExp(
				`^(<@!?${this.client.user.id}>\\s+(?:${escapedPrefix}\\s*)?|${escapedPrefix}\\s*)([^\\s]+)`, 'i'
			)
		} else {
			pattern = new RegExp(`(^<@!?${this.client.user.id}>\\s+)([^\\s]+)`, 'i')
		}
		this._commandPatterns.set(prefix, pattern)
		this.client.emit('debug', `Built command pattern for prefix "${prefix}": ${pattern}`)
		return pattern
	}
}

module.exports = CommandDispatcher

/**
 * Removes dashes from the string and capitalizes the remaining strings
 * @param {string} str The string to parse
 */
function removeDashes(str) {
	if (!str) return
	const arr = str.split('-')
	const first = arr.shift()
	const rest = arr.map(s => capitalize(s)).join('')
	return first + rest
}

/**
 * Capitalizes every word of a string.
 * @param {string} str The string to capitalize.
 */
function capitalize(str) {
	if (!str) return ''

	const splitStr = str.toLowerCase().split(/ +/)
	for (let i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
	}
	return splitStr.join(' ')
}