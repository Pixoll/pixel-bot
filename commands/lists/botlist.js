/* eslint-disable no-unused-vars */
const { Command, CommandInstances } = require('pixoll-commando');
const { generateEmbed, pluralize, abcOrder } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class BotListCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'botlist',
            aliases: ['bots'],
            group: 'lists',
            description: 'Displays the bot list of the server.',
            guildOnly: true,
            slash: true,
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const { guild } = message || interaction;
        const members = guild.members.cache;
        const botList = members.filter(m => m.user.bot)
            .sort((a, b) => abcOrder(a.user.tag, b.user.tag))
            .map(bot => `${bot.toString()} ${bot.user.tag}`);

        await generateEmbed({ message, interaction }, botList, {
            number: 20,
            authorName: `There's ${pluralize('bot', botList.length)}`,
            useDescription: true,
        });
    }
};
