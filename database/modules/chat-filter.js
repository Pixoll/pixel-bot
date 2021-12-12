/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { CommandoClient, CommandoMessage } = require('../../command-handler/typings')
const { isModuleEnabled, basicEmbed, isMod, validURL, docId } = require('../../utils/functions')
const { moderations, active, setup, modules } = require('../../schemas')
/* eslint-enable no-unused-vars */

const badWordRegex = new RegExp(
    'bastard|blowjob|boner|boob|buttplug|cock|coon|cum|cunt|dick|dildo|fag|faggot|nigga|nigger|paki|porn|pussy|scum|sex|' +
    'slut|wank|whore',
    'm'
)

/** @param {number} number @param {number} total */
function percentage(number, total) {
    const chance = (number * 100) / total
    return Math.round(chance)
}

/**
 * This module manages the chat filter.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    // Warn - Default chat filter
    client.on('messageCreate', /** @param {CommandoMessage} message */ async message => {
        const { guild, author, member, content, mentions, guildId, channel } = message
        const permissions = member?.permissionsIn(channel).serialize() ?? null
        if (!guild || author.bot || !content || permissions?.ADMINISTRATOR) return

        const isEnabled = await isModuleEnabled(guild, 'chat-filter')
        if (!isEnabled) return

        const reasons = []

        if (mentions.everyone && !permissions?.MENTION_EVERYONE) {
            reasons.push('Tired to ping everyone.')
        }

        if (badWordRegex.test(content)) {
            reasons.push('Use of at least 1 blacklisted word.')
        }

        if (content.length > 50) {
            const uppercase = content.replace(/[^A-Z]/g, '')
            const moreThan80 = percentage(uppercase.length, content.length) > 80
            if (moreThan80) {
                reasons.push('More than 80% of the message is in uppercase.')
            }
        }

        const totalMentions = mentions.users.size + mentions.roles.size
        if (totalMentions > 10) {
            reasons.push('Mentioned more than 10 users/roles at once.')
        }

        if (/%CC%/g.test(encodeURIComponent(message.content))) {
            reasons.push('Usage of zalgo text.')
        }

        if (reasons.length === 0) return

        const reason = reasons.join(' - ')
        const mod = client.user

        await message.delete().catch(() => null)
        await guild.database.moderations.add({
            _id: docId(),
            type: 'warn',
            guild: guildId,
            userId: author.id,
            userTag: author.tag,
            modId: mod.id,
            modTag: mod.tag,
            reason
        })
        client.emit('guildMemberWarn', guild, mod, author, reason)

        await author.send(basicEmbed({
            color: 'GOLD',
            fieldName: `You have been warned on ${guild.name}`,
            fieldValue: stripIndent`
                **Reason:** ${reason}
                **Moderator:** ${mod.toString()} ${mod.tag} [Chat filtering system]
            `
        })).catch(() => null)
    })

    // client.on('messageCreate', async message => {
    //     if (!message.guild || message.author.bot || isMod(message.member)) return
    //     const data = await setup.findOne({ guild: message.guild.id })
    //     if (!data) return

    //     const toggled = await modules.findOne({ guild: message.guild.id })
    //     if (toggled && typeof (toggled.chatFilter) === 'boolean' && !toggled.chatFilter) return

    //     message.channel.messages.fetch({}, false).then(async messages => {
    //         const filtered = messages.filter(msg => msg.author === message.author && (new Date() - new Date(msg.createdTimestamp)) < 5000)
    //         if (filtered.size < 5) return

    //         let role = message.guild.roles.cache.find(role => role.name === 'Muted')

    //         if (!role) {
    //             const newRole = await message.guild.roles.create({ data: { name: 'Muted', color: '#818386', permissions: 0 } })
    //             message.guild.channels.cache.filter(ch => ch.type === 'category').each(channel => channel.updateOverwrite(newRole, { SEND_MESSAGES: false, SPEAK: false }))
    //             message.guild.channels.cache.filter(ch => ch.type === 'text').each(channel => channel.updateOverwrite(newRole, { SEND_MESSAGES: false }))
    //             message.guild.channels.cache.filter(ch => ch.type === 'voice').each(channel => channel.updateOverwrite(newRole, { SPEAK: false }))
    //             role = newRole
    //         }

    //         if (message.member.roles.cache.has(role.id)) return
    //         message.member.roles.add(role)

    //         const muted = new MessageEmbed()
    //             .setColor('#43B581')
    //             .setDescription(`**<:check:802617654396715029> ${message.member} has been muted for 1 minute\nReason:** Spam detection`)

    //         message.member.send(`You have been **muted** on **${message.guild.name}** for **1 minute\nReason:** Spam detection\n**Moderator:** ${client.user} - Auto-moderation system`).catch(() => null)
    //         message.reply(muted).then(msg => msg.delete({ timeout: 30000 }).catch(() => null))

    //         await new moderations({
    //             _id: docId(),
    //             type: 'mute',
    //             guild: message.guild.id,
    //             user: message.author.id,
    //             mod: client.user.id,
    //             reason: 'Spam detection',
    //             duration: '1 minute'
    //         }).save()
    //         await new active({
    //             type: 'mute',
    //             guild: message.guild.id,
    //             user: client.user.id,
    //             duration: Date.now() + myMs('1m')
    //         }).save()
    //     })
    // })

    // client.on('messageCreate', async message => {
    //     if (!message.guild || message.author.bot || message.content.startsWith(message.guild ? message.guild.prefix : client.prefix) || isMod(message.member)) return

    //     const data = await modules.findOne({ guild: message.guild.id })
    //     if (data && typeof (data.chatFilter) === 'boolean' && !data.chatFilter) return

    //     let deleted
    //     message.content.split(' ').forEach(async link => {
    //         if (deleted || !validURL(link) || !link.includes('discord') || link.match(/\.(jpeg|jpg|gif|png|webp|tiff|mp4|mov|mp3|avi|flv|wmv|svg|m4a|flac|wav|wma|ogg)$/)) return

    //         const invite = await client.fetchInvite(link).catch(() => null)
    //         if (!invite) return
    //         if (invite.guild.id === message.guild.id) return

    //         const warned = new MessageEmbed()
    //             .setColor('#43B581')
    //             .setDescription(`**<:check:802617654396715029> ${message.author} has been warned\nReason:** Posted an invite`)

    //         message.member.send(`You have been **warned** on **${message.guild.name}\nReason:** Posted an invite\n**Moderator:** ${client.user} - Auto-moderation system`).catch(() => null)
    //         message.reply(warned).then(msg => msg.delete({ timeout: 30000 }).catch(() => null))

    //         await new moderations({
    //             _id: docId(),
    //             type: 'warn',
    //             guild: message.guild.id,
    //             user: message.author.id,
    //             mod: client.user.id,
    //             reason: 'Posted an invite'
    //         }).save()

    //         message.delete(), deleted = true
    //     })
    // })
}
