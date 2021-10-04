const util = require('util')
const { Util: { splitMessage } } = require('discord.js')
const { stripIndents } = require('common-tags')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')

/** @param {string} str */
function escapeRegex(str) {
	return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
}

const nlPattern = new RegExp('!!NL!!', 'g')

/** A command that can be run in a client */
module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'eval',
			group: 'owner',
			description: 'Executes JavaScript code.',
			details: 'Only the bot owner(s) may use this command.',
			format: 'eval [script]',
			ownerOnly: true,
			hidden: true,
			guarded: true,
			args: [{
				key: 'script',
				prompt: 'What code would you like to evaluate?',
				type: 'string'
			}]
		})

		this.lastResult = null
		this._sensitivePattern = null
	}

	/**
	 * 
	 * @param {CommandoMessage} message The message
	 * @param {object} args The arguments
	 * @param {string} script The script to evaluate
	 */
	run(message, { script }) {
		// Make a bunch of helpers
		/* eslint-disable no-unused-vars */
		const client = message.client
		const lastResult = this.lastResult
		const doReply = val => {
			if (val instanceof Error) {
				message.reply(`Callback error: \`${val}\``)
			} else {
				const result = this.makeResultMessages(val, process.hrtime(this.hrStart))
				if (Array.isArray(result)) {
					for (const item of result) message.reply(item)
				} else {
					message.reply(result)
				}
			}
		}
		/* eslint-enable no-unused-vars */

		// Remove any surrounding code blocks before evaluation
		if (script.startsWith('```') && script.endsWith('```')) {
			script = script.replace(/(^.*?\s)|(\n.*$)/g, '')
		}

		// Run the code and measure its execution time
		let hrDiff
		try {
			const hrStart = process.hrtime()
			this.lastResult = eval(script)
			hrDiff = process.hrtime(hrStart)
		} catch (err) {
			return message.reply(`Error while evaluating: \`${err}\``)
		}

		// Prepare for callback time and respond
		this.hrStart = process.hrtime()
		const result = this.makeResultMessages(this.lastResult, hrDiff, script)
		if (Array.isArray(result)) {
			return result.map(item => message.reply(item))
		} else {
			return message.reply(result)
		}
	}

	makeResultMessages(result, hrDiff, input = null) {
		const inspected = util.inspect(result, { depth: 0 })
			.replace(nlPattern, '\n')
			.replace(this.sensitivePattern, '--snip--')
			.replace(escapeRegex(`/${this.client.token}/gi`), '--snip--')
		const split = inspected.split('\n')
		const last = inspected.length - 1
		const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== "'" ? split[0] : inspected[0]
		const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== "'" ?
			split[split.length - 1] :
			inspected[last]
		const prepend = `\`\`\`js\n${prependPart}\n`
		const append = `\n${appendPart}\n\`\`\``
		if (input) {
			return splitMessage(stripIndents`
				*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`js
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append })
		} else {
			return splitMessage(stripIndents`
				*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`js
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append })
		}
	}

	get sensitivePattern() {
		if (!this._sensitivePattern) {
			const client = this.client
			let pattern = ''
			if (client.token) pattern += escapeRegex(client.token)
			this._sensitivePattern = new RegExp(pattern, 'gi')
		}
		return this._sensitivePattern
	}
}
