const { Command, CommandoMessage } = require('discord.js-commando')
const { prefixes } = require('../../utils/mongodb-schemas')
const { stripIndent } = require('common-tags')
const { basicEmbed } = require('../../utils/functions')

module.exports = class prefix extends Command {
	constructor(client) {
		super(client, {
			name: 'prefix',
			group: 'info',
			memberName: 'prefix',
			description: 'Get or change the prefix of the bot.',
			details: stripIndent`
				If \`new prefix\` is not defined, it will send the current prefix.
				Otherwise, it will change the current prefix for \`new prefix\`.
			`,
			format: 'prefix <new prefix>',
			examples: ['prefix ?'],
			guarded: true,
			throttling: { usages: 1, duration: 3 },
			args: [{
				key: 'newPrefix',
				prompt: 'What is the new prefix you want to set for the bot?',
				type: 'string',
				default: ''
			}]
		})
	}

	onBlock() { return }
	onError() { return }

	/**
	 * @param {CommandoMessage} message The message
	 * @param {object} args The arguments
	 * @param {string} args.newPrefix The new prefix to set
	 */
	async run(message, { newPrefix }) {
		// gets data that will be used later
		const { guild, author, member } = message
		const { client } = this

		if (!newPrefix) {
			// gets the current prefix
			const prefix = guild ? guild.commandPrefix : client.commandPrefix

			return message.say(basicEmbed('blue', 'info', `The prefix is \`${prefix}\``))
		}

		// checks if the command was used in DMs and if the user in the bot's owner
		if (!guild && !client.isOwner(author)) return message.say(basicEmbed('red', 'cross', 'Only the bot\'s owner can change the global prefix.'))

		// checks if the user has admin permissions before changing the current prefix
		if (guild && !member.permissions.has('ADMINISTRATOR')) {
			client.emit('commandBlock', message, 'permission', { missing: ['ADMINISTRATOR'] })
			return
		}

		// changes the prefix
		if (guild) guild.commandPrefix = newPrefix
		else client.commandPrefix = newPrefix

		// tries to get the mongodb document
		const getPrefix = await prefixes.findOne({ guild: guild?.id, global: !guild })

		// creates a new document
		const newDoc = {
			global: !guild,
			guild: guild?.id,
			prefix: newPrefix
		}

		// updates the prefix document
		if (getPrefix) await getPrefix.updateOne({ prefix: newPrefix })
		else await new prefixes(newDoc).save()

		message.say(basicEmbed('green', 'check', `Changed the prefix to \`${newPrefix}\``))
	}
}