/* eslint-disable no-unused-vars */
const { Command, CommandInstances } = require('pixoll-commando');
const { generateEmbed, basicEmbed, pluralize, replyAll } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class PollsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'polls',
            group: 'lists',
            description: 'Displays all the on-going polls on this server. Use the `poll` command to add polls.',
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
        const db = guild.database.polls;

        const pollsData = await db.fetchMany();
        if (pollsData.size === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no active polls.',
            }));
        }

        await generateEmbed({ message, interaction }, pollsData.toJSON(), {
            number: 5,
            authorName: `There's ${pluralize('active poll', pollsData.size)}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            title: 'Poll',
            keys: ['channel', 'duration', 'endsAt'],
        });
    }
};
