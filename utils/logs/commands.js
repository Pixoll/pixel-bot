const { stripIndent } = require('common-tags')
const { MessageEmbed } = require('discord.js')
const { CommandoClient, CommandoMessage } = require('discord.js-commando')
const { sliceDots, moduleStatus, fetchPartial, getLogsChannel } = require('../functions')
const { setup, modules } = require('../mongodb-schemas')

/**
 * Handles all of the command logs.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('message', async _message => {
        /** @type {CommandoMessage} */
        const message = await fetchPartial(_message)

        const { guild, author, isCommand, command, channel, content, id, url } = message
        const isModCommand = !!command?.userPermissions || command?.ownerOnly || command?.name === 'prefix'

        if (!guild || author.bot || !isCommand || command?.hidden || !isModCommand) return

        const status = await moduleStatus(modules, guild, 'auditLogs', 'commands')
        if (!status) return

        const logsChannel = await getLogsChannel(setup, guild)
        if (!logsChannel) return

        const _content = sliceDots(content, 1024)

        const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor(`Used ${command.name} command`, author.displayAvatarURL({ dynamic: true }))
            .setDescription(stripIndent`
                **>** **User:** ${author.toString()} ${author.tag}
                **>** **Channel:** ${channel.toString()} ${channel.name}
                **>** **Link:** [Click here](${url})
            `)
            .addField('Message', _content)
            .setFooter(stripIndent`
                Author ID: ${author.id}
                Message ID: ${id}
            `)
            .setTimestamp()

        logsChannel.send(embed)
    })
}