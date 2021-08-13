const util = require('util')
const discord = require('discord.js')
const { stripIndents } = require('common-tags')
const { Command, CommandoMessage } = require('discord.js-commando')

/** @param {string} str */
function escapeRegex(str) {
	return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

const nlPattern = new RegExp('!!NL!!', 'g')

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'eval',
			group: 'owner',
			memberName: 'eval',
			description: 'Executes JavaScript code.',
			details: 'Only the bot owner(s) may use this command.',
			format: 'eval [script]',
			ownerOnly: true,
			hidden: true,
			args: [{
				key: 'script',
				prompt: 'What code would you like to evaluate?',
				type: 'string'
			}]
		})

		this.lastResult = null
		Object.defineProperty(this, '_sensitivePattern', { value: null, configurable: true })
	}

	onBlock() { return }
	onError() { return }

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
		var hrDiff
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
		const split = inspected.split('\n')
		const last = inspected.length - 1
		const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== "'" ? split[0] : inspected[0]
		const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== "'" ?
			split[split.length - 1] :
			inspected[last]
		const prepend = `\`\`\`javascript\n${prependPart}\n`
		const append = `\n${appendPart}\n\`\`\``
		if (input) {
			return discord.splitMessage(stripIndents`
				*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append })
		} else {
			return discord.splitMessage(stripIndents`
				*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append })
		}
	}

	get sensitivePattern() {
		if (!this._sensitivePattern) {
			const client = this.client
			var pattern = ''
			if (client.token) pattern += escapeRegex(client.token)
			Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(pattern, 'gi'), configurable: false })
		}
		return this._sensitivePattern
	}
};
