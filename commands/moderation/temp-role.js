/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { Role, GuildMember } = require('discord.js')
const {
    memberDetails, timeDetails, roleDetails, reasonDetails, timestamp, isValidRole, getArgument
} = require('../../utils')
const { basicEmbed, docId } = require('../../utils')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class TempRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'temprole',
            aliases: ['temp-role'],
            group: 'mod',
            description: 'Assign a role that persists for a limited time.',
            details: `${memberDetails()}\n${timeDetails('time')}\n${roleDetails()}\n${reasonDetails()}`,
            format: 'temprole [member] [duration] [role] <reason>',
            examples: ['temprole Pixoll 1d Moderator'],
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
            guildOnly: true,
            args: [
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
                    key: 'role',
                    prompt: 'What role would you want to give then?',
                    type: 'role'
                },
                {
                    key: 'reason',
                    prompt: 'Why are you\'re giving them the role?',
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
     * @param {GuildMember} args.member The member to give the role
     * @param {number} args.duration The duration of the role
     * @param {Role} args.role The role to give
     * @param {string} args.reason The reason
     */
    async run(message, { member, duration, role, reason }) {
        if (typeof duration === 'number') duration = duration + Date.now()
        if (duration instanceof Date) duration = duration.getTime()

        while (!isValidRole(message, role)) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[2])
            if (cancelled) return
            role = value
        }

        const { guild, guildId, author } = message
        const { user, roles } = member

        if (roles.cache.has(role.id)) {
            return await message.replyEmbed(basicEmbed({
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
                        **Moderator:** ${author.toString()}
                    `
                })]
            }).catch(() => null)
        }

        await guild.database.active.add({
            _id: docId(),
            type: 'temp-role',
            guild: guildId,
            user: { id: user.id, tag: user.tag },
            role: role.id,
            duration
        })

        await message.replyEmbed(basicEmbed({
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