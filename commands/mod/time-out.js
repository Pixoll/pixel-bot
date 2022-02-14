/* eslint-disable no-unused-vars */
const { Command, CommandInstances } = require('pixoll-commando');
const { GuildMember } = require('discord.js');
const {
    userException, memberException, timestamp, confirmButtons, replyAll, docId, basicEmbed, getArgument
} = require('../../utils/functions');
const myMs = require('../../utils/my-ms');
const { stripIndent } = require('common-tags');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class TimeOutCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'time-out',
            aliases: ['timeout'],
            group: 'mod',
            description: 'Set or remove time-out for member so they cannot send messages or join VCs.',
            details: stripIndent`
                \`member\` can be either a member's name, mention or ID.
                \`duration\` uses the bot's time formatting, for more information use the \`help\` command (max. of 28 days).
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: stripIndent`
                timeout set [member] [duration] <reason> - Set a time-out to a member.
                timeout remove [member] - Remove a time-out from a member.
            `,
            examples: ['timeout Pixoll 2h', 'timeout Pixoll 6h Excessive swearing'],
            clientPermissions: ['MODERATE_MEMBERS'],
            userPermissions: ['MODERATE_MEMBERS'],
            guildOnly: true,
            args: [
                {
                    key: 'subCommand',
                    label: 'sub-command',
                    prompt: 'Would you like to `set` or `remove` a time-out?',
                    type: 'string',
                    oneOf: ['set', 'remove']
                },
                {
                    key: 'member',
                    prompt: 'What member do you want to time-out?',
                    type: 'member'
                },
                {
                    key: 'duration',
                    prompt: 'How long should the time-out last? (max. of 28 days)',
                    type: ['date', 'duration'],
                    required: false
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason of the time-out?',
                    type: 'string',
                    max: 512,
                    default: 'No reason given.',
                    required: false
                }
            ],
            slash: {
                options: [
                    {
                        type: 'subcommand',
                        name: 'set',
                        description: 'Time-out a member.',
                        options: [
                            {
                                type: 'user',
                                name: 'member',
                                description: 'The member to time-out.',
                                required: true
                            },
                            {
                                type: 'string',
                                name: 'duration',
                                description: 'The duration of the time-out (max. of 28 days).',
                                required: true
                            },
                            {
                                type: 'string',
                                name: 'reason',
                                description: 'The reason of the time-out.'
                            }
                        ]
                    },
                    {
                        type: 'subcommand',
                        name: 'remove',
                        description: 'Remove a member\'s timeout.',
                        options: [
                            {
                                type: 'user',
                                name: 'member',
                                description: 'The member to time-out.',
                                required: true
                            },
                            {
                                type: 'string',
                                name: 'reason',
                                description: 'The reason of the time-out.'
                            }
                        ]
                    }
                ]
            },
            test: true
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'set'|'remove'} args.subCommand The sub-command to use
     * @param {GuildMember} args.member The member to time-out
     * @param {number|Date} args.duration The duration of the time-out
     * @param {string} args.reason The reason of the time-out
     */
    async run({ message, interaction }, { subCommand, member, duration, reason }) {
        subCommand = subCommand.toLowerCase();

        if (interaction) {
            if (!(member instanceof GuildMember)) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'That is not a valid member in this server.'
                }));
            }
            if (subCommand === 'set') {
                const arg = this.argsCollector.args[2];
                duration = await arg.parse(duration).catch(() => null) || null;
                if (!duration) {
                    return await replyAll({ interaction }, basicEmbed({
                        color: 'RED', emoji: 'cross', description: 'The duration you specified is invalid.'
                    }));
                }
            }
            if (reason.length > 512) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'Please keep the reason below or exactly 512 characters.'
                }));
            }
        }
        reason ??= 'No reason given.';

        switch (subCommand) {
            case 'set':
                return await this.set({ message, interaction }, member, duration, reason);
            case 'remove':
                return await this.remove({ message, interaction }, member, reason);
        }
    }

    /**
     * The `set` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {GuildMember} member The member to time-out
     * @param {number|Date} duration The duration of the time-out
     * @param {string} reason The reason of the time-out
     */
    async set({ message, interaction }, member, duration, reason) {
        const now = Date.now();
        if (message && !duration) {
            const { value, cancelled } = await getArgument(message, this.argsCollector.args[2]);
            if (cancelled) return;
            duration = value;
        }
        if (duration instanceof Date) duration = duration.getTime() - now;

        if (duration > myMs('28d')) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'The max. duration of a time-out is 28 days.'
            }));
        }

        const { guild, guildId, member: mod } = message || interaction;
        const author = message?.author || interaction.user;
        const { moderations } = guild.database;
        const { user } = member;
        const timedOut = member.isCommunicationDisabled();

        const uExcept = userException(user, author, this);
        if (uExcept) return await replyAll({ message, interaction }, basicEmbed(uExcept));

        const mExcept = memberException(member, mod, this);
        if (mExcept) return await replyAll({ message, interaction }, basicEmbed(mExcept));

        if (timedOut) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That user is already timed-out.'
            }));
        }

        const confirmed = await confirmButtons({ message, interaction }, 'time-out', member.user, { reason });
        if (!confirmed) return;

        await member.timeout(duration, reason);
        this.client.emit('guildMemberTimeout', guild, author, user, reason, duration + now);

        if (!user.bot) {
            await user.send({
                embeds: [basicEmbed({
                    color: 'GOLD',
                    fieldName: `You have been timed-out on ${guild.name}`,
                    fieldValue: stripIndent`
                        **Expires:** ${timestamp(duration + now, 'R')}
                        **Reason:** ${reason}
                        **Moderator:** ${author.toString()} ${author.tag}
                    `
                })]
            }).catch(() => null);
        }

        const documentId = docId();

        await moderations.add({
            _id: documentId,
            type: 'time-out',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason,
            duration: myMs(duration, { long: true })
        });

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `${user.tag} has been timed-out`,
            fieldValue: stripIndent`
                **Expires:** ${timestamp(duration + now, 'R')}
                **Reason:** ${reason}
            `
        }));
    }

    /**
     * The `remove` sub-command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {GuildMember} member The member to time-out
     * @param {string} reason The reason of the time-out
     */
    async remove({ message, interaction }, member, reason) {
        const { user } = member;
        const timedOut = member.isCommunicationDisabled();

        if (!timedOut) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That user is not timed-out.'
            }));
        }

        const confirmed = await confirmButtons({ message, interaction }, 'remove time-out', member.user, { reason });
        if (!confirmed) return;

        await member.timeout(null, reason);

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `Removed ${user.tag}' time-out`,
            fieldValue: `**Reason:** ${reason}`
        }));
    }
};
