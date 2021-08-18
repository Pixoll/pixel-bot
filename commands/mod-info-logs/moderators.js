const { Command, CommandoMessage } = require('discord.js-commando')
const { isMod, generateEmbed, basicEmbed } = require('../../utils/functions')

module.exports = class moderators extends Command {
    constructor(client) {
        super(client, {
            name: 'moderators',
            aliases: ['mods'],
            group: 'mod',
            memberName: 'moderators',
            description: 'Displays a list of moderators of this server.',
            clientPermissions: ['MANAGE_MESSAGES'],
            userPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true
        })
    }

    onBlock() { return }
    onError() { return }

    /** @param {CommandoMessage} message */
    async run(message) {
        const { guild } = message

        const members = await message.guild.members.fetch()
        const moderators = members.filter(member => isMod(member) && !member.user.bot)
        if (moderators.size === 0) return message.say(basicEmbed('blue', 'info', 'There are no moderators.'))

        const modsList = moderators.map(({ user, roles }) => {
            const rolesList = roles.cache.filter(role => isMod(role)).map(r => r).sort((a, b) => b.position - a.position)
            return {
                tag: user.tag,
                roles: [...rolesList || 'None'],
                list: rolesList.join(', ') || 'None'
            }
        }).sort((a, b) => b.roles[0]?.position - a.roles[0]?.position)

        await generateEmbed(message, modsList, {
            number: 10,
            authorName: `${guild.name}'s moderators`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            title: 'Roles of moderator',
            keyTitle: { suffix: 'tag' },
            keysExclude: ['tag', 'roles']
        })
    }
}