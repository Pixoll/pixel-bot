const { Command, CommandoMessage, CommandoGuild } = require('discord.js-commando')
const { MessageEmbed, RoleManager } = require('discord.js')
const { stripIndent } = require('common-tags')

const ownerCrown = '<a:owner_crown:806558872440930425>'
const boost = '<a:boost:806364586231595028>'

/**
 * returns an emoji corresponding to the boost tier/level of the server
 * @param {number} tier the boost tier of the server
 */
function boostLevel(tier) {
    if (tier === 0) return '<:boostLVL0:806554204323184692>'
    if (tier === 1) return '<:boostLVL1:806554216641331221>'
    if (tier === 2) return '<:boostLVL2:806554227815481364>'
    if (tier === 3) return '<:boostLVL3:806554239567527946>'
}

/**
 * gets information about a guild
 * @param {CommandoGuild} guild the guild to get info from
 */
async function getServerInfo(guild) {
    const { name, owner, channels, premiumTier, premiumSubscriptionCount, memberCount, roles, id, createdTimestamp } = guild

    const categories = channels.cache.filter(({ type }) => type === 'category').size
    const text = channels.cache.filter(({ type }) => type === 'text').size
    const voice = channels.cache.filter(({ type }) => type === 'voice').size

    const _roles = await roles.fetch()

    const serverInfo = new MessageEmbed()
        .setColor('RANDOM')
        .setAuthor(name, guild.iconURL({ dynamic: true }))
        .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
        .addFields(
            {
                name: 'Information',
                value: stripIndent`
                        **>** **Owner:** ${owner.user.tag} ${ownerCrown}
                        **>** **Channel Categories:** ${categories}
                        **>** **Text Channels:** ${text}
                        **>** **Voice Channels:** ${voice}
                    `,
                inline: true
            },
            {
                name: '\u200B',
                value: stripIndent`
                        **>** **Server Boost Level:** ${premiumTier}${boostLevel(premiumTier)}
                        **>** **Server Boosts:** ${premiumSubscriptionCount} ${boost}
                        **>** **Members:** ${memberCount}
                        **>** **Roles:** ${_roles.cache.size}
                    `,
                inline: true
            }
        )
        .setFooter(`Server ID: ${id} | Server Created`).setTimestamp(createdTimestamp)

    return serverInfo
}

module.exports = class serverinfo extends Command {
    constructor(client) {
        super(client, {
            name: 'serverinfo',
            group: 'misc',
            memberName: 'serverinfo',
            description: 'Displays some information and statistics of the server, such as owner, boosts and member count.',
            guildOnly: true
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message
     * @param {CommandoGuild} guild
     */
    async run(message, guild) {
        const server = message.guild || guild
        const info = await getServerInfo(server)

        await message.say(info)
    }
}