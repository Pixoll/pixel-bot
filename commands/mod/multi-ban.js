/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances, CommandoMessage } = require('../../command-handler/typings')
const { GuildMember } = require('discord.js')
const { stripIndent } = require('common-tags')
const { docId, isMod, basicEmbed, memberDetails, confirmButtons } = require('../../utils')
/* eslint-enable no-unused-vars */

/**
 * Validates a {@link GuildMember}
 * @param {CommandoMessage} msg The member to validate
 * @param {GuildMember} member The member to validate
 */
function validMember(msg, member) {
    if (!member) return false

    const { author, guild, client } = msg
    const { user } = member
    const authorId = author.id

    if (user.id !== client.user.id && user.id !== authorId) {
        if (!member.bannable) return false
        if (guild.ownerId === authorId) return true
        if (isMod(member)) return false
        return true
    } else {
        return true
    }
}

/** A command that can be run in a client */
module.exports = class MultiBanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'multi-ban',
            aliases: ['massban', 'multiban', 'mass-ban'],
            group: 'mod',
            description: 'Ban multiple members at the same time (max. 30 at once).',
            details: stripIndent`
                \`reason\` **has** to be surrounded by quotes.
                ${memberDetails(null, true)}
            `,
            format: 'multi-ban "[reason]" [members]',
            examples: ['multi-ban "Raid" Pixoll, 801615120027222016'],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true,
            args: [
                {
                    key: 'reason',
                    prompt: 'What is the reason of the ban?',
                    type: 'string',
                    max: 512
                },
                {
                    key: 'members',
                    prompt: 'What members do you want to ban?',
                    type: 'string',
                    validate: async (val, msg, arg) => {
                        const type = msg.client.registry.types.get('member')
                        const array = val.split(/\s*,\s*/).slice(0, 30)
                        const valid = []
                        for (const str of array) {
                            const con1 = await type.validate(str, msg, arg)
                            if (!con1) valid.push(false)
                            const con2 = validMember(msg, await type.parse(str, msg))
                            valid.push(con2)
                        }
                        return valid.filter(b => b !== true).length === array.length
                    },
                    parse: async (val, msg, arg) => {
                        const type = msg.client.registry.types.get('member')
                        const array = val.split(/\s*,\s*/).slice(0, 30)
                        const valid = []
                        for (const str of array) {
                            const con1 = await type.validate(str, msg, arg)
                            if (!con1) valid.push(false)
                            const member = await type.parse(str, msg)
                            const con2 = validMember(msg, member)
                            if (!con2) continue
                            valid.push(member)
                        }
                        return valid
                    },
                    error: 'None of the members you specified were valid. Please try again.'
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.reason The reason of the ban
     * @param {GuildMember[]} args.members The members to ban
     */
    async run({ message }, { reason, members }) {
        const { guild, author, guildId } = message
        const manager = guild.members

        const embed = n => basicEmbed({
            color: 'GOLD', emoji: 'loading', description: `Banned ${n}/${members.length} members...`
        })
        const toEdit = await message.replyEmbed(embed(0))

        const banned = []
        for (const { user } of members) {
            const confirm = await confirmButtons({ message }, 'ban', user, { reason }, false)
            if (!confirm) continue

            if (!user.bot) {
                await user.send({
                    embeds: [basicEmbed({
                        color: 'GOLD',
                        fieldName: `You have been banned from ${guild.name}`,
                        fieldValue: stripIndent`
                            **Reason:** ${reason}
                            **Moderator:** ${author.toString()}
                        `
                    })]
                }).catch(() => null)
            }

            await manager.ban(user, { days: 7, reason })

            await guild.database.moderations.add({
                _id: docId(),
                type: 'ban',
                guild: guildId,
                userId: user.id,
                userTag: user.tag,
                modId: author.id,
                modTag: author.tag,
                reason
            })

            banned.push(user)
            await toEdit.edit({ embeds: [embed(banned.length)] }).catch(() => null)
        }

        const options = banned.length !== 0 ? {
            color: 'GREEN',
            emoji: 'check',
            fieldName: 'Banned the following members:',
            fieldValue: banned.map(u => `"${u.tag}"`).join(', ')
        } : {
            color: 'RED', emoji: 'cross', description: 'No members were banned.'
        }

        await toEdit?.delete().catch(() => null)
        await message.replyEmbed(basicEmbed(options))
    }
}