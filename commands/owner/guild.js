const { stripIndent } = require('common-tags')
const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, sleep } = require('../../utils')

/** A command that can be run in a client */
module.exports = class guildCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'guild',
            group: 'owner',
            description: 'Displays information about a single guild, or you can get the invite, and also remove the bot from one.',
            format: stripIndent`
                guild info [id] - Get information of a guild.
                guild invite [id] - Get the invite of a guild.
                guild remove [id] - Remove the bot from a guild.
            `,
            ownerOnly: true,
            dmOnly: true,
            args: [
                {
                    key: 'subCommand',
                    prompt: 'What sub-command do you want to use?',
                    type: 'string',
                    oneOf: ['info', 'invite', 'remove']
                },
                {
                    key: 'guildId',
                    prompt: 'What is the Id or name of the guild?',
                    type: 'string'
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.subCommand The sub-command
     * @param {string} args.guildId The guild Id or name
     */
    async run(message, { subCommand, guildId }) {
        const guilds = this.client.guilds.cache
        const guild = guilds.get(guildId) || guilds.find(({ name }) => name.toLowerCase() === guildId.toLowerCase())
        if (!guild) return message.reply(basicEmbed('red', 'cross', 'I couldn\'t find that guild.'))

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

            return message.reply(basicEmbed('#4c9f4c', '', `You can join **${guild.name}** using [this link](${invite.toString()}).`))
        }

        const msg = await message.reply(basicEmbed('gold', '⚠', stripIndent`
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

            if (!emoji) return message.reply(basicEmbed('red', 'cross', 'You didn\'t confirm in time.'))
            if (emoji === 'cross') return message.reply(basicEmbed('green', 'check', 'The bot won\'t be removed from the guild.'))

            await guildOwner.send(basicEmbed('#4c9f4c', '', `Dear owner of ${guild.name}`, stripIndent`
                The owner of this bot, ${botOwner.toString()}, has decided to remove the bot from your server.
                If you want to know more information, such as the reason behind this, please contact him.

                **The bot will be removed from your server in 30 seconds.**
            `))

            const toEdit = await message.reply(basicEmbed('gold', 'loading', `The bot will be removed from **${guild.name}** in 30 seconds, please wait...`))

            await sleep(30)

            await guild.leave()
            await toEdit.edit(basicEmbed('green', 'check', `The bot has been removed from **${guild.name}.**`))
        })
    }
}