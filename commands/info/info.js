/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { version, description } = require('../../package.json')
const { myMs } = require('../../utils')
const { MessageEmbed, version: djsVersion } = require('discord.js')
const { stripIndent, oneLine } = require('common-tags')
const { CommandInstances } = require('../../command-handler/typings')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class InfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'info',
            aliases: ['about'],
            group: 'info',
            description: 'Displays some information about the bot.',
            guarded: true,
            slash: true
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
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
            .addField('Links', oneLine`
                [Top.gg page](${topgg}) -
                [Support server](${options.serverInvite}) -
                [Invite the bot](${topgg}/invite) -
                [Vote here](${topgg}/vote)
            `, true)
            .setFooter(`Uptime: ${uptime}`)
            .setTimestamp()

        await interaction?.editReply({ embeds: [info] })
        await message?.replyEmbed(info)
    }
}