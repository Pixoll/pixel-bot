/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { User, TextChannel, GuildMember } = require('discord.js')
const {
    docId, basicEmbed, userDetails, reasonDetails, userException, memberException, inviteButton, inviteMaxAge,
    confirmButtons,
    replyAll
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
            description: 'Soft-ban a user (Ban to delete their messages and then immediately unban).',
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
                    prompt: 'What is the reason of the soft-ban?',
                    type: 'string',
                    max: 512,
                    default: 'No reason given.'
                }
            ],
            slash: {
                options: [
                    {
                        type: 'user',
                        name: 'user',
                        description: 'The user to soft-ban.',
                        required: true
                    },
                    {
                        type: 'string',
                        name: 'reason',
                        description: 'The reason of the soft-ban.'
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to soft-ban
     * @param {string} args.reason The reason of the soft-ban
     */
    async run({ message, interaction }, { user, reason }) {
        if (interaction) {
            user = user.user || user
            reason ??= 'No reason given.'
            if (reason.length > 512) {
                return await interaction.editReply({
                    embeds: [basicEmbed({
                        color: 'RED', emoji: 'cross', description: 'Please keep the reason below or exactly 512 characters.'
                    })]
                })
            }
        }

        const { guild, guildId } = message
        const { members, bans, database } = guild
        const author = message?.author || interaction.user

        const uExcept = userException(user, author, this)
        if (uExcept) return await replyAll({ message, interaction }, basicEmbed(uExcept))

        const isBanned = await bans.fetch(user).catch(() => null)
        if (isBanned) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That user is already banned.'
            }))
        }

        /** @type {GuildMember} */
        const member = await members.fetch(user).catch(() => null)
        const mExcept = memberException(member, this)
        if (mExcept) return await replyAll({ message, interaction }, basicEmbed(mExcept))

        const confirmed = await confirmButtons({ message }, 'soft-ban', user, { reason })
        if (!confirmed) return

        if (!user.bot && !!member) {
            const embed = basicEmbed({
                color: 'GOLD',
                fieldName: `You have been soft-banned from ${guild.name}`,
                fieldValue: stripIndent`
                    **Reason:** ${reason}
                    **Moderator:** ${author.toString()} ${author.tag}

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
        await members.unban(user, 'Soft-ban.')

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

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `${user.tag} has been soft-banned`,
            fieldValue: `**Reason:** ${reason}`
        }))
    }
}