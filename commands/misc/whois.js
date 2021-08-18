const { Command, CommandoMessage, CommandoGuild } = require('discord.js-commando')
const { MessageEmbed, User, GuildMember } = require('discord.js')
const { formatDate, getDateDiff, getKeyPerms } = require('../../utils/functions')
const { stripIndent } = require('common-tags')

/**
 * creates an embed with the user's info
 * @param {CommandoGuild} guild the server
 * @param {User} user the user
 */
async function userInfo(guild, user) {
    /** @type {GuildMember} */
    const member = await guild?.members.fetch({ user: user.id, cache: false }).catch(() => null)

    const permissions = getKeyPerms(member)

    const userInfo = new MessageEmbed()
        .setColor('#4c9f4c')
        .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setDescription(user.toString())
        .setTimestamp()

    if (member) {
        for (const { type, name, state, details, url } of member.presence.activities) {
            const status = details && state ? `${details}\n${state}` : details || '\u200B'

            if (type === 'CUSTOM_STATUS' && state) userInfo.addField('Custom status:', state)
            if (type === 'STREAMING') userInfo.addField(`Currently streaming ${name}`, url)
            if (!['COMPETING', 'CUSTOM_STATUS'].includes(type)) userInfo.addField(`Currently ${type.toLowerCase()} ${name}`, status)
        }

        userInfo.addField('Joined', stripIndent`
            ${formatDate(member.joinedAt)}
            ${getDateDiff(member.joinedAt).slice(0, 3).join(', ')} ago
        `, true)
    }

    userInfo.addField('Registered', stripIndent`
            ${formatDate(user.createdAt)}
            ${getDateDiff(user.createdAt).slice(0, 3).join(', ')} ago
        `, true)

    if (member) {
        const acknowledgement = guild.owner === member ? 'Server owner' : permissions === 'Administrator' ? permissions : ''
        if (acknowledgement) userInfo.addField('Acknowledgement', acknowledgement)
    }

    return userInfo
}

module.exports = class whois extends Command {
    constructor(client) {
        super(client, {
            name: 'whois',
            group: 'misc',
            memberName: 'whois',
            description: 'Displays a user\'s information.',
            format: 'whois <user>',
            details: stripIndent`
                If \`user\` is not specified, it will send your information.
                \`user\` can be a user's username, ID or mention.
            `,
            examples: ['whois Pixoll'],
            args: [{
                key: 'user',
                prompt: 'What user do you want to get information from?',
                type: 'user',
                default: ''
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {User} args.user The user to get information from
     */
    async run(message, { user }) {
        const target = user || message.author
        const info = await userInfo(message.guild, target)

        await message.say(info)
    }
}