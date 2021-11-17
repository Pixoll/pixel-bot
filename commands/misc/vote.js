/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { MessageActionRow, MessageButton } = require('discord.js')
const { noReplyInDMs } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class VoteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'vote',
            group: 'misc',
            description: 'Vote for the bot and make it grow!'
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setEmoji('👍')
                    .setLabel('Vote me')
                    .setURL('https://top.gg/bot/802267523058761759/vote')
            )

        await message.reply({
            content: 'Vote for the bot with the button below!',
            components: [row],
            ...noReplyInDMs(message)
        })
    }
}