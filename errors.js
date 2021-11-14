const { CommandoClient } = require('./command-handler/typings')
const { CommandoMessage, Command } = require('./command-handler/typings')
const { MessageEmbed, TextChannel, Util } = require('discord.js')
const { customEmoji, docId, code } = require('./utils')
const { stripIndent } = require('common-tags')

/**
 * A manager for all errors of the process and client
 * @param {CommandoClient} client The client instance
 */
module.exports = (client) => {
    client.on('commandError', async (command, error, message) => {
        const owner = client.owners[0]
        const { serverInvite } = client.options
        const id = docId()

        const reply = new MessageEmbed()
            .setColor('RED')
            .setDescription(stripIndent`
				${customEmoji('cross')} **An unexpected error happened**
				Please contact ${owner.toString()} (${owner.tag}), or join the [support server](${serverInvite}).
			`)
            .addField('Please send this information as well', stripIndent`
                **Type:** ${error.name}
                **Error id:** ${id}
            `)

        await message.replyEmbed(reply)
        await errorHandler(error, 'Command error', message, command, id)
    })
        .on('error', error => errorHandler(error, 'Client error'))
        .on('warn', warn => errorHandler(warn, 'Client warn'))
        .on('invalidated', () => {
            client.emit('debug', 'The client\'s session has become invalidated, restarting the bot...')
            process.exit(1)
        })

    process.on('unhandledRejection', error => errorHandler(error, 'Unhandled rejection'))
        .on('uncaughtException', error => errorHandler(error, 'Uncaught exception'))
        .on('uncaughtExceptionMonitor', error => errorHandler(error, 'Uncaught exception monitor'))
        .on('warning', error => errorHandler(error, 'Process warning'))

    /**
     * sends the error message to the bot owner
     * @param {Error|string} error the error
     * @param {string} type the type of error
     * @param {CommandoMessage} [message] the message
     * @param {Command} [command] the command
     * @param {string} [id] the error id to use
     */
    async function errorHandler(error, type, message, command, id) {
        if (error instanceof Error) {
            if (command?.name === 'eval') return
            console.error(error)

            /** @type {TextChannel} */
            const errorsChannel = await client.channels.fetch('906740370304540702').catch(() => null)
            if (!errorsChannel) return

            const lentgh = error.name.length + error.message.length + 3
            const stack = error.stack?.substr(lentgh).replace(/ +/g, ' ').split('\n')
            const root = __dirname.split(/[\\/]/g).pop()

            const files = stack.filter(str =>
                !str.includes('node_modules') &&
                !str.includes('(internal') &&
                !str.includes('(<anonymous>)') &&
                str.includes(root)
            ).map(str =>
                '>' + str.replace('at ', '')
                    .replace(__dirname, root)
                    .replace(/([\\]+)/g, '/')
            ).join('\n')

            const { guild, channel, url, author } = message ?? {}
            const where = message ? (
                guild ? stripIndent`
                At guild **${guild.name}** (${guild.id}), channel ${channel.toString()}.
                Please go to [this message](${url}) for more information.
            ` : `In DMs with ${author.toString()} (${author.tag}).`
            ) : ''
            const whatCommand = command ? ` at '${command.name}' command` : ''

            id ??= docId()

            const embed = new MessageEmbed()
                .setColor('RED')
                .setTitle(`${type}: \`${id}\``)
                .setDescription(stripIndent`
                ${customEmoji('cross')} **An unexpected error happened**
                ${where}
            `)

            if (command) {
                embed.addField('Command input', code(Util.escapeMarkdown(message.content).substr(0, 1018)))
            }

            embed.addField(error.name + whatCommand + ': ' + error.message, code(files || 'No files.'))

            await errorsChannel.send({ content: client.owners[0].toString(), embeds: [embed] })

            if (!files) return

            await client.database.errors.add({
                _id: id,
                type: type,
                name: error.name,
                message: error.message,
                command: command?.name,
                files: code(files)
            })
        }

        else {
            console.warn(error)

            const embed = new MessageEmbed()
                .setColor('RED')
                .setTitle(type)
                .setDescription(error)

            await channel.send({ embeds: [embed] })
        }
    }
}