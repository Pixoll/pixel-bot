const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { MessageActionRow, MessageButton, GuildMember } = require('discord.js')
const { noReplyInDMs, memberDetails } = require('../../utils')

/** A command that can be run in a client */
module.exports = class ServerAvatarCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'serveravatar',
            aliases: ['savatar', 'sav'],
            group: 'misc',
            description: 'Displays a member\'s server avatar, or yours if you don\'t specify any.',
            details: memberDetails() + '\nIf no server avatar was found, it will display the user\'s avatar instead.',
            format: 'savatar <member>',
            examples: ['savatar Pixoll'],
            guildOnly: true,
            args: [{
                key: 'member',
                prompt: 'What member do you want to get their server avatar from?',
                type: 'member',
                required: false
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The user to get the avatar from
     */
    async run(message, { member }) {
        if (!member) member = message.member
        const { user, displayName } = member

        const avatar = member.displayAvatarURL({ dynamic: true, size: 2048 })
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setLabel('Download')
                    .setURL(avatar)
            )

        const text = displayName !== user.username ?
            `(${member.displayName}) ${user.tag}` : user.tag

        await message.channel.sendTyping().catch(() => null)
        await message.reply({ content: text, files: [avatar], components: [row], ...noReplyInDMs(message) })
    }
}