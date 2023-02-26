/* eslint-disable no-unused-vars */
const { Command, CommandInstances } = require('pixoll-commando');
const { GuildMember } = require('discord.js');
const { basicEmbed, confirmButtons, replyAll } = require('../../utils/functions');
const { stripIndent } = require('common-tags');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class UnmuteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'unmute',
            group: 'mod',
            description: 'Unmute a member.',
            details: stripIndent`
                \`member\` can be either a member's name, mention or ID.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'unmute [member] <reason>',
            examples: [
                'unmute Pixoll',
                'unmute Pixoll Appealed',
            ],
            clientPermissions: ['MANAGE_ROLES'],
            userPermissions: ['MANAGE_ROLES'],
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to unmute?',
                    type: 'member',
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason of the unmute?',
                    type: 'string',
                    max: 512,
                    default: 'No reason given.',
                },
            ],
            slash: {
                options: [
                    {
                        type: 'user',
                        name: 'member',
                        description: 'The member to unmute.',
                        required: true,
                    },
                    {
                        type: 'string',
                        name: 'reason',
                        description: 'The reason of the unmute.',
                    },
                ],
            },
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to unmute
     * @param {string} args.reason The reason of the unmute
     */
    async run({ message, interaction }, { member, reason }) {
        if (interaction) {
            if (!(member instanceof GuildMember)) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'That is not a valid member in this server.',
                }));
            }
            reason ??= 'No reason given.';
            if (reason.length > 512) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'Please keep the reason below or exactly 512 characters.',
                }));
            }
        }

        const { guild } = message || interaction;
        const author = message?.author || interaction.user;
        const { active, setup } = guild.database;
        const { user, roles } = member;

        const data = await setup.fetch();
        if (!data || !data.mutedRole) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED',
                emoji: 'cross',
                description: 'No mute role found in this server, please use the `setup` command before using this.',
            }));
        }

        const role = await guild.roles.fetch(data.mutedRole);

        if (!roles.cache.has(role.id)) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That user is not muted.',
            }));
        }

        const confirmed = await confirmButtons({ message, interaction }, 'unmute', member.user, { reason });
        if (!confirmed) return;

        await roles.remove(role);
        this.client.emit('guildMemberUnmute', guild, author, user, reason);

        const mute = await active.fetch({ type: 'mute', user: { id: user.id } });
        if (mute) await active.delete(mute);

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `${user.tag} has been unmuted`,
            fieldValue: `**Reason:** ${reason}`,
        }));
    }
};
