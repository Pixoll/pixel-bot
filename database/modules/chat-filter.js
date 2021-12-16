/* eslint-disable no-unused-vars */
const { stripIndent } = require('common-tags')
const { Collection, Message, Invite } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { isModuleEnabled, basicEmbed, docId, timestamp } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

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
    client.on('cMessageCreate', async message => {
        const { guild, author, member, content, mentions, guildId, channel } = message
        const permissions = member?.permissionsIn(channel).serialize() ?? null
        if (!guild || author.bot || !content || permissions?.ADMINISTRATOR) return

        const isEnabled = await isModuleEnabled(guild, 'chat-filter')
        if (!isEnabled) return

        const reasons = []

        if (mentions.everyone && !permissions?.MENTION_EVERYONE) {
            reasons.push('Tired to ping everyone.')
        }

        const badWordRegex = new RegExp(
            'bastard|blowjob|boner|boob|buttplug|cock|coon|cum|cunt|dick|dildo|fag|faggot|nigga|nigger|paki|porn|pussy|' +
            'slut|wank|whores|cum|sex',
            'm'
        )

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

    // Mute - Spam detector
    client.on('cMessageCreate', async message => {
        const { guild, guildId, author, member, channel, isCommand } = message
        const permissions = member?.permissionsIn(channel).serialize() ?? null
        if (!guild || author.bot || isCommand || permissions?.ADMINISTRATOR) return

        const isEnabled = await isModuleEnabled(guild, 'chat-filter')
        if (!isEnabled) return

        const { setup, moderations, active } = guild.database

        const setupData = await setup.fetch()
        if (!setupData || !setupData.mutedRole) return

        const mutedRole = await guild.roles.fetch(setupData.mutedRole)
        if (!mutedRole) return

        /** @type {Collection<string, Message>} */
        const messages = await channel.messages.fetch().catch(() => null)
        if (!messages) return

        const now = Date.now()
        const filtered = messages.filter(msg => msg.author.id === author.id && (now - msg.createdTimestamp) < 5000)
        if (filtered.size < 5) return

        if (member.roles.cache.has(mutedRole.id)) return
        await member.roles.add(mutedRole)

        const reason = 'Spam detection'
        const mod = client.user
        const duration = now + 60_000
        const id = docId()

        await moderations.add({
            _id: id,
            type: 'mute',
            guild: guildId,
            userId: author.id,
            userTag: author.tag,
            modId: mod.id,
            modTag: mod.tag,
            reason,
            duration: '1 minute'
        })
        await active.add({
            _id: id,
            type: 'mute',
            guild: guildId,
            userId: author.id,
            userTag: author.tag,
            duration
        })

        await author.send(basicEmbed({
            color: 'GOLD',
            fieldName: `You have been muted on ${guild.name}`,
            fieldValue: stripIndent`
                **Expires:** ${timestamp(duration, 'R')}
                **Reason:** ${reason}
                **Moderator:** ${mod.toString()} ${mod.tag} [Chat filtering system]
            `
        })).catch(() => null)
    })

    // Warn - Invite detector
    client.on('cMessageCreate', async message => {
        const { guild, author, isCommand, content, guildId, channel, member } = message
        const permissions = member?.permissionsIn(channel).serialize() ?? null
        if (!guild || author.bot || !content || isCommand || permissions?.ADMINISTRATOR) return

        const isEnabled = await isModuleEnabled(guild, 'chat-filter')
        if (!isEnabled) return

        /** @type {Collection<string, Invite>} */
        const invites = await guild.invites.fetch().catch(() => null)
        const matches = [...content.matchAll(/discord\.\w+\/(?:invite\/)?([^ ]+)/g)].map(m => m[1])

        for (const code of matches) {
            if (message?.deleted) return

            /** @type {Invite} */
            const invite = await client.fetchInvite(code).catch(() => null)
            if (!invite || invites?.get(invite.code)) continue

            const reason = 'Posted an invite'
            const mod = client.user

            message = await message.delete().catch(() => null)
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
        }
    })
}
