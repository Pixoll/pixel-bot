const { stripIndent } = require('common-tags')
const { TextChannel, MessageEmbed } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, basicCollector, myMs, getArgument, channelDetails } = require('../../utils')
const { WelcomeSchema } = require('../../schemas/types')

/** A command that can be run in a client */
module.exports = class WelcomeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'welcome',
            group: 'utility',
            description: 'Setup welcoming messages that can be sent in DMs and in a specific channel of your server.',
            details: stripIndent`
                ${channelDetails('text-channel')}
                In both you can use the following fields:
                **>** **{user}:** Tags the new member with a mention.
                **>** **{server_name}:** This server's name.
                **>** **{member_count}:** The member count of this server.
            `,
            format: stripIndent`
                welcome <view> - Display the current welcomes.
                welcome dms - Set/update the DMs welcomes.
                welcome channel [text-channel] - Set/update the welcomes to a channel. 
            `,
            examples: ['welcome channel #welcome'],
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['view', 'dms', 'channel'],
                    default: 'view'
                }, {
                    key: 'channel',
                    prompt: 'On what channel do you want the welcomes?',
                    type: 'text-channel',
                    required: false
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {'view'|'dms'|'channel'} args.subCommand The sub-command to use
     * @param {TextChannel} args.channel The channel where to send the welcome messages
     */
    async run(message, { subCommand, channel }) {
        subCommand = subCommand.toLowerCase()
        this.db = message.guild.database.welcome
        const data = await this.db.fetch()

        switch (subCommand) {
            case 'view':
                return await this.view(message, data)
            case 'dms':
                return await this.dms(message, data)
            case 'channel':
                return await this.channel(message, data, channel)
        }
    }

    /**
     * The `view` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {WelcomeSchema} data The welcome messages data
     */
    async view(message, data) {
        const { guild } = message

        const dataChannel = guild.channels.resolve(data?.channel)
        const channelName = dataChannel ? `(in #${dataChannel.name})` : ''

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${guild.name}'s welcome messages`, guild.iconURL({ dynamic: true }))
            .addField('Direct messages', data?.dms || 'There\'s no saved DM message')
            .addField(
                `Server channel ${channelName}`,
                data?.message?.replace(/{[\w_]+}/g, '`$&`') || 'There\'s no saved server channel message'
            )
            .setTimestamp()

        await message.replyEmbed(embed)
    }

    /**
     * The `dms` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {WelcomeSchema} data The welcome messages data
     */
    async dms(message, data) {
        const welcomeMsg = await basicCollector(message, {
            fieldName: 'What message would you like me to send in DMs?'
        }, { time: myMs('2m') })
        if (!welcomeMsg) return

        await this.db.add({
            guild: message.guildId,
            dms: welcomeMsg.content
        })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: 'The message has been successfully saved.'
        }))
    }

    /**
     * The `channel` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {WelcomeSchema} data The welcome messages data
     * @param {TextChannel} channel The channel where to send the welcome messages
     */
    async channel(message, data, channel) {
        if (!channel) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
            if (cancelled) return
            channel = value
        }

        const welcomeMsg = await basicCollector(message, {
            fieldName: `What message would you like me to send in #${channel.name}?`
        }, { time: myMs('2m') })
        if (!welcomeMsg) return

        await this.db.add({
            guild: message.guildId,
            channel: channel.id,
            message: welcomeMsg.content
        })

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: 'The message has been successfully saved.'
        }))
    }
}