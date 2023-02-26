/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags');
const { TextChannel, MessageEmbed } = require('discord.js');
const { Command, CommandInstances } = require('pixoll-commando');
const { basicEmbed, basicCollector, replyAll } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class WelcomeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'welcome',
            group: 'managing',
            description: 'Setup welcoming messages that can be sent in DMs and in a specific channel of your server.',
            details: stripIndent`
                \`text-channels\` to be all the text channels' names, mentions or ids, separated by spaces (max. 30 at once).
                You can use the following fields, which will be replaced when the welcome message is sent:
                **>** **{user}:** Tags the new member with a mention.
                **>** **{server_name}:** This server's name.
                **>** **{member_count}:** The member count of this server.
            `,
            format: stripIndent`
                welcome - Display the current welcome message.
                welcome [text-channel] [message] - Set/update the welcomes to a channel.
            `,
            examples: ['welcome #welcome Thanks for joining {server_name}! We hope you a great stay here <3'],
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'On what channel do you want the welcomes?',
                    type: 'text-channel',
                    required: false,
                },
                {
                    key: 'msg',
                    label: 'message',
                    prompt: 'What message should the bot send?',
                    type: 'string',
                    max: 1024,
                    required: false,
                },
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'view',
                        description: 'Display the current welcome message.',
                    },
                    {
                        type: 'subcommand',
                        name: 'set',
                        description: 'Set/update the welcomes to a channel.',
                        options: [
                            {
                                type: 'channel',
                                channelTypes: ['guild-text'],
                                name: 'channel',
                                description: 'The channel where the welcome messages should be sent.',
                                required: true,
                            },
                            {
                                type: 'string',
                                name: 'message',
                                description: 'The message to send.',
                                required: true,
                            },
                        ],
                    },
                ],
            },
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {TextChannel} args.channel The channel where to send the welcome messages
     * @param {string} args.msg The welcome message to send
     */
    async run({ message, interaction }, { channel, msg, message: intMsg }) {
        if (interaction) msg = intMsg;

        const { guild, guildId } = message || interaction;
        this.db = guild.database.welcome;
        const data = await this.db.fetch();

        if (!channel) {
            const embed = new MessageEmbed()
                .setColor('#4c9f4c')
                .setAuthor({
                    name: `${guild.name}'s welcome message`, iconURL: guild.iconURL({ dynamic: true }),
                })
                .setDescription(stripIndent`
                    **Channel:** ${data?.channel ? `<#${data?.channel}>` : '`No saved channel found.`'}
                    **Message:** ${data?.message?.replace(/{[\w_]+}/g, '`$&`') || '`No saved message found.`'}
                `)
                .setTimestamp();

            return await replyAll({ message, interaction }, embed);
        }

        if (message && !msg) {
            const welcomeMsg = await basicCollector({ message }, {
                fieldName: `What message would you like me to send in #${channel.name}?`,
            }, { time: 2 * 60_000 });
            if (!welcomeMsg) return;
            msg = welcomeMsg.content;
        }

        if (data) {
            await this.db.update(data, {
                channel: channel.id,
                message: msg,
            });
        } else {
            await this.db.add({
                guild: guildId,
                channel: channel.id,
                message: msg,
            });
        }

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', description: 'The message has been successfully saved.',
        }));
    }
};
