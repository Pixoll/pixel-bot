/* eslint-disable no-unused-vars */
const { Command, CommandInstances } = require('pixoll-commando');
const { GuildMember } = require('discord.js');
const { basicEmbed, replyAll } = require('../../utils/functions');
const { stripIndent } = require('common-tags');
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class NickCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'nick',
            aliases: ['nickname', 'setnick'],
            group: 'mod',
            description: 'Change the nickname of a member or remove it.',
            details: stripIndent`
                \`member\` can be either a member's name, mention or ID.
                \`nick\` will be the member's new nickname.
                Setting \`nick\` as \`remove\` will remove the member's current nickname.
            `,
            format: 'nick [member] [nick]',
            examples: [
                'nick Pixoll Cool coder',
                'nick Pixoll remove',
            ],
            clientPermissions: ['MANAGE_NICKNAMES'],
            userPermissions: ['MANAGE_NICKNAMES'],
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to change/remove the nick?',
                    type: 'member',
                },
                {
                    key: 'nickname',
                    prompt: 'What will be their new nickname? Type `remove` to remove their current nickname.',
                    type: 'string',
                    max: 32,
                },
            ],
            slash: {
                options: [
                    {
                        type: 'user',
                        name: 'member',
                        description: 'The member to change or remove their nick.',
                        required: true,
                    },
                    {
                        type: 'string',
                        name: 'nickname',
                        description: 'Their new nickname.',
                        required: true,
                    },
                ],
            },
        });
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to change/remove their nick
     * @param {string} args.nickname The new nickname
     */
    async run({ message, interaction }, { member, nickname }) {
        if (interaction) {
            if (!(member instanceof GuildMember)) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'That is not a valid member in this server.',
                }));
            }
            if (nickname.length > 512) {
                return await replyAll({ interaction }, basicEmbed({
                    color: 'RED',
                    emoji: 'cross',
                    description: 'Please keep the nickname below or exactly 32 characters.',
                }));
            }
        }

        const { tag, username } = member.user;

        if (!member.manageable) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED',
                emoji: 'cross',
                fieldName: `Unable to change ${tag}'s nickname`,
                fieldValue: 'Please check the role hierarchy or server ownership.',
            }));
        }

        const isRemove = nickname.toLowerCase() === 'remove';

        const toApply = isRemove ? username : nickname;
        const wasApplied = await member.setNickname(toApply).catch(() => null);
        if (!wasApplied) {
            return await replyAll({ message, interaction }, basicEmbed({
                color: 'RED',
                emoji: 'cross',
                description: 'An error occurred when trying to change that member\'s nickname. Please try again.',
            }));
        }

        const description = isRemove ? `Removed \`${tag}\`'s nickname.`
            : `Changed \`${tag}\`'s nickname to \`${nickname}\``;

        await replyAll({ message, interaction }, basicEmbed({
            color: 'GREEN', emoji: 'check', description,
        }));
    }
};
