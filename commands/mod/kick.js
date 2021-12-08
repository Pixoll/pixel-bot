/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { GuildMember, TextChannel } = require('discord.js')
const {
    docId, basicEmbed, memberException, userException, inviteButton, confirmButtons, replyAll
} = require('../../utils/functions')
const { stripIndent } = require('common-tags')
const { CommandInstances } = require('../../command-handler/typings')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class KickCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            group: 'mod',
            description: 'Kick a member.',
            details: stripIndent`
                \`member\` can be either a member's name, mention or id.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'kick [member] <reason>',
            examples: [
                'kick Pixoll',
                'kick Pixoll Get out!'
            ],
            clientPermissions: ['KICK_MEMBERS'],
            userPermissions: ['KICK_MEMBERS'],
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to kick?',
                    type: 'member'
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason of the kick?',
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
                        description: 'The member to kick.',
                        required: true
                    },
                    {
                        type: 'string',
                        name: 'reason',
                        description: 'The reason of the kick.'
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to kick
     * @param {string} args.reason The reason of the kick
     */
    async run({ message, interaction }, { member, reason }) {
        if (interaction) {
            if (!(member instanceof GuildMember)) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'That is not a valid member in this server.'
                }))
            }
            reason ??= 'No reason given.'
            if (reason.length > 512) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'Please keep the reason below or exactly 512 characters.'
                }))
            }
        }

        const { guild, guildId, member: mod } = message || interaction
        const author = message?.author || interaction.user
        const { user } = member

        const uExcept = userException(user, author, this)
        if (uExcept) return await replyAll({ message, interaction }, basicEmbed(uExcept))

        const mExcept = memberException(member, mod, this)
        if (mExcept) return await replyAll({ message, interaction }, basicEmbed(mExcept))

        const confirmed = await confirmButtons({ message }, 'kick', user, { reason })
        if (!confirmed) return

        if (!user.bot) {
            const embed = basicEmbed({
                color: 'GOLD',
                fieldName: `You have been kicked from ${guild.name}`,
                fieldValue: stripIndent`
                    **Reason:** ${reason}
                    **Moderator:** ${author.toString()} ${author.tag}

                    *The invite will expire in 1 week.*
                `
            })

            /** @type {TextChannel} */
            const channel = guild.channels.cache.filter(c => c.type === 'GUILD_TEXT').first()
            const button = inviteButton(
                await channel.createInvite({ maxAge: 604_800, maxUses: 1 })
            )

            await user.send({ embeds: [embed], components: [button] }).catch(() => null)
        }

        await member.kick(reason)

        await guild.database.moderations.add({
            _id: docId(),
            type: 'kick',
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
            fieldName: `${user.tag} has been kicked`,
            fieldValue: `**Reason:** ${reason}`
        }))
    }
}