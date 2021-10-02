const { MessageEmbed } = require('discord.js')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { removeUnderscores } = require('../../utils')

const colors = [
    'default', 'white', 'aqua',
    'green', 'blue', 'yellow',
    'purple', 'luminous_vivid_pink', 'gold',
    'orange', 'red', 'grey',
    'darker_grey', 'navy', 'dark_aqua',
    'dark_green', 'dark_blue', 'dark_purple',
    'dark_vivid_pink', 'dark_gold', 'dark_orange',
    'dark_red', 'dark_grey', 'light_grey',
    'dark_navy', 'blurple', 'greyple',
    'dark_but_not_black', 'not_quite_black', 'random'
].map(s => s.toUpperCase())

/** A command that can be run in a client */
module.exports = class embedsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'embeds',
            group: 'owner',
            description: 'Spams all the colors of the embeds.',
            ownerOnly: true,
            hidden: true,
            args: [{
                key: 'color',
                prompt: 'The color of the embed.',
                type: 'string',
                oneOf: colors.map(s => s.toLowerCase()),
                required: false
            }]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.color The color of the embed
     */
    async run(message, { color }) {
        const embed = /** @param {string} Color */ Color =>
            new MessageEmbed()
                .setColor(Color.toUpperCase())
                .setDescription(removeUnderscores(Color))

        if (color) message.reply(embed(color))
        else {
            for (const _color of colors) {
                await message.reply(embed(_color))
            }
        }
    }
}