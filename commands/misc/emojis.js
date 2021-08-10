const { Command, CommandoMessage } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')
const { oneLine } = require('common-tags')

module.exports = class emojis extends Command {
    constructor(client) {
        super(client, {
            name: 'emojis',
            aliases: ['emotes'],
            group: 'misc',
            memberName: 'emojis',
            description: 'Displays a list of server emojis.',
            details: oneLine`
                If the amount of emojis is too big, I will only display the maximum amount I'm able to,
                and I will also show the actual amount of emojis and the emojis I'm actually displaying.
            `,
            guildOnly: true
        })
    }

    onBlock() { return }
    onError() { return }

    /** @param {CommandoMessage} message */
    run(message) {
        // gets data that will be used later
        const { guild } = message
        const emojisCache = guild.emojis.cache

        // creates an array with some of the emojis' data
        const emojis = emojisCache.map(emoji => ({
            animated: emoji.animated,
            string: emoji.toString()
        }))

        // filters the animated emojis and the normal ones
        const notAnimated = emojis.filter(({ animated }) => !animated).map(({ string }) => string)
        const isAnimated = emojis.filter(({ animated }) => animated).map(({ string }) => string)

        // cuts the string at a max od 1024 characters so it can fit in the embed
        const normal = notAnimated.join(' ').match(/.{1,1024}(>|$)/g)[0].split(' ')
        const animated = isAnimated.join(' ').match(/.{1,1024}(>|$)/g)[0].split(' ')

        // creates an embed with the emojis list
        const embed = new MessageEmbed()
            .setColor('#4c9f4c')
            .setAuthor(`${guild.name}'s emojis`, guild.iconURL({ dynamic: true }))
            .addField(`Normal emojis: ${notAnimated.length} (${normal.length} displayed)`, normal.join(' '))
            .addField(`Animated emojis: ${isAnimated.length} (${animated.length} displayed)`, animated.join(' '))

        message.say(embed)
    }
}