const Command = require('../../command-handler/commands/base')
const { prefixes } = require('../../schemas')
const { stripIndent } = require('common-tags')
const { basicEmbed } = require('../../utils')
const { CommandoMessage } = require('../../command-handler/typings')
const { PrefixSchema } = require('../../schemas/types')

/** A command that can be run in a client */
module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'prefix',
			group: 'settings',
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
				label: 'new prefix',
				prompt: 'What is the new prefix you want to set for the bot?',
				type: 'string',
				required: false
			}]
		})
	}

	/**
	 * Runs the command
	 * @param {CommandoMessage} message The message the command is being run for
	 * @param {object} args The arguments for the command
	 * @param {string} args.newPrefix The new prefix to set
	 */
	async run(message, { newPrefix }) {
		const { guild, client, member } = message

		if (!newPrefix) {
			const prefix = guild?.prefix || client.prefix
			const description = guild ? `The bot prefix in this server is \`${prefix}\`` :
				`The global bot prefix is \`${prefix}\``

			return await message.replyEmbed(basicEmbed({
				color: 'BLUE', emoji: 'info', description
			}))
		}

		if (!guild && !client.isOwner(message)) {
			return await this.onBlock(message, 'ownerOnly')
		}

		if (guild && !member.permissions.has('ADMINISTRATOR')) {
			return await this.onBlock(message, 'userPermissions', { missing: ['ADMINISTRATOR'] })
		}

		if (guild) guild.prefix = newPrefix
		else client.prefix = newPrefix

		const getPrefix = await prefixes.findOne({ guild: guild?.id, global: !guild })

		/** @type {PrefixSchema} */
		const newDoc = {
			global: !guild,
			guild: guild?.id,
			prefix: newPrefix
		}

		if (getPrefix) await getPrefix.updateOne({ prefix: newPrefix })
		else await new prefixes(newDoc).save()

		const description = guild ? `Changed the bot prefix of this server to \`${newPrefix}\`` :
			`Changed the global bot prefix to \`${newPrefix}\``

		await message.replyEmbed(basicEmbed({
			color: 'GREEN', emoji: 'check', description
		}))

		if (!guild) {
			client.user.setPresence({
				activities: [{
					name: `for ${newPrefix}help`,
					type: 'WATCHING'
				}]
			})
		}
	}
}