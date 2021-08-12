const { Command, CommandoMessage } = require('discord.js-commando')
const { MessageEmbed, Invite } = require('discord.js')
const { formatDate } = require('../../utils/functions')
const { oneLine, stripIndent } = require('common-tags')

module.exports = class inviteinfo extends Command {
    constructor(client) {
        super(client, {
            name: 'inviteinfo',
            group: 'misc',
            memberName: 'inviteinfo',
            description: 'Displays information about an invite.',
            details: oneLine`
                This command supports invite links, invite codes, and vanity codes.
                An error message will be sent if the invite does not exist.
            `,
            format: 'inviteinfo [invite]',
            examples: ['inviteinfo minecraft', 'inviteinfo https://discord.gg/Pc9pAHf3GU'],
            args: [{
                key: 'invite',
                prompt: 'The invite you want to get information from.',
                type: 'string',
                /** @param {string} invite */
                validate: async (invite) => {
                    return await this.client.fetchInvite(invite.split('/').pop()).catch(() => null)
                },
                /** @param {string} invite */
                parse: async (invite) => {
                    return await this.client.fetchInvite(invite.split('/').pop()).catch(() => null)
                },
                error: 'That invite does not exist. Please type a valid one.'
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {Invite} args.invite The invite
     */
    async run(message, { invite }) {
        // gets data from the invite
        const { guild, channel, url, inviter, presenceCount, memberCount, maxUses, expiresAt, temporary } = invite

        // creates an embed with the information
        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(guild.name, guild.iconURL({ dynamic: true }), url)
            .addField('Invite Information', stripIndent`
                **>** **Inviter:** ${inviter || 'None'}
                **>** **Channel:** #${channel.name}
                **>** **Online Members:** ${presenceCount}/${memberCount}
                **>** **Max uses:** ${maxUses || 'No limit'}
                **>** **Expires at:** ${expiresAt ? formatDate(expiresAt) : 'Never'}
                **>** **Temporary membership:** ${temporary ? 'Yes' : 'No'}
            `)
            .setFooter(`Server ID: ${guild.id}`)

        message.say(embed)
    }
}