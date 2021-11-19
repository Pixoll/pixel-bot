/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandInstances } = require('../../command-handler/typings')
const { basicEmbed, userDetails } = require('../../utils')
const { User, GuildBan } = require('discord.js')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class BanCheckCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ban-check',
            aliases: ['bancheck', 'checkban'],
            group: 'mod',
            description: 'Check if a user is banned.',
            details: userDetails,
            format: 'bancheck [user]',
            examples: ['bancheck Pixoll'],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true,
            args: [{
                key: 'user',
                prompt: 'What user do you want to check their ban?',
                type: 'user'
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to check their ban
     */
    async run({ message }, { user }) {
        /** @type {GuildBan} */
        const ban = await message.guild.bans.fetch(user).catch(() => null)
        if (!ban) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: `\`${user.tag}\` is not banned.`
            }))
        }

        const reason = ban.reason?.replace(/%20/g, ' ') || 'No reason given.'

        await message.replyEmbed(basicEmbed({
            color: 'BLUE', fieldName: `${user.tag} is banned`, fieldValue: `**Reason:** ${reason}`
        }))
    }
}