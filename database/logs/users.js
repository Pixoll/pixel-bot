/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { MessageEmbed, UserFlagsString } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, compareArrays, customEmoji } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/**
 * Parses a user flag into an emoji.
 * @param {UserFlagsString} flag The flag to parse.
 * @returns {string}
 */
function parseUserFlag(flag) {
    switch (flag) {
        case 'BUGHUNTER_LEVEL_1': return '<:bug_hunter:894117053714292746>'
        case 'BUGHUNTER_LEVEL_2': return '<:bug_buster:894117053856878592>'
        case 'DISCORD_EMPLOYEE': return '<:discord_staff:894115772832546856>'
        case 'EARLY_SUPPORTER': return '<:early_supporter:894117997264896080>'
        case 'EARLY_VERIFIED_BOT_DEVELOPER': return '<:verified_developer:894117997378142238>'
        case 'HOUSE_BALANCE': return '<:balance:894110823553855518>'
        case 'HOUSE_BRAVERY': return '<:bravery:894110822786281532>'
        case 'HOUSE_BRILLIANCE': return '<:brilliance:894110822626885663>'
        case 'HYPESQUAD_EVENTS': return '<:hypesquad:894113047763898369>'
        case 'PARTNERED_SERVER_OWNER': return '<:partner:894116243785785344>'
        case 'TEAM_USER': return ''
        case 'VERIFIED_BOT': return '<:verified_bot1:894251987087016006><:verified_bot2:894251987661647873>'
    }
}

/**
 * Returns a clickable link to the image. `None` if the link is invald
 * @param {string} link The link of the image
 */
function imageLink(link) {
    if (link) return `[Click here](${link})`
    return 'None'
}

/**
 * Handles all of the member logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('userUpdate', async (oldUser, newUser) => {
        const { username: name1, discriminator: discrim1, avatar: avatar1, flags: flags1 } = oldUser
        const { username: name2, discriminator: discrim2, avatar: avatar2, flags: flags2, id, tag } = newUser

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor('Updated user', newUser.displayAvatarURL({ dynamic: true }))
            .setDescription(`${newUser.toString()} ${tag}`)
            .setFooter(`User id: ${id}`)
            .setTimestamp()

        if (name1 !== name2) embed.addField('Username', `${name1} ➜ ${name2}`)

        if (discrim1 !== discrim2) embed.addField('Discriminator', `${discrim1} ➜ ${discrim2}`)

        if (avatar1 !== avatar2) {
            embed.addField('Avatar', stripIndent`
                **Before:** ${imageLink(oldUser.displayAvatarURL({ dynamic: true, size: 2048 }))}
                **After:** ${imageLink(newUser.displayAvatarURL({ dynamic: true, size: 2048 }))}
            `).setThumbnail(newUser.displayAvatarURL({ dynamic: true, size: 2048 }))
        }

        if (flags1 !== flags2) {
            const array1 = flags1?.toArray().map(flag => parseUserFlag(flag)) || []
            const array2 = flags2?.toArray().map(flag => parseUserFlag(flag)) || []
            const [added, removed] = compareArrays(array1, array2)

            if (added.length !== 0) embed.addField(`${customEmoji('check')} Added badges`, added.join(', '))
            if (removed.length !== 0) embed.addField(`${customEmoji('cross')} Removed badges`, removed.join(', '))
        }

        if (embed.fields.length === 0) return

        const guilds = client.guilds.cache.toJSON()
        for (const guild of guilds) {
            const member = guild.members.cache.get(id)
            if (!member) continue

            const status = await isModuleEnabled(guild, 'audit-logs', 'users')
            if (!status) return

            guild.queuedLogs.push(embed)
        }
    })
}
