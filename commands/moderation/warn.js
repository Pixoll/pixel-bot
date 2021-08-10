const { Command, CommandoMessage } = require('discord.js-commando')
const { MessageEmbed, GuildMember } = require('discord.js')
const { docID, basicEmbed } = require('../../utils/functions')
const { moderations } = require('../../utils/mongodb-schemas')
const { stripIndent } = require('common-tags')

module.exports = class warn extends Command {
    constructor(client) {
        super(client, {
            name: 'warn',
            group: 'mod',
            memberName: 'warn',
            description: 'Warn a member.',
            details: '`member` can be a member\'s username, ID or mention. `reason` can be anything you want.',
            format: 'warn [member] [reason]',
            examples: ['warn Pixoll Stop posting NSFW'],
            userPermissions: ['MANAGE_MESSAGES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to warn?',
                    type: 'member'
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason of the warn?',
                    type: 'string',
                    max: 512
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {GuildMember} args.member The member to warn
     * @param {string} args.reason The reason of the warn
     */
    async run(message, { member, reason }) {
        const { guild, author } = message
        const { user } = member

        await member.send(basicEmbed('gold', '', `You have been warned on ${guild.name}`, stripIndent`
            **Reason:** ${reason}
            **Moderator:** ${author}
        `)).catch(() => null)

        message.say(basicEmbed('green', 'check', `${user.tag} has been warned`, `**Reason:** ${reason}`))

        const doc = {
            _id: docID(),
            type: 'warn',
            guild: guild.id,
            user: user.id,
            mod: author.id,
            reason: reason
        }

        await new moderations(doc).save()
    }
}