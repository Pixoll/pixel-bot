const Command = require('../../command-handler/commands/base')
const { version } = require('../../package.json')
const { myMs } = require('../../utils')
const { MessageEmbed } = require('discord.js')
const { stripIndent } = require('common-tags')
const { CommandoMessage } = require('../../command-handler/typings')

/** A command that can be run in a client */
module.exports = class InfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'info',
            group: 'info',
            description: 'Displays some information about the bot.',
            guarded: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const { user, users, guilds, owners, options, botInvite, uptime: _uptime } = this.client

        const uptime = myMs(_uptime, { long: true, length: 2, showMs: false })

        const commandoLink = 'https://discord.js.org/#/docs/commando/master/general/welcome'

        const info = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${user.username}'s information`, user.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
                Join the support server with [this link](${options.serverInvite}).
                Invite the bot with [this link](${botInvite}).

                **>** **Version:** ${version}
                **>** **Library:** [discord.js-commando](${commandoLink})
                **>** **Creator:** ${owners[0].tag}
                **>** **Servers:** ${guilds.cache.size}
                **>** **Users:** ${users.cache.filter(u => !u.bot).size}
            `)
            .setFooter(`Uptime: ${uptime}`)
            .setTimestamp()

        await message.replyEmbed(info)
    }
}