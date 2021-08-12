const { stripIndent } = require('common-tags')
const { Command, CommandoMessage } = require('discord.js-commando')
const { basicEmbed, sleep } = require('../../utils/functions')

module.exports = class guild extends Command {
    constructor(client) {
        super(client, {
            name: 'guild',
            group: 'owner',
            memberName: 'guild',
            description: 'Displays information about a single guild, or you can get the invite, and also remove the bot from one.',
            format: stripIndent`
                guild info [id] - Get information of a guild.
                guild invite [id] - Get the invite of a guild.
                guild remove [id] - Remove the bot from a guild.
            `,
            ownerOnly: true,
            args: [
                {
                    key: 'subCommand',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['info', 'invite', 'remove']
                },
                {
                    key: 'guildID',
                    prompt: 'What is the ID or name of the guild?',
                    type: 'string'
                }
            ]
        })
    }

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
     * @param {string} args.subCommand The sub-command
     * @param {string} args.guildID The guild ID or name
     */
    async run(message, { subCommand, guildID }) {
        if (message.channel.type !== 'dm') return message.say(basicEmbed('red', 'cross', 'This command can only be used on DMs.'))

        const guilds = this.client.guilds.cache
        const guild = guilds.get(guildID) || guilds.find(({ name }) => name.toLowerCase() === guildID.toLowerCase())
        if (!guild) return message.say(basicEmbed('red', 'cross', 'I couldn\'t find that guild.'))

        const guildOwner = guild.owner.user
        const botOwner = this.client.owners[0]
        const channel = guild.channels.cache.filter(({ type }) => type === 'text').first()

        if (subCommand.toLowerCase() === 'info') {
            const serverInfo = this.client.registry.commands.get('serverinfo')
            return await serverInfo.run(message, guild)
        }

        if (subCommand.toLowerCase() === 'invite') {
            const invites = await guild.fetchInvites().catch(() => null)
            const invite = invites?.first() || await channel.createInvite({ maxUses: 1 })

            return message.say(basicEmbed('#4c9f4c', '', `You can join **${guild.name}** using [this link](${invite.toString()}).`))
        }

        const msg = await message.say(basicEmbed('gold', '⚠', stripIndent`
            Are you sure you want to remove the bot from **${guild.name}**?
            You have 30 seconds to confirm...
        `))

        await msg.react('863118691808706580')
        await msg.react('863118691917889556')

        const collector = msg.createReactionCollector(({ emoji }, user) => {
            return ['863118691808706580', '863118691917889556'].includes(emoji.id) && user.id === message.author.id
        }, { time: 30 * 1000, max: 1 })

        collector.on('end', async collected => {
            await msg.delete()
            const emoji = collected.first()?.emoji.name

            if (!emoji) return message.say(basicEmbed('red', 'cross', 'You didn\'t confirm in time.'))
            if (emoji === 'cross') return message.say(basicEmbed('green', 'check', 'The bot won\'t be removed from the guild.'))

            await guildOwner.send(basicEmbed('#4c9f4c', '', `Dear owner of ${guild.name}`, stripIndent`
                The owner of this bot, ${botOwner.toString()}, has decided to remove the bot from your server.
                If you want to know more information, such as the reason behind this, please contact him.

                **The bot will be removed from your server in 30 seconds.**
            `))

            const toEdit = await message.say(basicEmbed('gold', 'loading', `The bot will be removed from **${guild.name}** in 30 seconds, please wait...`))

            await sleep(30)

            await guild.leave()
            await toEdit.edit(basicEmbed('green', 'check', `The bot has been removed from **${guild.name}.**`))
        })
    }
}