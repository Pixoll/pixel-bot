const { MessageButton, MessageActionRow } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')

/** A command that can be run in a client */
module.exports = class InviteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            aliases: ['support'],
            group: 'info',
            description: 'Invite this bot to your server.',
            guarded: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
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

        await message.reply({
            content: '\u200B',
            components: [row]
        })
    }
}