const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { GuildMember } = require('discord.js')
const { docId, basicEmbed, userException } = require('../../utils')
const { moderations } = require('../../mongo/schemas')
const { stripIndent } = require('common-tags')
const { ModerationSchema } = require('../../mongo/typings')

/** A command that can be run in a client */
module.exports = class warnCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'warn',
            group: 'mod',
            description: 'Warn a member.',
            details: '`member` can be a member\'s username, Id or mention. `reason` can be anything you want.',
            format: 'warn [member] [reason]',
            examples: ['warn Pixoll Stop posting NSFW'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
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
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to warn
     * @param {string} args.reason The reason of the warn
     */
    async run(message, { member, reason }) {
        const { guild, author, guildId } = message
        const { user } = member

        const uExcept = userException(user, author, this)
        if (uExcept) return await message.replyEmbed(uExcept)

        if (user.bot) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'You can\'t warn a bot.'
            }))
        }

        await user.send(basicEmbed({
            color: 'GOLD', fieldName: `You have been warned on ${guild.name}`,
            fieldValue: stripIndent`
                **Reason:** ${reason}
                **Moderator:** ${author.toString()}
            `
        })).catch(() => null)

        /** @type {ModerationSchema} */
        const doc = {
            _id: docId(),
            type: 'warn',
            guild: guildId,
            user: { id: user.id, tag: user.tag },
            mod: { id: author.id, tag: author.tag },
            reason
        }

        await new moderations(doc).save()

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', fieldName: `${user.tag} has been warned`,
            fieldValue: `**Reason:** ${reason}`
        }))
    }
}