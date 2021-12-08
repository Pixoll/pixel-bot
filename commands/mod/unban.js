/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { User } = require('discord.js')
const { basicEmbed, confirmButtons, replyAll } = require('../../utils/functions')
const { userDetails, reasonDetails } = require('../../utils/constants')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class UnbanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unban',
            group: 'mod',
            description: 'Unban a user.',
            details: `${userDetails}\n${reasonDetails()}`,
            format: 'unban [user] <reason>',
            examples: [
                'unban @Pixoll',
                'unban 802267523058761759 Appealed'
            ],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true,
            args: [
                {
                    key: 'user',
                    prompt: 'What user do you want to unban?',
                    type: 'user'
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
                        description: 'The user to unban.',
                        required: true
                    },
                    {
                        type: 'string',
                        name: 'reason',
                        description: 'The reason of the unban.'
                    }
                ]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to unban
     * @param {string} args.reason The reason of the unban
     */
    async run({ message, interaction }, { user, reason }) {
        if (interaction) {
            user = user.user || user
            reason ??= 'No reason given.'
            if (reason.length > 512) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'Please keep the reason below or exactly 512 characters.'
                }))
            }
        }

        const { members, bans, database } = (message || interaction).guild
        const { active } = database

        const isBanned = await bans.fetch(user).catch(() => null)
        if (!isBanned) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That user is not banned.'
            }))
        }

        const confirmed = await confirmButtons({ message, interaction }, 'unban', user, { reason })
        if (!confirmed) return

        await members.unban(user, reason)

        const data = await active.fetch({ type: 'temp-ban', user: { id: user.id } })
        if (data) await active.delete(data)

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `${user.tag} has been unbanned`,
            fieldValue: `**Reason:** ${reason}`
        }))
    }
}