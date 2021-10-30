const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { User, MessageActionRow, MessageButton } = require('discord.js')
const { userDetails, noReplyInDMs, basicEmbed } = require('../../utils')

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
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to get the banner from
     */
    async run(message, { user }) {
        if (!user) user = message.author
        user = await user.fetch()

        const banner = user.bannerURL({ dynamic: true, size: 2048 })
        if (!banner) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'That user has no banner on their profile.'
            }))
        }

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setLabel('Download')
                    .setURL(banner)
            )

        await message.reply({ content: user.tag, files: [banner], components: [row], ...noReplyInDMs(message) })
    }
}