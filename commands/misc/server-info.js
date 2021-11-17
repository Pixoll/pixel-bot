/* eslint-disable no-unused-vars */
const Command = require('../../command-handler/commands/base')
const { CommandoMessage, CommandoGuild } = require('../../command-handler/typings')
const { MessageEmbed, PremiumTier } = require('discord.js')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

const ownerCrown = '<a:owner_crown:806558872440930425>'
const boost = '<a:boost:806364586231595028>'

/**
 * Formats the guild's boost tier level
 * @param {PremiumTier} tier The boost tier of the server
 */
function formatLvl(tier) {
    if (tier === 'NONE') return '0<:boostLVL0:806554204323184692>'
    if (tier === 'TIER_1') return '1<:boostLVL1:806554216641331221>'
    if (tier === 'TIER_2') return '2<:boostLVL2:806554227815481364>'
    if (tier === 'TIER_3') return '3<:boostLVL3:806554239567527946>'
}

/** A command that can be run in a client */
module.exports = class ServerInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'serverinfo',
            aliases: ['server-info'],
            group: 'misc',
            description: 'Displays some information and statistics of the server, such as owner, boosts and member count.',
            guildOnly: true
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {CommandoGuild} guild The guild to get information from
     */
    async run(message, guild) {
        const server = message.guild || guild
        const { name, channels, premiumTier, premiumSubscriptionCount, memberCount, roles, id, createdTimestamp } = server
        const owner = await server.fetchOwner()

        const _channels = channels.cache
        const categories = _channels.filter(c => c.type === 'GUILD_CATEGORY').size
        const text = _channels.filter(c => c.type === 'GUILD_TEXT').size
        const voice = _channels.filter(c => c.type === 'GUILD_VOICE').size

        const _roles = await roles.fetch()

        const serverInfo = new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor(name, server.iconURL({ dynamic: true }))
            .setThumbnail(server.iconURL({ dynamic: true, size: 2048 }))
            .addField('Information', stripIndent`
                **>** **Owner:** ${owner.user.tag} ${ownerCrown}
                **>** **Channel categories:** ${categories}
                **>** **Text channels:** ${text}
                **>** **Voice channels:** ${voice}
            `, true)
            .addField('\u200B', stripIndent`
                **>** **Server boost lvl:** ${formatLvl(premiumTier)}
                **>** **Server boosts:** ${premiumSubscriptionCount} ${boost}
                **>** **Members:** ${memberCount}
                **>** **Roles:** ${_roles.size}
            `, true)
            .setFooter(`Server id: ${id} | Created at`)
            .setTimestamp(createdTimestamp)

        await message.replyEmbed(serverInfo)
    }
}