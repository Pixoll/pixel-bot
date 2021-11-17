/* eslint-disable no-unused-vars */
const { CommandoMessage } = require('../typings')
const FriendlyError = require('./friendly')
/* eslint-enable no-unused-vars */

/**
 * Has a descriptive message for a command not having proper format
 * @extends {FriendlyError}
 */
class CommandFormatError extends FriendlyError {
	/**
	 * @param {CommandoMessage} msg The command message the error is for
	 */
	constructor(msg) {
		super(
			`Invalid command usage. The \`${msg.command.name}\` command's accepted format is: ${msg.usage(
				msg.command.format,
				msg.guild ? undefined : null,
				msg.guild ? undefined : null
			)}. Use ${msg.anyUsage(
				`help ${msg.command.name}`,
				msg.guild ? undefined : null,
				msg.guild ? undefined : null
			)} for more information.`
		)
		this.name = 'CommandFormatError'
	}
}

module.exports = CommandFormatError