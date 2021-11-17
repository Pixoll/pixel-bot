/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { MessageEmbed, Invite } = require('discord.js')
const { timestamp } = require('../../utils')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class InviteInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'inviteinfo',
            aliases: ['invite-info'],
            group: 'misc',
            description: 'Displays information about an invite.',
            details: '`invite` may be a link, an invite codes, or a vanity code.',
            format: 'inviteinfo [invite]',
            examples: [
                'inviteinfo minecraft',
                'inviteinfo https://discord.gg/Pc9pAHf3GU'
            ],
            args: [{
                key: 'invite',
                prompt: 'What invite do you want to get information from?',
                type: 'invite'
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {Invite} args.invite The invite
     */
    async run(message, { invite }) {
        const { guild, channel, url, inviter, presenceCount, memberCount, maxUses, expiresAt, temporary } = invite

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(guild.name, guild.iconURL({ dynamic: true }), url)
            .setDescription(stripIndent`
                **Inviter:** ${inviter || 'Inviter is unavailable.'}
                **Channel:** ${channel.toString()}
                **Online members:** ${presenceCount.toLocaleString()}/${memberCount.toLocaleString()}
                **Max uses:** ${maxUses || 'No limit'}
                **Expires:** ${expiresAt ? timestamp(expiresAt) : 'Never'}
                **Temp. membership:** ${temporary ? 'Yes' : 'No'}
            `)
            .setFooter(`Server id: ${guild.id}`)

        await message.replyEmbed(embed)
    }
}