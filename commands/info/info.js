/* eslint-disable no-unused-vars */
const { Command, CommandInstances, version: pixComVersion } = require('pixoll-commando');
const { version, description } = require('../../package.json');
const { replyAll } = require('../../utils/functions');
const myMs = require('../../utils/my-ms');
const { MessageEmbed, version: djsVersion } = require('discord.js');
const { stripIndent, oneLine } = require('common-tags');
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
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const { user, owners, options, uptime } = this.client;
        const guilds = this.client.guilds.cache;

        const uptimeStr = myMs(uptime, { long: true, length: 2, showMs: false });
        const topgg = 'https://top.gg/bot/802267523058761759';
        const users = guilds.reduce((a, g) => a + g.memberCount, 0).toLocaleString();

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
                **Framework:** [pixoll-commando v${pixComVersion}](https://github.com/Pixoll/pixoll-commando)
                **Developer:** ${owners[0].toString()} (${owners[0].tag})
            `, true)
            .addField('Links', oneLine`
                [Top.gg page](${topgg}) -
                [Support server](${options.serverInvite}) -
                [Invite the bot](${topgg}/invite) -
                [Vote here](${topgg}/vote)
            `, true)
            .setFooter({ text: `Uptime: ${uptimeStr}` })
            .setTimestamp();

        await replyAll({ message, interaction }, info);
    }
};
