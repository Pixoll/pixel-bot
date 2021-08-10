const { MessageEmbed } = require('discord.js')
const { CommandoClient } = require('discord.js-commando')
const { ms } = require('../custom-ms')
const { isMod, validURL, docID } = require('../functions')
const { moderations, active, setup, modules } = require('../mongodb-schemas')

/**
 * This module manages the chat filter.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('message', async message => {
        if (!message.guild || message.author.bot || isMod(message.member)) return

        const data = await modules.findOne({ guild: message.guild.id })
        if (data && typeof (data.chatFilter) === 'boolean' && !data.chatFilter) return

        const reason = []
        var deleted

        const modArray = ['anal', 'anus', 'arse', 'ass', 'ballsack', 'bastard', 'bitch', 'blowjob', 'bollock', 'boner', 'boob',
            'bugger', 'buttplug', 'clitoris', 'chink', 'cock', 'coon', 'cunt', 'dick', 'dildo', 'dyke', 'fag', 'faggot', 'feck',
            'fellate', 'fellatio', 'felching', 'fudgepacker', 'flange', 'fuck', 'jerk', 'jizz', 'knobend', 'labia', 'muff', 'nigga',
            'nigger', 'paki', 'penis', 'piss', 'porn', 'prick', 'pube', 'pussy', 'queer', 'scrotum', 'scum', 'sex', 'shit', 'slut',
            'smegma', 'spunk', 'tit', 'tosser', 'turd', 'twat', 'vagina', 'wank', 'whore', 'your mother']

        modArray.forEach(word => {
            if (deleted) return

            /** @param {String} srt */
            function replaceNonLetters(srt) {
                return srt.replace(/!|1|¡/g, 'i').replace(/0/g, 'o').replace(/\W/g, ' ')
            }

            if (replaceNonLetters(message.content.toLowerCase()).includes(word)) message.delete().then(reason.push('Swearing')).catch(console.error), deleted = true
        })

        /** @param {Number} number  @param {Number} total */
        function percentage(number, total) {
            return ((number * 100) / total).toFixed(0)
        }

        if (percentage(message.content.replace(/[^A-Z]/g, '').length, message.content.length) > 70 && message.content.length > 10) {
            reason.push('Abuse of capitals')
            if (!deleted) message.delete().catch(console.error), deleted = true
        }

        if (message.mentions.users.size > 5) {
            reason.push('Mass mention')
            if (!deleted) message.delete().catch(console.error), deleted = true
        }

        if (/%CC%/g.test(encodeURIComponent(message.content))) {
            reason.push('Usage of zalgo')
            if (!deleted) message.delete().catch(console.error), deleted = true
        }

        if (reason.length > 0) {
            const warned = new MessageEmbed()
                .setColor('#43B581')
                .setDescription(`**<:check:802617654396715029> ${message.author} has been warned\nReason${reason.length > 1 ? 's' : ''}:** ${reason.join(' - ')}`)

            message.member.send(`You have been **warned** on **${message.guild.name}\nReason${reason.length > 1 ? 's' : ''}:** ${reason.join(' - ')}\n**Moderator:** ${client.user} - Auto-moderation system`).catch(console.error)
            message.say(warned).then(msg => msg.delete({ timeout: 30000 }).catch(console.error))

            await new moderations({
                _id: docID(),
                type: 'warn',
                guild: message.guild.id,
                user: message.author.id,
                mod: client.user.id,
                reason: reason.join(' - ')
            }).save()
        }
    })

    client.on('message', async message => {
        if (!message.guild || message.author.bot || isMod(message.member)) return
        const data = await setup.findOne({ guild: message.guild.id })
        if (!data) return

        const toggled = await modules.findOne({ guild: message.guild.id })
        if (toggled && typeof (toggled.chatFilter) === 'boolean' && !toggled.chatFilter) return

        message.channel.messages.fetch().then(async messages => {
            const filtered = messages.filter(msg => msg.author === message.author && (new Date() - new Date(msg.createdTimestamp)) < 5000)
            if (filtered.size < 5) return

            var role = message.guild.roles.cache.find(role => role.name === 'Muted')

            if (!role) {
                const newRole = await message.guild.roles.create({ data: { name: 'Muted', color: '#818386', permissions: 0 } })
                message.guild.channels.cache.filter(ch => ch.type === 'category').each(channel => channel.updateOverwrite(newRole, { SEND_MESSAGES: false, SPEAK: false }))
                message.guild.channels.cache.filter(ch => ch.type === 'text').each(channel => channel.updateOverwrite(newRole, { SEND_MESSAGES: false }))
                message.guild.channels.cache.filter(ch => ch.type === 'voice').each(channel => channel.updateOverwrite(newRole, { SPEAK: false }))
                role = newRole
            }

            if (message.member.roles.cache.has(role.id)) return
            message.member.roles.add(role)

            const muted = new MessageEmbed()
                .setColor('#43B581')
                .setDescription(`**<:check:802617654396715029> ${message.member} has been muted for 1 minute\nReason:** Spam detection`)

            message.member.send(`You have been **muted** on **${message.guild.name}** for **1 minute\nReason:** Spam detection\n**Moderator:** ${client.user} - Auto-moderation system`).catch(console.error)
            message.say(muted).then(msg => msg.delete({ timeout: 30000 }).catch(console.error))

            await new moderations({
                _id: docID(),
                type: 'mute',
                guild: message.guild.id,
                user: message.author.id,
                mod: client.user.id,
                reason: 'Spam detection',
                duration: '1 minute'
            }).save()
            await new active({
                type: 'mute',
                guild: message.guild.id,
                user: client.user.id,
                duration: Date.now() + ms('1m')
            }).save()
        })
    })

    client.on('message', async message => {
        if (!message.guild || message.author.bot || message.content.startsWith(message.guild ? message.guild.commandPrefix : client.commandPrefix) || isMod(message.member)) return

        const data = await modules.findOne({ guild: message.guild.id })
        if (data && typeof (data.chatFilter) === 'boolean' && !data.chatFilter) return

        var deleted
        message.content.split(' ').forEach(async link => {
            if (deleted || !validURL(link) || !link.includes('discord') || link.match(/\.(jpeg|jpg|gif|png|webp|tiff|mp4|mov|mp3|avi|flv|wmv|svg|m4a|flac|wav|wma|ogg)$/)) return

            const invite = await client.fetchInvite(link).catch(console.error)
            if (!invite) return
            if (invite.guild.id === message.guild.id) return

            const warned = new MessageEmbed()
                .setColor('#43B581')
                .setDescription(`**<:check:802617654396715029> ${message.author} has been warned\nReason:** Posted an invite`)

            message.member.send(`You have been **warned** on **${message.guild.name}\nReason:** Posted an invite\n**Moderator:** ${client.user} - Auto-moderation system`).catch(console.error)
            message.say(warned).then(msg => msg.delete({ timeout: 30000 }).catch(console.error))

            await new moderations({
                _id: docID(),
                type: 'warn',
                guild: message.guild.id,
                user: message.author.id,
                mod: client.user.id,
                reason: 'Posted an invite'
            }).save()

            message.delete(), deleted = true
        })
    })
}