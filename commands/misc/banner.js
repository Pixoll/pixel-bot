/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { User, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')
const { userDetails, noReplyInDMs, basicEmbed, embedColor } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class BannerCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'banner',
            group: 'misc',
            description: 'Displays a user\'s banner, or yours if you don\'t specify any.',
            details: userDetails,
            format: 'banner <user>',
            examples: ['banner Pixoll'],
            args: [{
                key: 'user',
                prompt: 'What user do you want to get their banner from?',
                type: 'user',
                required: false
            }],
            slash: {
                options: [{
                    type: 'user',
                    name: 'user',
                    description: 'The user to get the banner from.'
                }]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to get the banner from
     */
    async run({ message, interaction }, { user }) {
        if (interaction) user = user?.user ?? user ?? interaction.user
        if (message) user ??= message.author
        user = await user.fetch()

        const banner = user.bannerURL({ dynamic: true, size: 2048 })
        if (!banner) {
            const embed = basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'That user has no banner on their profile.'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        const embed = new MessageEmbed()
            .setColor(embedColor)
            .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
            .setImage(banner)
            .setTimestamp()

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setLabel('Download')
                    .setURL(banner)
            )

        const options = { embeds: [embed], components: [row], ...noReplyInDMs(message) }
        await interaction?.editReply(options)
        await message?.reply(options)
    }
}