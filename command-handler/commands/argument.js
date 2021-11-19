/* eslint-disable no-unused-vars */
const { Util: { escapeMarkdown }, MessageEmbed } = require('discord.js')
const { oneLine, stripIndent } = require('common-tags')
const isPromise = require('is-promise')
const ArgumentUnionType = require('../types/union')
const {
	ArgumentInfo, ArgumentDefault, ArgumentType, CommandoClient, ArgumentResult, CommandoMessage
} = require('../typings')
/* eslint-enable no-unused-vars */

/** A fancy argument */
class Argument {
	/**
	 * @param {CommandoClient} client Client the argument is for
	 * @param {ArgumentInfo} info Information for the command argument
	 */
	constructor(client, info) {
		this.constructor.validateInfo(client, info)

		/**
		 * Key for the argument
		 * @type {string}
		 */
		this.key = info.key

		/**
		 * Label for the argument
		 * @type {string}
		 * @default this.key
		 */
		this.label = info.label || info.key

		/**
		 * Question prompt for the argument
		 * @type {string}
		 */
		this.prompt = info.prompt

		/**
		 * Error message for when a value is invalid
		 * @type {?string}
		 */
		this.error = info.error || null

		/**
		 * Type of the argument
		 * @type {?ArgumentType}
		 */
		this.type = this.constructor.determineType(client, info.type)

		/**
		 * If type is `integer` or `float`, this is the maximum value of the number.
		 * If type is `string`, this is the maximum length of the string.
		 * @type {?number}
		 */
		this.max = typeof info.max !== 'undefined' ? info.max : null

		/**
		 * If type is `integer` or `float`, this is the minimum value of the number.
		 * If type is `string`, this is the minimum length of the string.
		 * @type {?number}
		 */
		this.min = typeof info.min !== 'undefined' ? info.min : null

		/**
		 * The default value for the argument
		 * @type {?ArgumentDefault}
		 */
		this.default = typeof info.default !== 'undefined' ? info.default : null

		/**
		 * Whether the argument is required or not
		 * @type {boolean}
		 * @default true
		 */
		this.required = typeof info.required === 'boolean' ? info.required :
			(this.default === undefined || this.default === null)

		/**
		 * Whether the argument's validation is skipped or not
		 * @type {boolean}
		 * @default false
		 */
		this.skipValidation = typeof info.skipValidation === 'boolean' ? info.skipValidation : false

		/**
		 * Values the user can choose from
		 * If type is `string`, this will be case-insensitive
		 * If type is `channel`, `member`, `role`, or `user`, this will be the Ids.
		 * @type {?string[]}
		 */
		this.oneOf = typeof info.oneOf !== 'undefined' ?
			info.oneOf.map(el => el.toLowerCase ? el.toLowerCase() : el) :
			null

		/**
		 * Whether the argument accepts an infinite number of values
		 * @type {boolean}
		 * @default false
		 */
		this.infinite = Boolean(info.infinite)

		/**
		 * Validator function for validating a value for the argument
		 * @type {?Function}
		 * @see {@link ArgumentType#validate}
		 */
		this.validator = info.validate || null

		/**
		 * Parser function for parsing a value for the argument
		 * @type {?Function}
		 * @see {@link ArgumentType#parse}
		 */
		this.parser = info.parse || null

		/**
		 * Function to check whether a raw value is considered empty
		 * @type {?Function}
		 * @see {@link ArgumentType#isEmpty}
		 */
		this.emptyChecker = info.isEmpty || null

		/**
		 * How long to wait for input (in seconds)
		 * @type {number}
		 * @default 30
		 */
		this.wait = typeof info.wait !== 'undefined' ? info.wait : 30
	}

