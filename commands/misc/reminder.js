/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags');
const { Command, CommandInstances } = require('pixoll-commando');
const { basicEmbed, customEmoji, timestamp, replyAll } = require('../../utils/functions');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class ReminderCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'reminder',
            aliases: ['remindme', 'remind'],
            group: 'misc',
            description: 'Set a reminder, and forget.',
            details: stripIndent`
                \`duration\` uses the bot's time formatting, for more information use the \`help\` command.
                If \`reminder\` is not specified, it will default to "Not specified".
            `,
            format: 'reminder [time] <reminder>',
            examples: [
                'reminder 02/02/2022 Pixoll\'s b-day!',
                'remindme 1d Do some coding',
                'remind 2w',
            ],
            guarded: true,
            clientPermissions: ['ADD_REACTIONS'],
            args: [
                {
                    key: 'time',
                    prompt: 'When would you like to be reminded?',
                    type: ['duration', 'date'],
                },
                {
                    key: 'reminder',
                    prompt: 'What do you want to be reminded about?',
                    type: 'string',
                    max: 512,
                    default: '`Not specified`',
                },
            ],
            slash: {
                options: [
                    {
                        type: 'string',
                        name: 'time',
                        description: 'When to get reminded at.',
                        required: true,
                    },
                    {
                        type: 'string',
                        name: 'reminder',
                        description: 'What to get reminded about.',
                    },
                ],
            },
        });

        this.db = this.client.database.reminders;
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {number|Date} args.time The time when the user should be reminder
     * @param {string} args.reminder What to remind the user about
     */
    async run({ message, interaction }, { time, reminder }) {
        if (interaction) {
            const arg = this.argsCollector.args[0];
            time = await arg.parse(time).catch(() => null);
            if (!time) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'The time you specified is invalid.',
                }));
            }
            reminder ??= '`Not specified`';
        }

        if (typeof time === 'number') time += Date.now();
        if (time instanceof Date) time = time.getTime();

        const msg = await interaction?.fetchReply();
        const { id, channelId, url } = message || msg;
        const author = interaction?.user || message.author;
        const stamp = timestamp(time, 'R', true);

        await this.db.add({
            user: author.id,
            reminder,
            remindAt: time,
            message: id,
            msgURL: url,
            channel: channelId,
        });

        await (message || msg).react(customEmoji('cross'));

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `I'll remind you ${stamp} for:`,
            fieldValue: reminder,
            footer: 'React with ❌ to cancel the reminder.',
        }));
    }
};
