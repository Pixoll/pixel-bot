/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { GuildMember } = require('discord.js')
const { docId, basicEmbed, userException, confirmButtons, replyAll } = require('../../utils/functions')
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
            modPermissions: true,
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
            ],
            slash: {
                options: [
                    {
                        type: 'user',
                        name: 'member',
                        description: 'The member to warn.',
                        required: true
                    },
                    {
                        type: 'string',
                        name: 'reason',
                        description: 'The reason of the warn.',
                        required: true
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to warn
     * @param {string} args.reason The reason of the warn
     */
    async run({ message, interaction }, { member, reason }) {
        if (interaction) {
            if (!(member instanceof GuildMember)) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'That is not a valid member in this server.'
                }))
            }
            if (reason.length > 512) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'Please keep the reason below or exactly 512 characters.'
                }))
            }
        }

        const { guild, guildId } = message || interaction
        const author = message?.author || interaction.user
        const { user } = member

        const uExcept = userException(user, author, this)
        if (uExcept) return await replyAll({ message, interaction }, basicEmbed(uExcept))

        if (user.bot) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'You can\'t warn a bot.'
            }))
        }

        const confirmed = await confirmButtons({ message, interaction }, 'warn', user, { reason })
        if (!confirmed) return

        await user.send(basicEmbed({
            color: 'GOLD',
            fieldName: `You have been warned on ${guild.name}`,
            fieldValue: stripIndent`
                **Reason:** ${reason}
                **Moderator:** ${author.toString()} ${author.tag}
            `
        })).catch(() => null)

        await guild.database.moderations.add({
            _id: docId(),
            type: 'warn',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason
        })
        this.client.emit('guildMemberWarn', guild, author, user, reason)

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `${user.tag} has been warned`,
            fieldValue: `**Reason:** ${reason}`
        }))
    }
}