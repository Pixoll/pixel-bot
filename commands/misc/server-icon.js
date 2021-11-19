/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')
const { noReplyInDMs, embedColor } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class ServerIconCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'server-icon',
            aliases: ['servericon', 'sicon'],
            group: 'misc',
            description: 'Displays the server\'s icon.',
            guildOnly: true,
            slash: true
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const { guild } = message || interaction

        const icon = guild.iconURL({ dynamic: true, size: 2048 })

        const embed = new MessageEmbed()
            .setColor(embedColor)
            .setAuthor(guild.name, guild.iconURL({ dynamic: true }))
            .setImage(icon)
            .setTimestamp()

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setLabel('Download')
                    .setURL(icon)
            )

        const options = { embeds: [embed], components: [row], ...noReplyInDMs(message) }
        await interaction?.editReply(options)
        await message?.reply(options)
    }
}