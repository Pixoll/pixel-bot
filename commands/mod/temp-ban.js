/* eslint-disable no-unused-vars */
const { User, GuildMember, TextChannel } = require('discord.js')
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const {
    docId, basicEmbed, userException, memberException, timestamp, inviteButton, confirmButtons, replyAll
} = require('../../utils/functions')
const { stripIndent } = require('common-tags')
const myMs = require('../../utils/my-ms')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class TempBanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'temp-ban',
            aliases: ['tempban'],
            group: 'mod',
            description: 'Ban a user for a specified amount of time.',
            details: stripIndent`
                \`user\` has to be a user's username, id or mention.
                \`duration\` uses the bot's time formatting, for more information use the \`help\` command.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
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
            ],
            slash: {
                options: [
                    {
                        type: 'user',
                        name: 'user',
                        description: 'The user to ban.',
                        required: true
                    },
                    {
                        type: 'string',
                        name: 'duration',
                        description: 'The duration of the ban.',
                        required: true
                    },
                    {
                        type: 'string',
                        name: 'reason',
                        description: 'The reason of the ban.'
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to temp-ban
     * @param {number} args.duration The duration of the temp-ban
     * @param {string} args.reason The reason of the temp-ban
     */
    async run({ message, interaction }, { user, duration, reason }) {
        if (interaction) {
            user = user.user || user
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
        const { members, bans, database } = guild
        const { moderations, active } = database

        const uExcept = userException(user, author, this)
        if (uExcept) return replyAll({ message, interaction }, basicEmbed(uExcept))

        const isBanned = await bans.fetch(user).catch(() => null)
        if (isBanned) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That user is already banned.'
            }))
        }

        /** @type {GuildMember} */
        const member = await members.fetch(user).catch(() => null)
        const mExcept = memberException(member, mod, this)
        if (mExcept) return await replyAll({ message, interaction }, basicEmbed(mExcept))

        const confirmed = await confirmButtons({ message, interaction }, 'temp-ban', user, { reason })
        if (!confirmed) return

        if (!user.bot && member) {
            const embed = basicEmbed({
                color: 'GOLD',
                fieldName: `You have been temp-banned from ${guild.name}`,
                fieldValue: stripIndent`
                    **Expires:** ${timestamp(duration, 'R')}
                    **Reason:** ${reason}
                    **Moderator:** ${author.toString()} ${author.tag}

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
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason,
            duration: myMs(Date.now() - duration, { long: true })
        })
        await active.add({
            _id: documentId,
            type: 'temp-ban',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            duration
        })

        await replyAll({ message, interaction }, basicEmbed({
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
