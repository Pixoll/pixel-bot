const { MessageEmbed, GuildChannel } = require('discord.js')
const { Command, CommandoMessage } = require('discord.js-commando')
const { isMod } = require('../../utils/functions')
const { setup: setupData } = require('../../utils/mongo/schemas')

module.exports = class setup extends Command {
    constructor(client) {
        super(client, {
            name: 'setup',
            group: 'utility',
            memberName: 'setup',
            description: 'Setup the bot to it\'s core!',
            details: 'This command saves critical data needed for multiple features to work, so please make sure to excute this command the first time I join your server (you don\'t have to do it again if I re-joined your server).\nYou\'ll be asked for the following data:\n**>** Audit logs channel\n**>** Muted, member and bot roles\n**>** Lockdown channels',
            format: 'setup',
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true,
            guarded: true,
            throttling: { usages: 1, duration: 3 }
        })
    }

    onBlock() { return }
    onError() { return }

    /** @param {CommandoMessage} message */
    async run(message) {
        // Embeds
        const invalidCh = new MessageEmbed()
            .setColor('#F04947')
            .setDescription('<:cross:802617654442852394> That channel does not exist, please make sure to type a correct name or ID.')
        const invalidRole = new MessageEmbed()
            .setColor('#F04947')
            .setDescription('<:cross:802617654442852394> That role does not exist or it cannot be used, please make sure to type a correct name or ID.')
        const alreadyCreated = new MessageEmbed()
            .setColor('#F04947')
            .setDescription('<:cross:802617654442852394> That role already exists in this server.')
        const noChannels = new MessageEmbed()
            .setColor('#F04947')
            .setDescription('<:cross:802617654442852394> I couldn\'t find any of the channels you sent.')

        const data = await setupData.findOne({ guild: message.guild.id })

        message.say('Alright! var\'s set me up! First, what channel you want the audit logs to be sent? Type **`cancel`** to at any time to cancel creation.\n`Please type the name, mention or ID of a channel in this server.`')

        var logsChannel, mutedRole, memberRole, botRole, answered, counter = 1, lockChannels = []

        const collector = message.channel.createMessageCollector(msg => msg.author.id === message.author.id, { max: 6, time: 300000 })
        collector.on('collect', /** @param {CommandoMessage} msg */ async msg => {
            if (msg.content.toLowerCase() === 'cancel') return message.say('Setup has been cancelled.'), answered = true, collector.stop()

            if (counter === 1) { // Audit-logs channel
                logsChannel = msg.mentions.channels.first() || message.guild.channels.cache.get(msg.content) || message.guild.channels.cache.find(channel => channel.name.toLowerCase() === msg.content.toLowerCase())
                if (!logsChannel) return message.say(invalidCh), answered = true, collector.stop()
                message.say(`Neat! Your audit logs will be logged at ${logsChannel}! Next, what role you want me to assign when you mute people?\n\`Please type in the role's name, mention or ID. If you don't have any role created, just type 'create' without the quotes and I will create a role for you! (If there's already a role named 'Muted', it won't work)\``)
            }

            else if (counter === 2) { // Muted Role
                mutedRole = msg.mentions.roles.first() || message.guild.roles.cache.get(msg.content) || message.guild.roles.cache.find(role => role.name.toLowerCase() === msg.content.toLowerCase())

                if (msg.content === 'create') {
                    if (message.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted')) return message.say(alreadyCreated), answered = true, collector.stop()
                    mutedRole = await message.guild.roles.create({ data: { name: 'Muted', color: '#818386', permissions: 0 } })
                    message.guild.channels.cache.filter(ch => ch.type === 'category').each(channel => channel.updateOverwrite(mutedRole, { SEND_MESSAGES: false, ADD_REACTIONS: false, SPEAK: false }))
                    message.guild.channels.cache.filter(ch => ch.type === 'text').each(channel => channel.updateOverwrite(mutedRole, { SEND_MESSAGES: false, ADD_REACTIONS: false }))
                    message.guild.channels.cache.filter(ch => ch.type === 'voice').each(channel => channel.updateOverwrite(mutedRole, { SPEAK: false }))
                }

                if (!mutedRole || mutedRole.managed) return message.say(invalidRole), answered = true, collector.stop()
                message.say(`Awesome! I will use this role: \`${mutedRole.name}\`\nNext, what role you want me to assign when a new member joins?\n\`Please type in the role's name, mention or ID. If you don't have any role created, just type 'create' without the quotes and I will create a role for you! (If there's already a role named 'Member', it won't work)\``)
            }

            else if (counter === 3) { // Member Role
                memberRole = msg.mentions.roles.first() || message.guild.roles.cache.get(msg.content) || message.guild.roles.cache.find(role => role.name.toLowerCase() === msg.content.toLowerCase())

                if (msg.content === 'create') {
                    if (message.guild.roles.cache.find(role => role.name.toLowerCase() === 'member')) return message.say(alreadyCreated), answered = true, collector.stop()
                    memberRole = await message.guild.roles.create({ data: { name: 'Member' } })
                }

                if (!memberRole || memberRole.managed || isMod(memberRole)) return message.say(invalidRole), answered = true, collector.stop()
                message.say(`Great! I will use this role: \`${memberRole.name}\`\nNow, what role you want me to assign when a new bot joins?\n\`Please type in the role's name, mention or ID. If you don't have any role created, just type 'create' without the quotes and I will create a role for you! (If there's already a role named 'Bots', it won't work)\``)
            }

            else if (counter === 4) { // Bot Role
                botRole = msg.mentions.roles.first() || message.guild.roles.cache.get(msg.content) || message.guild.roles.cache.find(role => role.name.toLowerCase() === msg.content.toLowerCase())

                if (msg.content === 'create') {
                    if (message.guild.roles.cache.find(role => role.name.toLowerCase() === 'bots')) return message.say(alreadyCreated), answered = true, collector.stop()
                    botRole = await message.guild.roles.create({ data: { name: 'Bots', permissions: 8 } })
                }

                if (!botRole || botRole.managed) return message.say(invalidRole), answered = true, collector.stop()
                message.say(`Nice! I will use this role: \`${botRole.name}\`\nFinally, what channel do you want me to lock when you use the \`lockdown\` command?\n\`Please type in all the channels separated by spaces, they can be either the channel name, mention or ID. Channels where the 'Send Messages' or/and 'Speak' permissions are denied for @everyone will be filtered out!\``)
            }

            else if (counter === 5) { // Lockdown Channels
                lockChannels = msg.content.split(/ +/)
                lockChannels.forEach((channel, i) => lockChannels[i] = message.guild.channels.cache.get(channel.replace(/[^0-9]/g, '')) || message.guild.channels.cache.find(ch => ch.name.toLowerCase() === channel.toLowerCase()))
                lockChannels = lockChannels.filter(/** @param {GuildChannel} channel */(channel, i) => channel && lockChannels.indexOf(channel) === i && channel.type === 'text' && !channel.permissionOverwrites.find(perm => perm.id === message.guild.id).deny.has('SEND_MESSAGES'))
                if (lockChannels.length < 1) return message.say(noChannels), answered = true, collector.stop()
                message.say(`Perfect! This channels will be locked with the \`lockdown\` command: ${lockChannels.map(channel => channel).join(', ')}\nFinally, type \`confirm\` if this data is correct:\n\n**>** Audit Logs Channel: ${logsChannel}\n**>** Muted Role: \`${mutedRole.name}\`\n**>** Member Role: \`${memberRole.name}\`\n**>** Bot Role: \`${botRole.name}\`\n**>** Lockdown Channels: ${lockChannels.map(channel => channel).join(', ')}`)
            }

            else if (counter === 6) { // Confirmation
                if (msg.content.toLowerCase() !== 'confirm') return message.say('You didn\'t type \`confirm\`, setup has been cancelled.'), answered = true, collector.stop()
            }
            counter++
        })

        collector.on('end', async collected => {
            if (answered) return
            if (collected.size < 6) return message.say('You didn\'t answer in time, setup has been cancelled.')
            if (data) await data.updateOne({
                logsChannel: logsChannel.id,
                memberRole: memberRole.id,
                botRole: botRole.id,
                mutedRole: mutedRole.id,
                lockChannels: lockChannels.map(channel => channel.id)
            })
            else await new setupData({
                guild: message.guild.id,
                logsChannel: logsChannel.id,
                memberRole: memberRole.id,
                botRole: botRole.id,
                mutedRole: mutedRole.id,
                lockChannels: lockChannels.map(channel => channel.id)
            }).save()
            message.say('Bot setup completed!')
        })
    }
}