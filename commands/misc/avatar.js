/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { User, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')
const { replyAll } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class AvatarCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'avatar',
            aliases: ['av'],
            group: 'misc',
            description: 'Displays a user\'s avatar, or yours if you don\'t specify any.',
            details: '`user` has to be a user\'s username, ID or mention.',
            format: 'avatar <user>',
            examples: ['avatar Pixoll'],
            args: [{
                key: 'user',
                prompt: 'What user do you want to get their avatar from?',
                type: 'user',
                required: false
            }],
            slash: {
                options: [{
                    type: 'user',
                    name: 'user',
                    description: 'The user to get the avatar from.'
                }]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to get the avatar from
     */
    async run({ message, interaction }, { user }) {
        if (interaction) user = user?.user ?? user ?? interaction.user
        if (message) user ??= message.author

        const avatar = user.displayAvatarURL({ dynamic: true, size: 2048 })

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
            .setImage(avatar)
            .setTimestamp()

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setLabel('Download')
                    .setURL(avatar)
            )

        await replyAll({ message, interaction }, { embeds: [embed], components: [row] })
    }
}
