/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { stripIndent } = require('common-tags')
const { basicEmbed } = require('../../utils')
const { CommandInstances } = require('../../command-handler/typings')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class PrefixCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'prefix',
            group: 'utility',
            description: 'Get or change the prefix of the bot.',
            details: stripIndent`
				If \`new prefix\` is not defined, it will send the current prefix.
				Otherwise, it will change the current prefix for \`new prefix\`.
			`,
            format: 'prefix <new prefix>',
            examples: ['prefix ?'],
            guarded: true,
            args: [{
                key: 'newPrefix',
                label: 'new prefix',
                prompt: 'What is the new prefix you want to set for the bot?',
                type: 'string',
                required: false
            }]
        })

        this.globalDb = this.client.database.prefixes
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.newPrefix The new prefix to set
     */
    async run({ message }, { newPrefix }) {
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
            return await this.onBlock({ message }, 'ownerOnly')
        }

        if (guild && !client.isOwner(message) && !member.permissions.has('ADMINISTRATOR')) {
            return await this.onBlock({ message }, 'userPermissions', { missing: ['ADMINISTRATOR'] })
        }

        const current = guild?.prefix || client?.prefix
        if (current === newPrefix) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: `The current prefix is already \`${newPrefix}\``
            }))
        }

        if (guild) guild.prefix = newPrefix
        else client.prefix = newPrefix

        const targetDb = guild ? guild.database.prefixes : this.globalDb
        const doc = await targetDb.fetch()

        if (client.prefix === guild?.prefix) {
            await targetDb.delete(doc)
        } else {
            if (doc) await targetDb.update(doc, { prefix: newPrefix })
            else {
                await targetDb.add({
                    global: !guild,
                    guild: guild?.id,
                    prefix: newPrefix
                })
            }
        }

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