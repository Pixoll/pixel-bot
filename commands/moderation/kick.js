const Command = require('../../command-handler/commands/base')
const { GuildMember, TextChannel } = require('discord.js')
const { docId, basicEmbed, memberException, userException, inviteMaxAge, inviteButton, reasonDetails, memberDetails } = require('../../utils')
const { moderations } = require('../../mongo/schemas')
const { stripIndent } = require('common-tags')
const { CommandoMessage } = require('../../command-handler/typings')
const { ModerationSchema } = require('../../mongo/typings')

/** A command that can be run in a client */
module.exports = class KickCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            group: 'mod',
            description: 'Kick a member.',
            details: `${memberDetails()}\n${reasonDetails()}`,
            format: 'kick [member] <reason>',
            examples: [
                'kick Pixoll',
                'kick Pixoll Get out!'
            ],
            clientPermissions: ['KICK_MEMBERS'],
            userPermissions: ['KICK_MEMBERS'],
            throttling: { usages: 1, duration: 3 },
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
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to kick
     * @param {string} args.reason The reason of the kick
     */
    async run(message, { member, reason }) {
        const { guild, author, guildId } = message
        const { user } = member

        const uExcept = userException(user, author, this)
        if (uExcept) return await message.replyEmbed(basicEmbed(uExcept))

        const mExcept = memberException(member, this)
        if (mExcept) return await message.replyEmbed(basicEmbed(mExcept))

        if (!user.bot) {
            const embed = basicEmbed({
                color: 'GOLD', fieldName: `You have been kicked from ${guild.name}`,
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

        await member.kick(reason)

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            fieldName: `${user.tag} has been kicked`, fieldValue: `**Reason:** ${reason}`
        }))

        /** @type {ModerationSchema} */
        const doc = {
            _id: docId(),
            type: 'kick',
            guild: guildId,
            user: user.id,
            mod: author.id,
            reason
        }

        await new moderations(doc).save()
    }
}