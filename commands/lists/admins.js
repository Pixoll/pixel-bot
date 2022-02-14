/* eslint-disable no-unused-vars */
const { Command, CommandInstances } = require('pixoll-commando');
const { generateEmbed, basicEmbed, pluralize, replyAll } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class AdminisCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'admins',
            aliases: ['administrators'],
            group: 'lists',
            description: 'Displays a list of all administrators of the server with their admin roles.',
            guildOnly: true,
            slash: true
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     */
    async run({ message, interaction }) {
        const { guild } = message || interaction;
        const members = guild.members.cache;

        const admins = members.filter(m => m.permissions.has('ADMINISTRATOR') && !m.user.bot);
        if (!admins || admins.size === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There are no administrators.'
            }));
        }

        const adminsList = admins.sort((a, b) => b.roles.highest.position - a.roles.highest.position)
            .map(mbr => ({
                tag: mbr.user.tag,
                list: '**Roles:** ' + (mbr.roles.cache.filter(r => r.permissions.has('ADMINISTRATOR'))
                    .sort((a, b) => b.position - a.position).map(r => r.name).join(', ') || 'None')
            }));

        await generateEmbed({ message, interaction }, adminsList, {
            authorName: `There's ${pluralize('administrator', adminsList.length)}`,
            authorIconURL: guild.iconURL({ dynamic: true }),
            keyTitle: { suffix: 'tag' }
        });
    }
};
