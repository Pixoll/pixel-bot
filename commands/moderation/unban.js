/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { User } = require('discord.js')
const { basicEmbed, userDetails, reasonDetails, confirmButtons } = require('../../utils')
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
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to unban
     * @param {string} args.reason The reason of the unban
     */
    async run(message, { user, reason }) {
        const { members, bans, database } = message.guild
        const { active } = database

        const isBanned = await bans.fetch(user).catch(() => null)
        if (!isBanned) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That user is not banned.'
            }))
        }

        const confirm = await confirmButtons(message, 'unban', user, { reason })
        if (!confirm) return

        await members.unban(user, reason)

        const data = await active.fetch({ type: 'temp-ban', user: { id: user.id } })
        if (data) await active.delete(data)

        await message.replyEmbed(basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `${user.tag} has been unbanned`,
            fieldValue: `**Reason:** ${reason}`
        }))
    }
}