/* eslint-disable no-unused-vars */
const { Command, CommandInstances } = require('pixoll-commando');
const { basicEmbed, confirmButtons } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class RestartCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'restart',
            group: 'owner',
            description: 'Restarts the bot.',
            ownerOnly: true,
            guarded: true,
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message }) {
        const confirmed = await confirmButtons({ message }, 'restart the bot');
        if (!confirmed) return;

        await message.replyEmbed(basicEmbed({
            color: 'GOLD', emoji: 'loading', description: 'Restarting...',
        }));

        this.client.user.setActivity({
            name: 'Restarting...',
            type: 'PLAYING',
        });

        process.exit();
    }
};
