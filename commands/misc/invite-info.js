/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { MessageEmbed, Invite } = require('discord.js')
const { timestamp, basicEmbed } = require('../../utils')
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
            const string = interaction.options.getString('invite')
            invite = await this.client.fetchInvite(string).catch(() => null)
            if (!invite) {
                const embed = basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'That invite is invalid.'
                })
                return await interaction.editReply({ embeds: [embed] })
            }
        }

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

        await interaction?.editReply({ embeds: [embed] })
        await message?.replyEmbed(embed)
    }
}