/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { User, TextChannel, GuildMember } = require('discord.js')
const {
    docId, basicEmbed, userDetails, reasonDetails, userException, memberException, inviteButton, inviteMaxAge,
    confirmButtons
} = require('../../utils')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class SoftBanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'soft-ban',
            aliases: ['softban'],
            group: 'mod',
            description: 'Soft-ban a user (Ban and immediate unban to delete user messages).',
            details: `${userDetails}\n${reasonDetails()}`,
            format: 'softban [user] <reason>',
            examples: [
                'softban Pixoll',
                'softban Pixoll Mass-spam'
            ],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true,
            args: [
                {
                    key: 'user',
                    prompt: 'What user do you want to soft-ban?',
                    type: 'user'
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
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to soft-ban
     * @param {string} args.reason The reason of the soft-ban
     */
    async run({ message }, { user, reason }) {
        const { guild, author, guildId } = message
        const { members, bans, database } = guild

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
        const confirm = await confirmButtons({ message }, 'soft-ban', user, { reason })
        if (!confirm) return

        if (!user.bot && !!member) {
            const embed = basicEmbed({
                color: 'GOLD',
                fieldName: `You have been soft-banned from ${guild.name}`,
                fieldValue: stripIndent`
                    **Reason:** ${reason}
                    **Moderator:** ${author.toString()}

                    *The invite will expire in 1 week.*
                `
            })

            /** @type {TextChannel} */
            const channel = guild.channels.cache.filter(c => c.type === 'GUILD_TEXT').first()
            const button = inviteButton(
                await channel.createInvite({ maxAge: inviteMaxAge, maxUses: 1 })
            )

            await user.send({ embeds: [embed], components: [button] }).catch(() => null)
        }

        await members.ban(user, { days: 7, reason })
        await members.unban(user, 'Soft-ban')

        await database.moderations.add({
            _id: docId(),
            type: 'soft-ban',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason
        })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `${user.tag} has been soft-banned`,
            fieldValue: `**Reason:** ${reason}`
        }))
    }
}