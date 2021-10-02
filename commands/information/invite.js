const { MessageButton, MessageActionRow } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')

/** A command that can be run in a client */
module.exports = class InviteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'invite',
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
        const button = new MessageButton()
            .setLabel('Invite')
            .setStyle('LINK')
            .setURL(this.client.botInvite)

        const row = new MessageActionRow()
            .addComponents(button)

        await message.reply({
            content: 'Click the button below to invite the bot.',
            components: [row]
        })
    }
}