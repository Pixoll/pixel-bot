/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { embedColor, basicEmbed } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'info',
            description: 'Pong! 🏓',
            guarded: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const pingMsg = await message.replyEmbed(basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Pinging...'
        }))

        const roundtrip = pingMsg.createdTimestamp - message.createdTimestamp
        const heartbeat = Math.round(this.client.ws.ping || 0)

        const embed = new MessageEmbed()
            .setColor(embedColor)
            .setTitle('🏓 Pong!')
            .setDescription(stripIndent`
                **Your ping:** ${roundtrip}ms
                **Bot's ping:** ${heartbeat}ms
            `)

        await pingMsg.edit({ embeds: [embed] }).catch(() => null)
    }
}