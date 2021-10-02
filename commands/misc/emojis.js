const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { MessageEmbed } = require('discord.js')

/** A command that can be run in a client */
module.exports = class EmojisCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'emojis',
            group: 'misc',
            description: 'Displays a list of server emojis.',
            details: 'If the amount of emojis is too big, I will only display the maximum amount I\'m able to.',
            guildOnly: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     */
    async run(message) {
        const { guild } = message
        const _emojis = await guild.emojis.fetch()

        const emojis = _emojis.map(emoji => ({
            animated: emoji.animated,
            string: emoji.toString()
        }))

        const notAnimated = emojis.filter(e => !e.animated).map(e => e.string)
        const isAnimated = emojis.filter(e => e.animated).map(e => e.string)

        const normal = notAnimated.join(' ').match(/.{1,1024}(>|$)/g)[0].split(' ')
        const animated = isAnimated.join(' ').match(/.{1,1024}(>|$)/g)[0].split(' ')

        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${guild.name}'s emojis`, guild.iconURL({ dynamic: true }))
            .addField(`Normal emojis: ${notAnimated.length} (${normal.length} displayed)`, normal.join(' '))
            .addField(`Animated emojis: ${isAnimated.length} (${animated.length} displayed)`, animated.join(' '))

        await message.replyEmbed(embed)
    }
}