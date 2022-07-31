/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags');
const { MessageEmbed } = require('discord.js');
const { Command, CommandInstances } = require('pixoll-commando');
const { basicEmbed, replyAll } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'info',
            description: 'Pong! 🏓',
            guarded: true,
            slash: true
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const now = Date.now();
        const pingMsg = await message?.replyEmbed(basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Pinging...'
        }));

        const roundtrip = Math.abs(
            message ? (pingMsg.createdTimestamp - message.createdTimestamp) : (interaction.createdTimestamp - now)
        );
        const heartbeat = Math.round(this.client.ws.ping || 0);

        const type = message ? 'Messages' : 'Interactions';
        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setTitle('🏓 Pong!')
            .setDescription(stripIndent`
                **${type} ping:** ${roundtrip}ms
                **API ping:** ${heartbeat}ms
            `);

        await replyAll({ interaction }, embed);
        await pingMsg?.edit({ embeds: [embed] }).catch(() => null);
    }
};
