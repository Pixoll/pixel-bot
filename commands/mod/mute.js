/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { GuildMember } = require('discord.js')
const {
    myMs, timeDetails, reasonDetails, memberDetails, userException, memberException, timestamp, confirmButtons, replyAll
} = require('../../utils')
const { docId, basicEmbed } = require('../../utils')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

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
            ],
            slash: {
                options: [
                    {
                        type: 'user',
                        name: 'member',
                        description: 'The member to mute.',
                        required: true
                    },
                    {
                        type: 'string',
                        name: 'duration',
                        description: 'The duration of the mute.',
                        required: true
                    },
                    {
                        type: 'string',
                        name: 'reason',
                        description: 'The reason of the mute.'
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to mute
     * @param {number|Date} args.duration The duration of the mute
     * @param {string} args.reason The reason of the mute
     */
    async run({ message, interaction }, { member, duration, reason }) {
        if (interaction) {
            if (!(member instanceof GuildMember)) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'That is not a valid member in this server.'
                }))
            }
            const arg = this.argsCollector.args[1]
            duration = await arg.parse(duration).catch(() => null) || null
            if (!duration) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'The duration you specified is invalid.'
                }))
            }
            reason ??= 'No reason given.'
            if (reason.length > 512) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'Please keep the reason below or exactly 512 characters.'
                }))
            }
        }

        if (typeof duration === 'number') duration = duration + Date.now()
        if (duration instanceof Date) duration = duration.getTime()

        const { guild, guildId, member: mod } = message || interaction
        const author = message?.author || interaction.user
        const { moderations, active, setup } = guild.database
        const { user, roles } = member

        const data = await setup.fetch()
        if (!data || !data.mutedRole) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED',
                emoji: 'cross',
                description: 'No mute role found in this server, please use the `setup` command before using this.'
            }))
        }

        const uExcept = userException(user, author, this)
        if (uExcept) return await replyAll({ message, interaction }, basicEmbed(uExcept))

        const mExcept = memberException(member, mod, this)
        if (mExcept) return await replyAll({ message, interaction }, basicEmbed(mExcept))

        const confirmed = await confirmButtons({ message, interaction }, 'mute', member.user, { reason })
        if (!confirmed) return

        const role = await guild.roles.fetch(data.mutedRole)
        if (!role) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED',
                emoji: 'cross',
                description: 'No mute role found in this server, please use the `setup` command before using this.'
            }))
        }

        if (roles.cache.has(role.id)) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That user is already muted.'
            }))
        }

        await roles.add(role)
        this.client.emit('guildMemberMute', guild, author, user, reason, duration)

        if (!user.bot) {
            await user.send({
                embeds: [basicEmbed({
                    color: 'GOLD',
                    fieldName: `You have been muted on ${guild.name}`,
                    fieldValue: stripIndent`
                        **Expires:** ${timestamp(duration, 'R')}
                        **Reason:** ${reason}
                        **Moderator:** ${author.toString()} ${author.tag}
                    `
                })]
            }).catch(() => null)
        }

        const documentId = docId()

        await moderations.add({
            _id: documentId,
            type: 'mute',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason,
            duration: myMs(duration - Date.now(), { long: true })
        })
        await active.add({
            _id: documentId,
            type: 'mute',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            duration
        })

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `${user.tag} has been muted`,
            fieldValue: stripIndent`
                **Expires:** ${timestamp(duration, 'R')}
                **Reason:** ${reason}
            `
        }))
    }
}