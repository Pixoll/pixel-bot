const { Command, CommandoMessage } = require('discord.js-commando')
const { GuildMember } = require('discord.js')
const { active } = require('../../utils/mongodb-schemas')
const { stripIndent } = require('common-tags')

module.exports = class unmute extends Command {
    constructor(client) {
        super(client, {
            name: 'unmute',
            group: 'mod',
            memberName: 'unmute',
            description: 'Unmute a member.',
            details: stripIndent`
                \`member\` can be a member\'s username, ID or mention.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'unmute [member] <reason>',
            examples: ['unmute Pixoll', 'unmute Pixoll Appealed'],
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
            throttling: { usages: 1, duration: 3 },
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to unmute?',
                    type: 'member'
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason of the unmute?',
                    type: 'string',
                    default: 'No reason given.'
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {GuildMember} args.member The member to unmute
     * @param {string} args.reason The reason of the unmute
     */
    async run(message, { member, reason }) {
        // gets data that will be used later
        const { guild } = message
        const { user } = member
        const roles = guild.roles.cache

        const data = await setup.findOne({ guild: guild.id })
        if (!data || data.mutedRole) return message.say(basicEmbed('red', 'cross', 'No mute role found in this server, please use the `setup` command before using this.'))

        const role = roles.get(data.mutedRole)

        if (!member.roles.cache.has(role.id)) return message.say(basicEmbed('red', 'cross', 'That user is not muted.'))

        await member.roles.remove(role)

        message.say(basicEmbed('green', 'check', `${user.tag} has been unmuted`, `**Reason:** ${reason}`))

        const mute = await active.findOne({ type: 'mute', user: user.id })
        if (mute) await mute.deleteOne()
    }
}