	/**
	 * Prompts the user and obtains the value for the argument
	 * @param {CommandoMessage} msg Message that triggered the command
	 * @param {string} [val] Pre-provided value for the argument
	 * @param {number} [promptLimit=Infinity] Maximum number of times to prompt for the argument
	 * @return {Promise<ArgumentResult>}
	 */
	async obtain(msg, val, promptLimit = Infinity) {
		let empty = this.isEmpty(val, msg)
		if (empty && !this.required) {
			return {
				value: typeof this.default === 'function' ? await this.default(msg, this) : this.default,
				cancelled: null,
				prompts: [],
				answers: []
			}
		}
		if (this.infinite) return this.obtainInfinite(msg, val, promptLimit)

		const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : undefined
		const prompts = []
		const answers = []
		let valid = !empty ? await this.validate(val, msg) : false

		while (!valid || typeof valid === 'string') {
			if (prompts.length >= promptLimit) {
				return {
					value: null,
					cancelled: 'promptLimit',
					prompts,
					answers
				}
			}

			const prompt = new MessageEmbed()
				.setColor(empty && this.prompt ? 'BLUE' : 'RED')
				.setFooter(wait ? `The command will automatically be cancelled in ${this.wait} seconds.` : '')
				.addField(this.prompt, stripIndent`
					**Don't type the whole command again!** Only what I ask for.
					Respond with \`cancel\` to cancel the command.
				`)

			if (!empty) {
				prompt.setDescription(
					valid ? `**${valid}**` : `You provided an invalid ${this.label}. Please try again.`
				)
			}

			// Prompt the user for a new value
			prompts.push(await msg.replyEmbed(prompt))

			// Get the user's response
			const responses = await msg.channel.awaitMessages({
				filter: msg2 => msg2.author.id === msg.author.id,
				max: 1,
				time: wait
			})

			// Make sure they actually answered
			if (responses && responses.size === 1) {
				answers.push(responses.first())
				val = answers[answers.length - 1].content
			} else {
				return {
					value: null,
					cancelled: 'time',
					prompts,
					answers
				}
			}

			// See if they want to cancel
			if (val.toLowerCase() === 'cancel') {
				return {
					value: null,
					cancelled: 'user',
					prompts,
					answers
				}
			}

			empty = this.isEmpty(val, msg, responses.first())
			valid = await this.validate(val, msg, responses.first())
		}

		return {
			value: await this.parse(val, msg, answers.length ? answers[answers.length - 1] : msg),
			cancelled: null,
			prompts,
			answers
		}
	}

	/**
	 * Prompts the user and obtains multiple values for the argument
	 * @param {CommandoMessage} msg Message that triggered the command
	 * @param {string[]} [vals] Pre-provided values for the argument
	 * @param {number} [promptLimit=Infinity] Maximum number of times to prompt for the argument
	 * @return {Promise<ArgumentResult>}
	 * @private
	 */
	async obtainInfinite(msg, vals, promptLimit = Infinity) {
		const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : undefined
		const results = []
		const prompts = []
		const answers = []
		let currentVal = 0

		while (true) {
			let val = vals && vals[currentVal] ? vals[currentVal] : null
			let valid = val ? await this.validate(val, msg) : false
			let attempts = 0

			while (!valid || typeof valid === 'string') {
				attempts++
				if (attempts > promptLimit) {
					return {
						value: null,
						cancelled: 'promptLimit',
						prompts,
						answers
					}
				}

				// Prompt the user for a new value
				if (val) {
					const escaped = escapeMarkdown(val).replace(/@/g, '@\u200b')

					const prompt = new MessageEmbed()
						.setColor('RED')
						.setDescription(valid || oneLine`
							You provided an invalid ${this.label},
							"${escaped.length < 1850 ? escaped : '[too long to show]'}".
							Please try again.
						`)
						.addField(this.prompt, stripIndent`
							**Don't type the whole command again!** Only what I ask for.
							Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry up to this point.
						`)
						.setFooter(wait ? `The command will automatically be cancelled in ${this.wait} seconds.` : '')

					prompts.push(await msg.replyEmbed(prompt))
				} else if (results.length === 0) {
					const prompt = new MessageEmbed()
						.setColor('BLUE')
						.addField(
							this.prompt,
							stripIndent`
								**Don't type the whole command again!** Only what I ask for.
								Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry.
							`
						)
						.setFooter(wait ?
							`The command will automatically be cancelled in ${this.wait} seconds, unless you respond.` : ''
						)

					prompts.push(await msg.replyEmbed(prompt))
				}

				// Get the user's response
				const responses = await msg.channel.awaitMessages({
					filter: msg2 => msg2.author.id === msg.author.id,
					max: 1,
					time: wait
				})

				// Make sure they actually answered
				if (responses && responses.size === 1) {
					answers.push(responses.first())
					val = answers[answers.length - 1].content
				} else {
					return {
						value: null,
						cancelled: 'time',
						prompts,
						answers
					}
				}

				// See if they want to finish or cancel
				const lc = val.toLowerCase()
				if (lc === 'finish') {
					return {
						value: results.length > 0 ? results : null,
						cancelled: this.default ? null : results.length > 0 ? null : 'user',
						prompts,
						answers
					}
				}
				if (lc === 'cancel') {
					return {
						value: null,
						cancelled: 'user',
						prompts,
						answers
					}
				}

				valid = await this.validate(val, msg, responses.first())
			}

			results.push(await this.parse(val, msg, answers.length ? answers[answers.length - 1] : msg))

			if (vals) {
				currentVal++
				if (currentVal === vals.length) {
					return {
						value: results,
						cancelled: null,
						prompts,
						answers
					}
				}
			}
		}
	}

