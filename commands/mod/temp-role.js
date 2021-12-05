/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { Role, GuildMember } = require('discord.js')
const {
    memberDetails, timeDetails, roleDetails, reasonDetails, timestamp, isValidRole, getArgument, replyAll
} = require('../../utils')
const { basicEmbed, docId } = require('../../utils')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class TempRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'temp-role',
            aliases: ['temprole'],
            group: 'mod',
            description: 'Assign a role that persists for a limited time.',
            details: `${roleDetails()}\n${memberDetails()}\n${timeDetails('time')}\n${reasonDetails()}`,
            format: 'temprole [role] [member] [duration] <reason>',
            examples: ['temprole Moderator Pixoll 1d'],
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
            guildOnly: true,
            args: [
                {
                    key: 'role',
                    prompt: 'What role would you want to give then?',
                    type: 'role'
                },
                {
                    key: 'member',
                    prompt: 'What member do you want to give the role?',
                    type: 'member'
                },
                {
                    key: 'duration',
                    prompt: 'How long should this role last?',
                    type: ['date', 'duration']
                },
                {
                    key: 'reason',
                    prompt: 'Why are you\'re giving them the role?',
                    type: 'string',
                    max: 512,
                    default: 'No reason given.'
                }
            ],
            slash: {
                options: [
                    {
                        type: 'role',
                        name: 'role',
                        description: 'The role to give.',
                        required: true
                    },
                    {
                        type: 'user',
                        name: 'member',
                        description: 'The member to give the role.',
                        required: true
                    },
                    {
                        type: 'string',
                        name: 'duration',
                        description: 'For how long they should have the role.',
                        required: true
                    },
                    {
                        type: 'string',
                        name: 'reason',
                        description: 'Why are you giving them the role.'
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to give the role
     * @param {number} args.duration The duration of the role
     * @param {Role} args.role The role to give
     * @param {string} args.reason The reason
     */
    async run({ message, interaction }, { member, duration, role, reason }) {
        if (interaction) {
            if (!isValidRole(await interaction.fetchReply(), role)) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'That is not a valid role to use.'
                }))
            }
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

        if (message) {
            while (!isValidRole(message, role)) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
                if (cancelled) return
                role = value
            }
        }

        const { guild, guildId } = message || interaction
        const author = message?.author || interaction.user
        const { user, roles } = member

        if (roles.cache.has(role.id)) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That member already has that role.'
            }))
        }

        await roles.add(role, reason)

        if (!user.bot) {
            await user.send({
                embeds: [basicEmbed({
                    color: 'GOLD',
                    fieldName: `You have been given the \`${role.name}\` role on ${guild.name}`,
                    fieldValue: stripIndent`
                        **Expires:** ${timestamp(duration, 'R')}
                        **Reason:** ${reason}
                        **Moderator:** ${author.toString()} ${author.tag}
                    `
                })]
            }).catch(() => null)
        }

        await guild.database.active.add({
            _id: docId(),
            type: 'temp-role',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            role: role.id,
            duration
        })

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `Added role \`${role.name}\` to ${user.tag}`,
            fieldValue: stripIndent`
                **Expires:** ${timestamp(duration, 'R')}
                **Reason:** ${reason}
            `
        }))
    }
}