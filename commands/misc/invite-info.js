/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { MessageEmbed, Invite } = require('discord.js')
const { timestamp, basicEmbed, replyAll } = require('../../utils/functions')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class InviteInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'invite-info',
            aliases: ['inviteinfo', 'invinfo'],
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
            }],
            slash: {
                options: [{
                    type: 'string',
                    name: 'invite',
                    description: 'The invite to get info from.',
                    required: true
                }]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {Invite} args.invite The invite
     */
    async run({ message, interaction }, { invite }) {
        if (interaction) {
            invite = await this.client.fetchInvite(invite).catch(() => null)
            if (!invite) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'That invite is invalid.'
                }))
            }
        }

        const { guild, channel, url, inviter, presenceCount, memberCount, maxUses, expiresAt, temporary } = invite

        const author = channel.type !== 'GROUP_DM' ?
            [guild.name, guild.iconURL({ dynamic: true })] :
            [channel.name, channel.iconURL()]

        const info = guild ? stripIndent`
            **Channel:** ${channel.toString()} ${channel.name}
            **Online members:** ${presenceCount}/${memberCount}
        ` : stripIndent`
            **Members:** ${memberCount}
        `

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(...author, url)
            .setDescription(stripIndent`
                **Inviter:** ${inviter ? `${inviter.toString()} ${inviter.tag}` : 'Inviter is unavailable.'}
                ${info}
                **Max uses:** ${maxUses || 'No limit'}
                **Expires:** ${expiresAt ? timestamp(expiresAt) : 'Never'}
                **Temp. membership:** ${temporary ? 'Yes' : 'No'}
            `)
            .setFooter(guild ?
                `Server ID: ${guild.id}` :
                `Group DM ID: ${channel.id}`
            )

        await replyAll({ message, interaction }, embed)
    }
}
