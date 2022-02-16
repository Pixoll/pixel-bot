/* eslint-disable no-unused-vars */
const { Command, CommandInstances } = require('pixoll-commando');
const { generateEmbed, basicEmbed, addDashes } = require('../../utils/functions');
const { capitalize } = require('lodash');
/* eslint-enable no-unused-vars */

/**
 * Removes dashes from the string and capitalizes the remaining strings
 * @param {string} str The string to parse
 */
function removeDashes(str) {
    if (!str) return;
    const arr = str.split('-');
    const first = arr.shift();
    const rest = arr.map(capitalize).join('');
    return first + rest;
}

/** A command that can be run in a client */
module.exports = class DatabaseCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'database',
            aliases: ['db'],
            group: 'owner',
            description: 'Manage the database.',
            ownerOnly: true,
            dmOnly: true,
            args: [
                {
                    key: 'collection',
                    prompt: 'What collection do you want to manage?',
                    type: 'string'
                }
            ]
        });

        this.argsCollector.args[0].oneOf = Object.keys(this.client.databaseSchemas).map(addDashes);
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.collection The collection to manage
     */
    async run({ message }, { collection }) {
        const data = await this.client.databaseSchemas[removeDashes(collection)].find({});

        const array = data.map(({ _doc: val }) => {
            delete val._id;
            delete val.__v;
            if (val.updatedAt) delete val.updatedAt;
            return val;
        });

        const DBname = collection.replace('-', ' ').toUpperCase();

        if (array.length === 0) {
            return message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: `The ${DBname} collection is empty.`
            }));
        }

        await generateEmbed({ message }, array, {
            authorName: `Database: ${DBname}`,
            authorIconURL: this.client.user.displayAvatarURL({ dynamic: true }),
            title: 'Document',
            keysExclude: ['updatedAt']
        });
    }
};
