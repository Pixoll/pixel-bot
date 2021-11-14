const { stripIndent } = require('common-tags')
const { TextChannel, MessageEmbed } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, channelDetails, basicCollector, myMs } = require('../../utils')

/** A command that can be run in a client */
module.exports = class WelcomeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'welcome',
            group: 'utility',
            description: 'Setup welcoming messages that can be sent in DMs and in a specific channel of your server.',
            details: stripIndent`
                ${channelDetails('text-channel')}
                You can use the following fields, which will be replaced when the welcome message is sent:
                **>** **{user}:** Tags the new member with a mention.
                **>** **{server_name}:** This server's name.
                **>** **{member_count}:** The member count of this server.
            `,
            format: stripIndent`
                welcome - Display the current welcomes.
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
                    required: false
                },
                {
                    key: 'msg',
                    label: 'message',
                    prompt: 'What message should the bot send?',
                    type: 'string',
                    max: 1024,
                    required: false
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {TextChannel} args.channel The channel where to send the welcome messages
     * @param {string} args.msg The welcome message to send
     */
    async run(message, { channel, msg }) {
        this.db = message.guild.database.welcome
        const data = await this.db.fetch()

        const { guild, guildId } = message

        if (!channel) {
            const embed = new MessageEmbed()
                .setColor('#4c9f4c')
                .setAuthor(`${guild.name}'s welcome message`, guild.iconURL({ dynamic: true }))
                .setDescription(stripIndent`
                    **Channel:** ${data?.channel ? `<#${data?.channel}>` : '`No saved channel found.`'}
                    **Message:** ${data?.message?.replace(/{[\w_]+}/g, '`$&`') || '`No saved message found.`'}
                `)
                .setTimestamp()

            return await message.replyEmbed(embed)
        }

        if (!msg) {
            const welcomeMsg = await basicCollector(message, {
                fieldName: `What message would you like me to send in #${channel.name}?`
            }, { time: myMs('2m') })
            if (!welcomeMsg) return
            msg = welcomeMsg.content
        }

        await this.db.add({
            guild: guildId,
            channel: channel.id,
            message: msg
        })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: 'The message has been successfully saved.'
        }))
    }
}