/* eslint-disable no-unused-vars */
const { Command } = require('../../command-handler')
const { CommandInstances } = require('../../command-handler/typings')
const { GuildMember } = require('discord.js')
const { generateEmbed, basicEmbed, pluralize, memberDetails } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class RolesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roles',
            group: 'lists',
            description: 'Displays a list of roles in the server, or the roles of a specific member.',
            details: memberDetails(),
            format: 'roles <member>',
            examples: ['roles Pixoll'],
            guildOnly: true,
            args: [{
                key: 'member',
                prompt: 'What member do you want to get the roles from?',
                type: 'member',
                required: false
            }],
            slash: {
                options: [{
                    type: 'user',
                    name: 'member',
                    description: 'The member to get the roles from.'
                }]
            }
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {GuildMember} args.member The member to get the roles from
     */
    async run({ message, interaction }, { member }) {
        const { guild, guildId } = message || interaction

        const memberRoles = member?.roles.cache.filter(role => role.id !== guildId)
        const guildRoles = !memberRoles ? await guild.roles.fetch() : null

        const rolesCache = memberRoles || guildRoles.filter(role => role.id !== guildId)
        if (!rolesCache) {
            const embed = basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'I couldn\'t find any roles..'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message.replyEmbed(embed)
            return
        }

        const name = member?.user.username || guild.name
        const avatar = member?.user.displayAvatarURL({ dynamic: true }) || guild.iconURL({ dynamic: true })

        const roles = rolesCache.sort((a, b) => b.position - a.position).map(r => `${r.toString()} ${r.name}`) || null

        if (!roles) {
            const embed = basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'This member has no roles.'
            })
            await interaction?.editReply({ embeds: [embed] })
            await message?.replyEmbed(embed)
            return
        }

        await generateEmbed({ message, interaction }, roles, {
            number: 20,
            authorName: `${name} has ${pluralize('role', roles.length)}`,
            authorIconURL: avatar,
            useDescription: true
        })
    }
}