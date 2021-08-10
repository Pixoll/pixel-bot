const { Command, CommandoMessage } = require('discord.js-commando')
const { GuildMember } = require('discord.js')
const { basicEmbed } = require('../../utils/functions')
const { stripIndent } = require('common-tags')

module.exports = class nick extends Command {
    constructor(client) {
        super(client, {
            name: 'nickname',
            aliases: ['nick', 'setnick'],
            group: 'mod',
            memberName: 'nick',
            description: 'Change the nickname of a member or remove it.',
            details: stripIndent`
                \`member\` can be a member's username, ID or mention. \`new nick\` will be the member's new nickname.
                When using the \`remove\` sub-command, I will remove the member's nickname.
            `,
            format: stripIndent`
                nickname [member] [new nick] - Sets a new nickname.
                nickname [member] remove - Removes their current nickname.
            `,
            examples: ['nickname Pixoll Cool coder', 'nickname Pixoll remove'],
            clientPermissions: ['MANAGE_NICKNAMES'],
            userPermissions: ['MANAGE_NICKNAMES'],
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to change/remove the nick?',
                    type: 'member'
                },
                {
                    key: 'nickname',
                    prompt: 'What will be their new nickname? Type `remove` to remove their current nickname.',
                    type: 'string'
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {GuildMember} args.member The member to change/remove their nick
     * @param {string} args.nickname The new nickname
     */
    async run(message, { member, nickname }) {
        const { tag, username } = member.user

        if (!member.manageable) return message.say(basicEmbed('red', 'cross', `Unable to change ${user.tag}'s nickname`, 'Please check the role hierarchy or server ownership.'))

        if (nickname.toLowerCase() === 'remove') {
            await member.setNickname(username)
            return message.say(basicEmbed('green', 'check', `Removed ${tag}'s nickname.`))
        }

        await member.setNickname(nickname)
        message.say(basicEmbed('green', 'check', `Changed ${tag}'s nickname to ${nickname}`))
    }
}