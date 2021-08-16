const { MessageEmbed } = require('discord.js')
const { Command, CommandoMessage } = require('discord.js-commando')
const { formatPerm } = require('../../utils/functions')

const colors = [
    'default',              'white',                'aqua',
    'green',                'blue',                 'yellow',
    'purple',               'luminous_vivid_pink',  'gold',
    'orange',               'red',                  'grey',
    'darker_grey',          'navy',                 'dark_aqua',
    'dark_green',           'dark_blue',            'dark_purple',
    'dark_vivid_pink',      'dark_gold',            'dark_orange',
    'dark_red',             'dark_grey',            'light_grey',
    'dark_navy',            'blurple',              'greyple',
    'dark_but_not_black',   'not_quite_black',      'random'
]

module.exports = class embeds extends Command {
    constructor(client) {
        super(client, {
            name: 'embeds',
            group: 'owner',
            memberName: 'embeds',
            description: 'Spams all the colors of the embeds.',
            ownerOnly: true,
            hidden: true,
            args: [{
                key: 'color',
                prompt: 'The color of the embed.',
                type: 'string',
                oneOf: colors,
                default: ''
            }]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {string} args.color The color of the embed
     */
    async run(message, { color }) {
        const embed = /** @param {string} Color */ Color =>
            new MessageEmbed()
                .setColor(Color.toUpperCase())
                .setDescription(formatPerm(Color))

        if (color) message.say(embed(color))
        else {
            for (const _color of colors) {
                await message.say(embed(_color))
            }
        }
    }
}