/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { MessageActionRow, MessageButton } = require('discord.js')
const { noReplyInDMs, replyAll } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class VoteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'vote',
            group: 'misc',
            description: 'Vote for the bot and make it grow!',
            slash: true
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setEmoji('👍')
                    .setLabel('Vote me')
                    .setURL('https://top.gg/bot/802267523058761759/vote')
            )

        await replyAll({ message, interaction }, {
            content: 'Vote for the bot with the button below!',
            components: [row]
        })
    }
}
