/* eslint-disable no-unused-vars */
const { User, GuildMember } = require('discord.js');
const { Command, CommandInstances } = require('pixoll-commando');
const {
    docId, basicEmbed, userException, memberException, confirmButtons, replyAll
} = require('../../utils/functions');
const { stripIndent } = require('common-tags');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class BanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'mod',
            description: 'Ban a user permanently.',
            details: stripIndent`
                \`user\` has to be a user's username, ID or mention.
                If \`reason\` is not specified, it will default as "No reason given".
            `,
            format: 'ban [user] <reason>',
            examples: [
                'ban Pixoll',
                'ban Pixoll The Ban Hammer has Spoken!'
            ],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true,
            args: [
                {
                    key: 'user',
                    prompt: 'What user do you want to ban?',
                    type: 'user'
                },
                {
                    key: 'reason',
                    prompt: 'What is the reason of the ban?',
                    type: 'string',
                    max: 512,
                    default: 'No reason given.'
                }
            ],
            slash: {
                options: [
                    {
                        type: 'user',
                        name: 'user',
                        description: 'The user to ban.',
                        required: true
                    },
                    {
                        type: 'string',
                        name: 'reason',
                        description: 'The reason of the ban.'
                    }
                ]
            }
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {User} args.user The user to ban
     * @param {string} args.reason The reason of the ban
     */
    async run({ message, interaction }, { user, reason }) {
        if (interaction) {
            user = user.user || user;
            reason ??= 'No reason given.';
            if (reason.length > 512) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'Please keep the reason below or exactly 512 characters.'
                }));
            }
        }

        const { guild, guildId, member: mod } = message || interaction;
        const { members, bans, database } = guild;
        const author = message?.author || interaction.user;

        const uExcept = userException(user, author, this);
        if (uExcept) return await replyAll({ message, interaction }, basicEmbed(uExcept));

        const isBanned = await bans.fetch(user).catch(() => null);
        if (isBanned) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED', emoji: 'cross', description: 'That user is already banned.'
            }));
        }

        /** @type {GuildMember} */
        const member = await members.fetch(user).catch(() => null);
        const mExcept = memberException(member, mod, this);
        if (mExcept) return await replyAll({ message, interaction }, basicEmbed(mExcept));

        const confirmed = await confirmButtons({ message, interaction }, 'ban', user, { reason });
        if (!confirmed) return;

        if (!user.bot && member) {
            await user.send({
                embeds: [basicEmbed({
                    color: 'GOLD',
                    fieldName: `You have been banned from ${guild.name}`,
                    fieldValue: stripIndent`
                        **Reason:** ${reason}
                        **Moderator:** ${author.toString()} ${author.tag}
                    `
                })]
            }).catch(() => null);
        }

        await members.ban(user, { days: 7, reason });

        await database.moderations.add({
            _id: docId(),
            type: 'ban',
            guild: guildId,
            userId: user.id,
            userTag: user.tag,
            modId: author.id,
            modTag: author.tag,
            reason
        });

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN',
            emoji: 'check',
            fieldName: `${user.tag} has been banned`,
            fieldValue: `**Reason:** ${reason}`
        }));
    }
};
