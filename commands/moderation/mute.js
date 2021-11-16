const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { GuildMember } = require('discord.js')
const { myMs, timeDetails, reasonDetails, memberDetails, userException, memberException, timestamp, confirmButtons } = require('../../utils')
const { docId, basicEmbed } = require('../../utils')
const { stripIndent } = require('common-tags')

/** A command that can be run in a client */
module.exports = class MuteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            group: 'mod',
            description: 'Mute a member so they cannot type or speak.',
            details: `${memberDetails()}\n${timeDetails('duration')}\n${reasonDetails()}`,
            format: 'mute [member] [duration] <reason>',
            examples: ['mute Pixoll 2h', 'mute Pixoll 6h Excessive swearing'],
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to mute?',
                    type: 'member'
                },
                {
                    key: 'duration',
                    prompt: 'How long should the mute last?',
                    type: ['date', 'duration']
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason of the mute?',
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
     * @param {GuildMember} args.member The member to mute
     * @param {number|Date} args.duration The duration of the mute
     * @param {string} args.reason The reason of the mute
     */
    async run(message, { member, duration, reason }) {
        if (typeof duration === 'number') duration = duration + Date.now()
        if (duration instanceof Date) duration = duration.getTime()

        const { guild, author, guildId } = message
        const { moderations, active, setup } = guild.database
        const { user, roles } = member

        const data = await setup.fetch()
        if (!data || !data.mutedRole) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross',
                description: 'No mute role found in this server, please use the `setup` command before using this.'
            }))
        }

        const uExcept = userException(user, author, this)
        if (uExcept) return await message.replyEmbed(basicEmbed(uExcept))
        const mExcept = memberException(member, this)
        if (mExcept) return await message.replyEmbed(basicEmbed(mExcept))
        const confirm = await confirmButtons(message, 'mute', member.user, { reason })
        if (!confirm) return

        const role = await guild.roles.fetch(data.mutedRole)
        if (!role) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross',
                description: 'No mute role found in this server, please use the `setup` command before using this.'
            }))
        }

        if (roles.cache.has(role.id)) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That user is already muted.'
            }))
        }

        await roles.add(role)
        this.client.emit('guildMemberMute', guild, author, user, reason, duration)

        if (!user.bot) {
            await user.send({
                embeds: [basicEmbed({
                    color: 'GOLD', fieldName: `You have been muted on ${guild.name}`,
                    fieldValue: stripIndent`
                        **Expires:** ${timestamp(duration, 'R')}
                        **Reason:** ${reason}
                        **Moderator:** ${author.toString()}
                    `
                })]
            }).catch(() => null)
        }

        const documentId = docId()

        await moderations.add({
            _id: documentId,
            type: 'mute',
            guild: guildId,
            user: { id: user.id, tag: user.tag },
            mod: { id: author.id, tag: author.tag },
            reason,
            duration: myMs(duration - Date.now(), { long: true })
        })
        await active.add({
            _id: documentId,
            type: 'mute',
            guild: guildId,
            user: { id: user.id, tag: user.tag },
            duration
        })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', fieldName: `${user.tag} has been muted`,
            fieldValue: stripIndent`
                **Expires:** ${timestamp(duration, 'R')}
                **Reason:** ${reason}
            `
        }))
    }
}