	/**
	 * Checks if a value is valid for the argument
	 * @param {string} val Value to check
	 * @param {CommandoMessage} originalMsg Message that triggered the command
	 * @param {?CommandoMessage} [currentMsg=originalMsg] Current response message
	 * @return {boolean|string|Promise<boolean|string>}
	 */
	validate(val, originalMsg, currentMsg = originalMsg) {
		const valid = this.validator ?
			this.validator(val, originalMsg, this, currentMsg) :
			this.type.validate(val, originalMsg, this, currentMsg)
		if (!valid || typeof valid === 'string') return this.error || valid
		if (isPromise(valid)) {
			return valid.then(vld => {
				const arr = typeof vld === 'string' ? vld.split('\n') : null
				if (arr) {
					if (arr.length === 1) return arr[0]
					else if (arr.length > 1) return arr.pop()
				}
				return !vld || typeof vld === 'string' ? this.error || vld : vld
			})
		}
		return valid
	}

	/**
	 * Parses a value string into a proper value for the argument
	 * @param {string} val Value to parse
	 * @param {CommandoMessage} originalMsg Message that triggered the command
	 * @param {?CommandoMessage} [currentMsg=originalMsg] Current response message
	 * @return {*|Promise<*>}
	 */
	parse(val, originalMsg, currentMsg = originalMsg) {
		if (this.parser) return this.parser(val, originalMsg, this, currentMsg)
		return this.type.parse(val, originalMsg, this, currentMsg)
	}

	/**
	 * Checks whether a value for the argument is considered to be empty
	 * @param {string} val Value to check for emptiness
	 * @param {CommandoMessage} originalMsg Message that triggered the command
	 * @param {?CommandoMessage} [currentMsg=originalMsg] Current response message
	 * @return {boolean}
	 */
	isEmpty(val, originalMsg, currentMsg = originalMsg) {
		if (this.emptyChecker) return this.emptyChecker(val, originalMsg, this, currentMsg)
		if (this.type) return this.type.isEmpty(val, originalMsg, this, currentMsg)
		if (Array.isArray(val)) return val.length === 0
		return !val
	}

	/**
	 * Validates the constructor parameters
	 * @param {CommandoClient} client Client to validate
	 * @param {ArgumentInfo} info Info to validate
	 * @private
	 */
	static validateInfo(client, info) {
		if (!client) throw new Error('The argument client must be specified.')
		if (typeof info !== 'object') throw new TypeError('Argument info must be an Object.')
		if (typeof info.key !== 'string') throw new TypeError('Argument key must be a string.')
		if (info.label && typeof info.label !== 'string') throw new TypeError('Argument label must be a string.')
		if (typeof info.prompt !== 'string') throw new TypeError('Argument prompt must be a string.')
		if (info.error && typeof info.error !== 'string') throw new TypeError('Argument error must be a string.')
		if (Array.isArray(info.type)) info.type = info.type.join('|')
		if (info.type && typeof info.type !== 'string') {
			throw new TypeError('Argument type must be a string or an Array of strings.')
		}
		if (info.type && !info.type.includes('|') && !client.registry.types.has(info.type)) {
			throw new RangeError(`Argument type "${info.type}" isn't registered.`)
		}
		if (!info.type && !info.validate) {
			throw new Error('Argument must have either "type" or "validate" specified.')
		}
		if (info.validate && typeof info.validate !== 'function') {
			throw new TypeError('Argument validate must be a function.')
		}
		if (info.parse && typeof info.parse !== 'function') {
			throw new TypeError('Argument parse must be a function.')
		}
		if (!info.type && (!info.validate || !info.parse)) {
			throw new Error('Argument must have both validate and parse since it doesn\'t have a type.')
		}
		if (typeof info.wait !== 'undefined' && (typeof info.wait !== 'number' || Number.isNaN(info.wait))) {
			throw new TypeError('Argument wait must be a number.')
		}
	}

	/**
	 * Gets the argument type to use from an id
	 * @param {CommandoClient} client Client to use the registry of
	 * @param {string|string[]} id Id of the type to use
	 * @returns {?ArgumentType}
	 * @private
	 */
	static determineType(client, id) {
		if (!id) return null
		if (Array.isArray(id)) id = id.join('|')
		if (!id.includes('|')) return client.registry.types.get(id)

		let type = client.registry.types.get(id)
		if (type) return type
		type = new ArgumentUnionType(client, id)
		client.registry.registerType(type)
		return type
	}
}

module.exports = Argument