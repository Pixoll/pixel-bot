/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, generateEmbed } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class GuildsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'guilds',
            group: 'owner',
            description: 'Displays all the guilds the bot\'s in.',
            ownerOnly: true,
            dmOnly: true,
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const { guilds, user } = this.client
        if (guilds.cache.size === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There bot is not in any server.'
            }))
        }

        const guildsList = []
        for (const [, guild] of guilds.cache) {
            const gOwner = await guild.fetchOwner()
            guildsList.push({
                name: guild.name,
                'Guild id': guild.id,
                owner: `${gOwner.user.toString()} ${gOwner.user.tag}`
            })
        }

        await generateEmbed(message, guildsList, {
            authorName: `${user.username}'s guilds`,
            authorIconURL: user.displayAvatarURL({ dynamic: true }),
            keyTitle: { suffix: 'name' }
        })
    }
}