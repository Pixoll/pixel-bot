const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { GuildMember } = require('discord.js')
const { stripIndent } = require('common-tags')
const { docId, isMod, basicEmbed, memberDetails, modConfirmation } = require('../../utils')
const { moderations } = require('../../mongo/schemas')
const { ModerationSchema } = require('../../mongo/typings')

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
            name: 'multiban',
            aliases: ['massban', 'multi-ban', 'mass-ban'],
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
            throttling: { usages: 1, duration: 3 },
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
                            const con2 = validMember(msg, con1 === true ? await type.parse(str, msg) : null)
                            valid.push(con1 && con2)
                        }
                        const wrong = valid.filter(b => b !== true)
                        return wrong[0] === undefined
                    },
                    parse: async (val, msg) => {
                        const type = msg.client.registry.types.get('member')
                        const array = val.split(/\s*,\s*/).slice(0, 30)
                        const valid = []
                        for (const str of array) {
                            valid.push(await type.parse(str, msg))
                        }
                        return valid
                    },
                    error: 'At least one of the members you specified was invalid, please try again.'
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.reason The reason of the ban
     * @param {GuildMember[]} args.members The members to ban
     */
    async run(message, { reason, members }) {
        const { guild, author, guildId } = message
        const manager = guild.members
        const authorId = author.id

        const embed = n => basicEmbed({
            color: 'GOLD', emoji: 'loading', description: `Banned ${n}/${members.length} members...`
        })
        const toEdit = await message.replyEmbed(embed(0))

        const banned = []
        for (const { user } of members) {
            const confirm = await modConfirmation(message, 'ban', user, { reason }, false)
            if (!confirm) continue

            if (!user.bot) {
                await user.send({
                    embeds: [basicEmbed({
                        color: 'GOLD', fieldName: `You have been banned from ${guild.name}`,
                        fieldValue: stripIndent`
                            **Reason:** ${reason}
                            **Moderator:** ${author.toString()}
                        `
                    })]
                }).catch(() => null)
            }

            await manager.ban(user, { days: 7, reason })
            banned.push(user)
            await toEdit.edit({ embeds: [embed(banned.length)] })

            /** @type {ModerationSchema} */
            const doc = {
                _id: docId(),
                type: 'ban',
                guild: guildId,
                user: { id: user.id, tag: user.tag },
                mod: { id: authorId, tag: author.tag },
                reason: reason
            }

            await new moderations(doc).save()
        }

        const options = banned.length !== 0 ? {
            color: 'GREEN', emoji: 'check', fieldName: `Banned the following members:`,
            fieldValue: banned.map(u => `"${u.tag}"`).join(', ')
        } : {
            color: 'RED', emoji: 'cross', description: 'No members were banned.'
        }

        await toEdit.edit({ embeds: [basicEmbed(options)] })
    }
}