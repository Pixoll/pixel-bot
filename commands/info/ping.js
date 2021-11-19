/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { embedColor, basicEmbed } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'info',
            description: 'Pong! 🏓',
            guarded: true,
            slash: true
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const now = Date.now()
        const pingMsg = await message?.replyEmbed(basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Pinging...'
        }))

        const roundtrip = Math.abs(
            message ? (pingMsg.createdTimestamp - message.createdTimestamp) : (interaction.createdTimestamp - now)
        )
        const heartbeat = Math.round(this.client.ws.ping || 0)

        const embed = new MessageEmbed()
            .setColor(embedColor)
            .setTitle('🏓 Pong!')
            .setDescription(stripIndent`
                **Your ping:** ${roundtrip}ms
                **Bot's ping:** ${heartbeat}ms
            `)

        await interaction?.editReply({ embeds: [embed] })
        await pingMsg?.edit({ embeds: [embed] }).catch(() => null)
    }
}