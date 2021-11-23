/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { GuildMember } = require('discord.js')
const { docId, basicEmbed, userException, confirmButtons } = require('../../utils')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class warnCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'warn',
            group: 'mod',
            description: 'Warn a member.',
            details: '`member` can be a member\'s username, id or mention. `reason` can be anything you want.',
            format: 'warn [member] [reason]',
            examples: ['warn Pixoll Stop posting NSFW'],
            userPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to warn?',
                    type: 'member'
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason of the warn?',
                    type: 'string',
                    max: 512
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to warn
     * @param {string} args.reason The reason of the warn
     */
    async run({ message }, { member, reason }) {
        const { guild, author, guildId } = message
        const { user } = member

        const uExcept = userException(user, author, this)
        if (uExcept) return await message.replyEmbed(uExcept)

        if (user.bot) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'You can\'t warn a bot.'
            }))
        }

        const confirm = await confirmButtons({ message }, 'warn', user, { reason })
        if (!confirm) return

        await user.send(basicEmbed({
            color: 'GOLD',
            fieldName: `You have been warned on ${guild.name}`,
            fieldValue: stripIndent`
                **Reason:** ${reason}
                **Moderator:** ${author.toString()}
            `
        })).catch(() => null)

        await guild.database.moderations.add({
            _id: docId(),
            type: 'warn',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            reason
        })
        this.client.emit('guildMemberWarn', guild, author, user, reason)

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `${user.tag} has been warned`,
            fieldValue: `**Reason:** ${reason}`
        }))
    }
}