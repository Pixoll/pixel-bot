const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { MessageEmbed, User, GuildMember } = require('discord.js')
const { getKeyPerms, timestamp, userDetails } = require('../../utils')

/** A command that can be run in a client */
module.exports = class WhoIsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'whois',
            aliases: ['userinfo'],
            group: 'misc',
            description: 'Displays a user\'s information.',
            details: userDetails,
            format: 'whois <user>',
            examples: ['whois Pixoll'],
            args: [{
                key: 'user',
                prompt: 'What user do you want to get information from?',
                type: 'user',
                required: false
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to get information from
     */
    async run(message, { user }) {
        const { guild } = message
        const target = user || message.author

        /** @type {GuildMember} */
        const member = await guild?.members.fetch(target).catch(() => null)
        const permissions = getKeyPerms(member)

        const avatar = target.displayAvatarURL({ dynamic: true, size: 2048 })

        const userInfo = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(target.tag, target.displayAvatarURL({ dynamic: true }), avatar)
            .setThumbnail(avatar)
            .setDescription(target.toString())
            .setTimestamp()

        if (member) {
            if (member.presence) {
                for (const { type, name, state, details, url } of member.presence.activities) {
                    const status = details && !!state ? `${details}\n${state}` : details || '\u200B'

                    if (type === 'CUSTOM' && !!state) userInfo.addField('Custom status:', state)
                    if (type === 'STREAMING') userInfo.addField(`Currently streaming ${name}`, url)
                    if (!['COMPETING', 'CUSTOM'].includes(type)) {
                        userInfo.addField(`Currently ${type.toLowerCase()} ${name}`, status)
                    }
                }
            }

            userInfo.addField('Joined', timestamp(member.joinedAt, 'R'), true)
        }

        userInfo.addField('Registered', timestamp(target.createdAt, 'R'), true)

        if (member) {
            const acknowledgement = guild.ownerId === member.id ?
                'Server owner' : permissions === 'Administrator' ? permissions : null
            if (acknowledgement) userInfo.addField('Acknowledgement', acknowledgement, true)
        }

        await message.replyEmbed(userInfo)
    }
}