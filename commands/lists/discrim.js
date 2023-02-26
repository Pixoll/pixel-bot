/* eslint-disable no-unused-vars */
const { Command, CommandInstances } = require('pixoll-commando');
const { basicEmbed, generateEmbed, pluralize, abcOrder, replyAll } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class DiscriminatorCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'discrim',
            aliases: ['discriminator'],
            group: 'lists',
            description: 'Displays a list of users with a discriminator.',
            details: '`discrim` has to be a number from 1 to 9999.',
            format: 'discriminator [discrim]',
            examples: ['discriminator 1234'],
            guildOnly: true,
            args: [{
                key: 'discriminator',
                prompt: 'What discriminator do you want to look for?',
                type: 'integer',
                /** @param {string} discrim */
                parse: discrim => discrim.padStart(4, '0').slice(-4),
                min: 1,
                max: 9999,
            }],
            slash: {
                options: [{
                    type: 'integer',
                    name: 'discriminator',
                    description: 'The discriminator to look for.',
                    required: true,
                    minValue: 1,
                    maxValue: 9999,
                }],
            },
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.discriminator The discriminator to filter displayed members
     */
    async run({ message, interaction }, { discriminator }) {
        const { guild } = message || interaction;
        const members = guild.members.cache;

        if (interaction) {
            discriminator = discriminator.toString().padStart(4, '0').slice(-4);
        }

        const match = members.filter(m => m.user.discriminator === discriminator)
            .sort((a, b) => abcOrder(a.user.tag, b.user.tag))
            .map(m => `${m.toString()} ${m.user.tag}`);

        if (!match || match.length === 0) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'I couldn\'t find any members.',
            }));
        }

        await generateEmbed({ message, interaction }, match, {
            number: 20,
            authorName: `Found ${pluralize('member', match.length)}`,
            useDescription: true,
        });
    }
};
