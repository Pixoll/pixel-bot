const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { GuildMember } = require('discord.js')
const { memberDetails, reasonDetails, basicEmbed, modConfirmation } = require('../../utils')

/** A command that can be run in a client */
module.exports = class UnmuteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unmute',
            group: 'mod',
            description: 'Unmute a member.',
            details: `${memberDetails()}\n${reasonDetails()}`,
            format: 'unmute [member] <reason>',
            examples: [
                'unmute Pixoll',
                'unmute Pixoll Appealed'
            ],
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to unmute?',
                    type: 'member'
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason of the unmute?',
                    type: 'string',
                    max: 512,
                    default: 'No reason given.'
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to unmute
     * @param {string} args.reason The reason of the unmute
     */
    async run(message, { member, reason }) {
        const { guild, author } = message
        const { active, setup } = guild.database
        const { user, roles } = member

        const data = await setup.fetch()
        if (!data || !data.mutedRole) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross',
                description: 'No mute role found in this server, please use the `setup` command before using this.'
            }))
        }

        const role = await guild.roles.fetch(data.mutedRole)

        if (!roles.cache.has(role.id)) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That user is not muted.'
            }))
        }

        const confirm = await modConfirmation(message, 'unmute', member.user, { reason })
        if (!confirm) return

        await roles.remove(role)
        this.client.emit('guildMemberUnmute', guild, author, user, reason)

        const mute = await active.fetch({ type: 'mute', user: { id: user.id } })
        if (mute) await active.delete(mute)

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', fieldName: `${user.tag} has been unmuted`,
            fieldValue: `**Reason:** ${reason}`
        }))
    }
}