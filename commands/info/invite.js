/* eslint-disable no-unused-vars */
const { MessageButton, MessageActionRow } = require('discord.js')
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class InviteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            aliases: ['support'],
            group: 'info',
            description: 'Invite this bot to your server.',
            guarded: true,
            slash: true
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const { botInvite, options } = this.client

        const invite = new MessageButton()
            .setEmoji('🔗')
            .setLabel('Invite me')
            .setStyle('LINK')
            .setURL(botInvite)
        const support = new MessageButton()
            .setEmoji('🛠')
            .setLabel('Support server')
            .setStyle('LINK')
            .setURL(options.serverInvite)

        const row = new MessageActionRow()
            .addComponents(invite, support)

        const reply = {
            content: '\u200B',
            components: [row]
        }
        await interaction?.editReply(reply)
        await message?.reply(reply)
    }
}