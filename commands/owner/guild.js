/* eslint-disable indent */
/* eslint-disable no-unused-vars */
const { stripIndent, oneLine } = require('common-tags')
const { TextChannel, Invite, Collection } = require('discord.js')
const { Command } = require('../../command-handler')
const { CommandoMessage, CommandoGuild } = require('../../command-handler/typings')
const { basicEmbed, getArgument, embedColor, inviteButton, confirmButtons } = require('../../utils')
/* eslint-enable no-unused-vars */

/** A command that can be run in a client */
module.exports = class GuildCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'guild',
            group: 'owner',
            description: oneLine`
                Displays information about a single guild, or you can get the invite, and also remove the bot from one.
            `,
            format: stripIndent`
                guild info [guild] - Get information of a guild.
                guild invite [guild] - Get the invite of a guild.
                guild remove [guild] <reason> - Remove the bot from a guild.
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
                    label: 'guild id or name',
                    prompt: 'What is the id or name of the guild?',
                    type: 'string'
                },
                {
                    key: 'reason',
                    prompt: 'Why is the bot leaving that guild?',
                    type: 'string',
                    required: false
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandInstances} instances The instances the command is being run for
     * @param {object} args The arguments for the command
     * @param {'info'|'invite'|'remove'} args.subCommand The sub-command
     * @param {string} args.guildId The guild's id or name
     * @param {string} args.reason Why the bot is leaving such guild
     */
    async run({ message }, { subCommand, guildId, reason }) {
        subCommand = subCommand.toLowerCase()
        guildId = guildId.toLowerCase()

        const guilds = this.client.guilds.cache
        const find = val => g => g.name.toLowerCase() === val || g.name.toLowerCase().includes(val)
        let guild = guilds.get(guildId) || guilds.find(find(guildId))

        if (message) {
            while (!guild || !guild._commando) {
                const { value, cancelled } = await getArgument(message, this.argsCollector.args[1])
                if (cancelled) return
                guild = guilds.get(value) || guilds.find(find(value))
            }
        }

        switch (subCommand) {
            case 'info':
                return await this.info(message, guild)
            case 'invite':
                return await this.invite(message, guild)
            case 'remove':
                return await this.remove(message, guild, reason)
        }
    }

    /**
     * The `info` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {CommandoGuild} guild The guild to get information from
     */
    async info(message, guild) {
        const serverInfo = this.client.registry.resolveCommand('server-info')
        const embed = await serverInfo.run({ message }, guild)
        await message.replyEmbed(embed)
    }

    /**
     * The `invite` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {CommandoGuild} guild The guild to get invite from
     */
    async invite(message, guild) {
        /** @type {TextChannel} */
        const channel = guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT').first()
        /** @type {Collection<string, Invite>} */
        const invites = await guild.invites.fetch().catch(() => null)
        const invite = invites?.first() || await channel.createInvite({ maxUses: 1 })

        await message.reply({
            content: `Click the button bellow to join **${guild.name}**`,
            components: [inviteButton(invite)]
        })
    }

    /**
     * The `remove` sub-command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {CommandoGuild} guild The guild to remove from the bot
     * @param {string} reason Why the bot is leaving such guild
     */
    async remove(message, guild, reason) {
        const guildOwner = await guild.fetchOwner()
        const botOwner = this.client.owners[0]

        const confirmed = await confirmButtons(
            message, 'remove guild', guild, { reason: reason || 'No reason given.' }
        )
        if (!confirmed) return

        await guildOwner.send({
            embeds: [basicEmbed({
                color: embedColor,
                fieldName: `Dear owner of ${guild.name}`,
                fieldValue: stripIndent`
                    The owner of this bot, ${botOwner.toString()}, has decided to remove the bot from your server.
                    ${(reason ? `**Reason:** ${reason}\n` : '') +
                    'If you want to know more information please contact him.'}

                    **The bot will be removed from your server in 30 seconds.**
                `
            })]
        })

        await guild.leave()
        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: `The bot has been removed from **${guild.name}.**`
        }))
    }
}