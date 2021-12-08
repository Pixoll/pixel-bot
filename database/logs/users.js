/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, compareArrays, customEmoji } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

const userFlags = {
    HOUSE_BRAVERY: '<:bravery:894110822786281532>',
    HOUSE_BRILLIANCE: '<:brilliance:894110822626885663> ',
    HOUSE_BALANCE: '<:balance:894110823553855518>',
    HYPESQUAD_EVENTS: '<:hypesquad:894113047763898369>',
    DISCORD_EMPLOYEE: '<:discord_staff:894115772832546856>',
    PARTNERED_SERVER_OWNER: '<:partner:894116243785785344>',
    BUGHUNTER_LEVEL_1: '<:bug_hunter:894117053714292746>',
    BUGHUNTER_LEVEL_2: '<:bug_buster:894117053856878592>',
    EARLY_SUPPORTER: '<:early_supporter:894117997264896080>',
    EARLY_VERIFIED_BOT_DEVELOPER: '<:verified_developer:894117997378142238>',
    DISCORD_CERTIFIED_MODERATOR: '<:certified_moderator:894118624447586304>',
    VERIFIED_BOT: '<:verified_bot1:894251987087016006><:verified_bot2:894251987661647873>',
    TEAM_USER: '',
}

/**
 * Returns a clickable link to the image. `None` if the link is invald
 * @param {string} link The link of the image
 */
function imageLink(link) {
    if (link) return `[Click here](${link})`
    return 'None'
}

const imgOptions = { dynamic: true, size: 2048 }

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
                **Before:** ${imageLink(oldUser.displayAvatarURL(imgOptions))}
                **After:** ${imageLink(newUser.displayAvatarURL(imgOptions))}
            `).setThumbnail(newUser.displayAvatarURL(imgOptions))
        }

        if (flags1 !== flags2) {
            const array1 = flags1?.toArray().map(flag => userFlags[flag]) || []
            const array2 = flags2?.toArray().map(flag => userFlags[flag]) || []
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