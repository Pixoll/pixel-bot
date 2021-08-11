const { GuildMember } = require('discord.js')
const { Command, CommandoMessage } = require('discord.js-commando')
const { docID, isMod, basicEmbed } = require('../../utils/functions')
const { moderations } = require('../../utils/mongo/schemas')
const { stripIndent } = require('common-tags')

/**
 * gets all the users separated by commas
 * @param {string} string the string containing the users
 * @param {CommandoMessage} message the command message
 * @returns {GuildMember[]}
 */
function getMembers(string, message) {
    const isOwner = message.guild.ownerID === message.author.id
    const botID = message.client.user.id
    const highestBot = message.guild.members.cache.get(botID).roles.highest.position
    const array = string.toLowerCase().split(/\s*,\s*/)

    const membersList = []
    for (const str of array) {
        const member = message.guild.members.cache.get(str.replace(/[^0-9]/g, '')) || message.guild.members.cache.find(({ user }) => user.username.toLowerCase() === str || user.tag.toLowerCase() === str)
        if (member) membersList.push(member)
    }

    /** @param {GuildMember} member */
    function filter(member) {
        if (member.user.id !== botID && member.user.id !== message.author.id) {
            if (!member.bannable) return false
            if (isOwner) return true
            return !isMod(member)
        }
    }
    return membersList.filter(member => filter(member))
}

module.exports = class multiban extends Command {
    constructor(client) {
        super(client, {
            name: 'multiban',
            group: 'mod',
            memberName: 'multiban',
            description: 'Ban multiple members permanently.',
            details: '`members` has to be all the members\'s username, ID or mention, separated by commas (max. of 30 at once).',
            format: 'multiban [members]',
            examples: ['multiban Pixoll, 801615120027222016'],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [{
                key: 'members',
                prompt: 'What members do you want to ban?',
                type: 'string',
                /** @param {string} string @param {CommandoMessage} message */
                parse: (string, message) => getMembers(string, message),
                /** @param {string} string @param {CommandoMessage} message */
                validate: (string, message) => getMembers(string, message).length >= 1,
                error: 'I couldn\'t find any of the members you specified. Please check the role hierarchy and server ownership.'
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {GuildMember[]} args.members The members to ban
     */
    async run(message, { members }) {
        for (const member of members) {
            // gets data that will be used later
            const { user } = member
            const { guild, author } = message
            const { members } = guild
            const reason = 'Mass ban.'

            // checks if the user is not a bot before trying to send the DM
            if (!user.bot) await user.send(basicEmbed('gold', '', `You have been banned from ${guild.name}`, stripIndent`
                **Reason:** ${reason}
                **Moderator:** ${author}
            `)).catch(() => null)

            await members.ban(user, { days: 7, reason: reason })

            // creates and saves the document
            const doc = {
                _id: docID(),
                type: 'ban',
                guild: guild.id,
                user: user.id,
                mod: author.id,
                reason: reason
            }

            await new moderations(doc).save()
        }

        message.say(basicEmbed('green', 'check', `The following members have been banned:`, members.map(({ user }) => `"${user.tag}"`).join(', ')))
    }
}