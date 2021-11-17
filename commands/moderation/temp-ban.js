/* eslint-disable no-unused-vars */
const { User, GuildMember, TextChannel } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const {
    docId, basicEmbed, timeDetails, userDetails, reasonDetails, userException, memberException, timestamp,
    inviteButton, confirmButtons
} = require('../../utils')
const { stripIndent } = require('common-tags')
const { myMs } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class TempBanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'tempban',
            aliases: ['temp-ban'],
            group: 'mod',
            description: 'Ban a user for a specified amount of time.',
            details: `${userDetails}\n${timeDetails('duration')}\n${reasonDetails()}`,
            format: 'tempban [user] [duration] <reason>',
            examples: [
                'tempban Pixoll 1d',
                'tempban Pixoll 30d Advertising in DM\'s'
            ],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true,
            args: [
                {
                    key: 'user',
                    prompt: 'What user do you want to ban?',
                    type: 'user'
                },
                {
                    key: 'duration',
                    prompt: 'How long should the ban last?',
                    type: ['date', 'duration']
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason of the ban?',
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
     * @param {User} args.user The user to temp-ban
     * @param {number} args.duration The duration of the temp-ban
     * @param {string} args.reason The reason of the temp-ban
     */
    async run(message, { user, duration, reason }) {
        if (typeof duration === 'number') duration = duration + Date.now()
        if (duration instanceof Date) duration = duration.getTime()

        const { guild, author, guildId } = message
        const { members, bans, database } = guild
        const { moderations, active } = database

        const uExcept = userException(user, author, this)
        if (uExcept) return await message.replyEmbed(uExcept)

        const isBanned = await bans.fetch(user).catch(() => null)
        if (isBanned) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That user is already banned.'
            }))
        }

        /** @type {GuildMember} */
        const member = await members.fetch(user).catch(() => null)
        const mExcept = memberException(member, this)
        if (mExcept) return await message.replyEmbed(basicEmbed(mExcept))
        const confirm = await confirmButtons(message, 'temp-ban', user, { reason })
        if (!confirm) return

        if (!user.bot && !!member) {
            const embed = basicEmbed({
                color: 'GOLD',
                fieldName: `You have been temp-banned from ${guild.name}`,
                fieldValue: stripIndent`
                    **Expires:** ${timestamp(duration, 'R')}
                    **Reason:** ${reason}
                    **Moderator:** ${author.toString()}

                    *The invite will expire in 1 week.*
                `
            })

            /** @type {TextChannel} */
            const channel = guild.channels.cache.filter(c => c.type === 'GUILD_TEXT').first()
            const button = inviteButton(
                await channel.createInvite({ maxAge: 0, maxUses: 1 })
            )

            await user.send({ embeds: [embed], components: [button] }).catch(() => null)
        }

        await members.ban(user, { days: 7, reason })

        const documentId = docId()

        await moderations.add({
            _id: documentId,
            type: 'temp-ban',
            guild: guildId,
            user: { id: user.id, tag: user.tag },
            mod: { id: author.id, tag: author.tag },
            reason,
            duration: myMs(Date.now() - duration, { long: true })
        })
        await active.add({
            _id: documentId,
            type: 'temp-ban',
            guild: guildId,
            user: { id: user.id, tag: user.tag },
            duration
        })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `${user.tag} has been banned`,
            fieldValue: stripIndent`
                **Expires:** ${timestamp(duration, 'R')}
                **Reason:** ${reason}
            `
        }))
    }
}