/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')
const { replyAll } = require('../../utils/functions')
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
            .setColor('#4c9f4c')
            .setAuthor({
                name: guild.name, iconURL: guild.iconURL({ dynamic: true })
            })
            .setImage(icon)
            .setTimestamp()

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setLabel('Download')
                    .setURL(icon)
            )

        await replyAll({ message, interaction }, { embeds: [embed], components: [row] })
    }
}
