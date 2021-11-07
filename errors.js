const { CommandoClient } = require('./command-handler/typings');

/**
 * A manager for all errors of the process and client
 * @param {CommandoClient} client The client instance
 */
module.exports = async (client) => {
    const { CommandoMessage, Command } = require('./command-handler/typings')
    const CommandoClient = require('./command-handler/client')
    const { MessageEmbed, TextChannel, Util } = require('discord.js')
    const { customEmoji, docId, code, timestamp } = require('./utils')
    const { stripIndent, oneLine } = require('common-tags')

    client.on('rateLimit', async data => {
        const { route, path, method, limit, timeout, global } = data

        const isMessageCooldown = !!route.match(/\/channels\/\d{18}\/messages/)?.map(m => m)[0]
        const isPost = method === 'post'

        if (global) {
            console.log('rateLimit >', data)
            if (isPost && isMessageCooldown) return

            /** @type {TextChannel} */
            const errorsChannel = await client.channels.fetch('906740370304540702')

            const embed = new MessageEmbed()
                .setColor('GOLD')
                .setTitle('Global rate limit reached')
                .setDescription(oneLine`
                    Reached limit of \`${limit}\`. Timeout ${timestamp(Date.now() + timeout)}.
                `)
                .addField('Information', stripIndent`
                    **Path:** ${path}
                    **Route:** ${route}
                    **Method:** ${method}
                `)
                .setTimestamp()

            return await errorsChannel.send({ content: client.owners[0].toString(), embeds: [embed] })
        }
        const isTypingCooldown = !!route.match(/\/channels\/\d{18}\/typing/)?.map(m => m)[0] && isPost
        if (isMessageCooldown || isTypingCooldown) return
        console.log('rateLimit >', data)
    })

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
        /** @type {TextChannel} */
        const errorsChannel = await client.channels.fetch('906740370304540702')

        if (error instanceof Error) {
            if (command?.name === 'eval') return
            console.error(error)

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