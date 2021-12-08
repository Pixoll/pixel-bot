/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { MessageActionRow, MessageButton, GuildMember, MessageEmbed } = require('discord.js')
const { replyAll } = require('../../utils/functions')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class MemberAvatarCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'member-avatar',
            aliases: ['memberavatar', 'mavatar', 'mav'],
            group: 'misc',
            description: 'Displays a member\'s server avatar, or yours if you don\'t specify any.',
            details: stripIndent`
                \`member\` can be either a member's name, mention or id.
                If no server avatar was found, it will display the user's avatar instead.
            `,
            format: 'mavatar <member>',
            examples: ['mavatar Pixoll'],
            guildOnly: true,
            args: [{
                key: 'member',
                prompt: 'What member do you want to get their server avatar from?',
                type: 'member',
                required: false
            }],
            slash: {
                options: [{
                    type: 'user',
                    name: 'member',
                    description: 'The member to get the avatar from.'
                }]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The user to get the avatar from
     */
    async run({ message, interaction }, { member }) {
        member ??= (message || interaction).member
        const { user, displayName } = member

        const avatar = member.displayAvatarURL({ dynamic: true, size: 2048 })

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${user.tag} • AKA. ${displayName}`, user.displayAvatarURL({ dynamic: true }))
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