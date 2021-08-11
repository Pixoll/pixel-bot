const { stripIndent } = require('common-tags')
const { TextChannel, MessageEmbed } = require('discord.js')
const { Command, CommandoMessage } = require('discord.js-commando')
const { basicEmbed } = require('../../utils/functions')
const { welcome: welcomeDocs } = require('../../utils/mongo/schemas')

module.exports = class welcome extends Command {
    constructor(client) {
        super(client, {
            name: 'welcome',
            group: 'utility',
            memberName: 'welcome',
            description: 'This command allows you to setup welcoming messages that can be sent in DMs and in a specific channel of your server.',
            details: stripIndent`
                In both you can use the following fields:
                **>** **{user}:** Tags the new member with a mention.
                **>** **{server name}:** This server's name.
                **>** **{member count}:** The member count of this server.
            `,
            format: stripIndent`
                welcome - Display the current welcomes.
                welcome dms [message] - Set/change the DMs welcomes.
                welcome channel [channel] [message] - Set/change the welcomes to a channel. 
            `,
            examples: ['welcome channel #welcome'],
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['dms', 'channel'],
                    default: ''
                }, {
                    key: 'channel',
                    prompt: 'On what channel do you want the welcomes?',
                    type: 'text-channel|string',
                    max: 512,
                    /** @param {string} channel @param {CommandoMessage} message */
                    validate: (channel, message) => {
                        const arg = message.parseArgs().split(/ +/).shift().toLowerCase()
                        if (arg === 'dms') return true

                        const channels = message.guild.channels.cache
                        const match = channels.filter(({ type, name, id }) =>
                            type === 'text' && (
                                name.toLowerCase().includes(channel) ||
                                id === channel.replace(/[^0-9]/g, '')
                            )
                        )
                        if (match.size > 1) return false
                        return !!match
                    },
                    default: ''
                },
                {
                    key: 'msg',
                    prompt: 'What message do you want to set?',
                    type: 'string',
                    max: 512,
                    default: ''
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {string} args.subCommand The sub-command to use
     * @param {TextChannel|string} args.channel The channel to use
     * @param {string} args.msg The message to set
     */
    async run(message, { subCommand, channel, msg }) {
        const { guild } = message

        const welcomes = await welcomeDocs.findOne({ guild: guild.id })

        if (!subCommand) {
            const dataChannel = guild.channels.cache.get(welcomes?.channel)
            const channelName = dataChannel ? `(in #${dataChannel.name})` : ''

            const embed = new MessageEmbed()
                .setColor('#4c9f4c')
                .setAuthor(`${guild.name}'s welcome messages`, guild.iconURL({ dynamic: true }))
                .addField('Direct messages', welcomes?.dms || 'There\'s no saved DM message')
                .addField(`Server channel ${channelName}`, welcomes?.message?.replace(/{[\w ]+}/g, '`$&`') || 'There\'s no saved server channel message')
                .setTimestamp()

            return message.say(embed)
        }

        const saved = basicEmbed('green', 'check', 'Your message has been successfully saved.')

        if (subCommand.toLowerCase() === 'dms') {
            if (typeof channel === 'string') {
                msg = channel
            }

            if (!msg) return message.say(basicEmbed('red', 'cross', 'Please specify the message to send.'))

            const doc = {
                guild: guild.id,
                dms: msg
            }

            if (!welcomes) await new welcomeDocs(doc).save()
            else await welcomes.updateOne(doc)

            return message.say(saved)
        }

        if (!msg) return message.say(basicEmbed('red', 'cross', 'Please specify the message to send.'))

        const doc = {
            guild: guild.id,
            channel: channel.id,
            message: msg
        }

        if (!welcomes) await new welcomeDocs(doc).save()
        else await welcomes.updateOne(doc)

        message.say(saved)
    }
}