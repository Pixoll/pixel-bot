const Command = require('../../command-handler/commands/base')
const { version, description } = require('../../package.json')
const { myMs } = require('../../utils')
const { MessageEmbed, version: djsVersion } = require('discord.js')
const { stripIndent } = require('common-tags')
const { CommandoMessage } = require('../../command-handler/typings')

/** A command that can be run in a client */
module.exports = class InfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'info',
            aliases: ['about'],
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
        const { user, owners, options, uptime: _uptime } = this.client
        const guilds = this.client.guilds.cache

        const uptime = myMs(_uptime, { long: true, length: 2, showMs: false })
        const topgg = 'https://top.gg/bot/802267523058761759'
        const users = guilds.reduce((a, g) => a + g.memberCount, 0).toLocaleString()

        const info = new MessageEmbed()
            .setColor('#4c9f4c')
            .setTitle(`About ${user.username}`)
            .setDescription(stripIndent`
                **Serving ${users} users across ${guilds.size} servers!**
                ${description}
            `)
            .addField('Information', stripIndent`
                **Version:** ${version}
                **Library:** [discord.js v${djsVersion}](https://discord.js.org/#/)
                **Developer:** ${owners[0].toString()} (${owners[0].tag})
            `, true)
            .addField('Links', stripIndent`
                \\> [Top.gg page](${topgg})
                \\> [Support server](${options.serverInvite})
                \\> [Invite the bot to your server](${topgg}/invite)
                \\> [Vote for the bot here](${topgg}/vote)
            `, true)
            .setFooter(`Uptime: ${uptime}`)
            .setTimestamp()

        await message.replyEmbed(info)
    }
}