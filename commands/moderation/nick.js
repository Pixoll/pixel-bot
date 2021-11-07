const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { GuildMember } = require('discord.js')
const { basicEmbed, memberDetails } = require('../../utils')
const { stripIndent } = require('common-tags')

/** A command that can be run in a client */
module.exports = class NicknameCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'nickname',
            aliases: ['nick', 'setnick'],
            group: 'mod',
            description: 'Change the nickname of a member or remove it.',
            details: stripIndent`
                ${memberDetails()} \`nick\` will be the member's new nickname.
                Setting \`nick\` as \`remove\` will remove the member's current nickname.
            `,
            format: 'nickname [member] [nick]',
            examples: [
                'nickname Pixoll Cool coder',
                'nickname Pixoll remove'
            ],
            clientPermissions: ['MANAGE_NICKNAMES'],
            userPermissions: ['MANAGE_NICKNAMES'],
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'What member do you want to change/remove the nick?',
                    type: 'member'
                },
                {
                    key: 'nickname',
                    prompt: 'What will be their new nickname? Type `remove` to remove their current nickname.',
                    type: 'string',
                    max: 32
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to change/remove their nick
     * @param {string} args.nickname The new nickname
     */
    async run(message, { member, nickname }) {
        const { tag, username } = member.user

        if (!member.manageable) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', fieldName: `Unable to change ${tag}'s nickname`,
                fieldValue: 'Please check the role hierarchy or server ownership.'
            }))
        }

        const isRemove = nickname.toLowerCase() === 'remove'

        const toApply = isRemove ? username : nickname
        const wasApplied = await member.setNickname(toApply).catch(() => null)
        if (!wasApplied) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross',
                description: 'An error occurred when trying to change that member\'s nickname. Please try again.'
            }))
        }

        const description = isRemove ? `Removed \`${tag}\`'s nickname.` :
            `Changed \`${tag}\`'s nickname to \`${nickname}\``

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description
        }))
    }
}