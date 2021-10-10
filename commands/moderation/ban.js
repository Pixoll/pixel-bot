const { User, GuildMember } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const { docId, basicEmbed, userException, memberException, reasonDetails, userDetails } = require('../../utils')
const { moderations } = require('../../mongo/schemas')
const { stripIndent } = require('common-tags')
const { CommandoMessage } = require('../../command-handler/typings')
const { ModerationSchema } = require('../../mongo/typings')

/** A command that can be run in a client */
module.exports = class BanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'mod',
            description: 'Ban a user permanently.',
            details: `${userDetails}\n${reasonDetails()}`,
            format: 'ban [user] <reason>',
            examples: [
                'ban Pixoll',
                'ban Pixoll The Ban Hammer has Spoken!'
            ],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'user',
                    prompt: 'What user do you want to ban?',
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
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to ban
     * @param {string} args.reason The reason of the ban
     */
    async run(message, { user, reason }) {
        const { guild, author, guildId } = message
        const { members, bans } = guild

        const uExcept = userException(user, author, this)
        if (uExcept) return await message.replyEmbed(basicEmbed(uExcept))

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

        if (!user.bot && !!member) {
            await user.send({
                embeds: [basicEmbed({
                    color: 'GOLD', fieldName: `You have been banned from ${guild.name}`,
                    fieldValue: stripIndent`
                        **Reason:** ${reason}
                        **Moderator:** ${author.toString()}
                    `
                })]
            }).catch(() => null)
        }

        await members.ban(user, { days: 7, reason })

        /** @type {ModerationSchema} */
        const doc = {
            _id: docId(),
            type: 'ban',
            guild: guildId,
            user: { id: user.id, tag: user.tag },
            mod: { id: author.id, tag: author.tag },
            reason
        }

        await new moderations(doc).save()

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check',
            fieldName: `${user.tag} has been banned`, fieldValue: `**Reason:** ${reason}`
        }))
    }
}