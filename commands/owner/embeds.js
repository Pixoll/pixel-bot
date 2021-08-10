const { MessageEmbed } = require('discord.js')
const { Command, CommandoMessage } = require('discord.js-commando')

const colors = [
    'DEFAULT', 'WHITE', 'AQUA', 'GREEN', 'BLUE', 'YELLOW', 'PURPLE', 'LUMINOUS_VIVID_PINK', 'GOLD', 'ORANGE', 'RED', 'GREY',
    'DARKER_GREY', 'NAVY', 'DARK_AQUA', 'DARK_GREEN', 'DARK_BLUE', 'DARK_PURPLE', 'DARK_VIVID_PINK', 'DARK_GOLD', 'DARK_ORANGE',
    'DARK_RED', 'DARK_GREY', 'LIGHT_GREY', 'DARK_NAVY', 'BLURPLE', 'GREYPLE', 'DARK_BUT_NOT_BLACK', 'NOT_QUITE_BLACK', 'RANDOM'
]

module.exports = class embeds extends Command {
    constructor(client) {
        super(client, {
            name: 'embeds',
            group: 'owner',
            memberName: 'embeds',
            description: 'Spams all the colors of the embeds.',
            ownerOnly: true
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     */
    async run(message) {
        for (const color of colors) {
            const embed = new MessageEmbed()
                .setColor(color)
                .setDescription(color)

            await message.say(embed)
        }
    }
}