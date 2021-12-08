/* eslint-disable no-unused-vars */
const { CommandoClient } = require('../command-handler/typings')
const { CommandInstances, Command } = require('../command-handler/typings')
const { MessageEmbed, TextChannel, Util, CommandInteractionOption } = require('discord.js')
const { customEmoji, docId, code, replyAll } = require('../utils/functions')
const { stripIndent } = require('common-tags')
/* eslint-enable no-unused-vars */

/**
 * A manager for all errors of the process and client
 * @param {CommandoClient} client The client instance
 */
module.exports = (client) => {
    client.on('commandError', async (command, error, { message, interaction }) => {
        const owner = client.owners[0]
        const { serverInvite } = client.options
        const id = docId()

        const reply = new MessageEmbed()
            .setColor('RED')
            .setDescription(stripIndent`
				${customEmoji('cross')} **An unexpected error happened**
				Please contact ${owner.toString()} (${owner.tag}) by joining the [support server](${serverInvite}).
			`)
            .addField('Please send this information as well', stripIndent`
                **Type:** ${error.name}
                **Error id:** ${id}
            `)

        await replyAll({ message, interaction }, reply)
        await errorHandler(error, 'Command error', { message, interaction }, command, id)
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
     * @param {CommandInstances} [instances] the command instances
     * @param {Command} [command] the command
     * @param {string} [id] the error id to use
     */
    async function errorHandler(error, type, { message, interaction }, command, id) {
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

            const { guild, channel } = (message || interaction) ?? {}
            const author = (message?.author || interaction.user) ?? null
            const url = message?.url ?? null

            let where = ''
            if (message || interaction) {
                if (guild) {
                    where = stripIndent`
                        At guild **${guild.name}** (${guild.id}), channel ${channel.toString()}.
                        ${url ? `Please go to [this message](${url}) for more information.` : ''}
                    `
                } else {
                    where = `In DMs with ${author.toString()} (${author.tag}).`
                }
            }
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
                let input = ''
                if (message) input = message.cleanContent
                else {
                    input = `/${command.name}`
                    /** @param {CommandInteractionOption} opt */
                    function concat(opt) {
                        if (opt.name && [undefined, null].includes(opt.value)) input += ` ${opt.name}`
                        else input += ` ${opt.name}: "${opt.value}"`
                        opt.options?.forEach(concat)
                    }
                    for (const option of interaction.options.data) concat(option)
                }
                embed.addField('Command input', code(Util.escapeMarkdown(input).substr(0, 1016), 'js'))
            }

            const msg = (error.name + whatCommand + ': ' + error.message).split('Require stack:').shift()
            embed.addField(msg, code(files || 'No files.'))

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
        } else {
            console.warn(error)

            const embed = new MessageEmbed()
                .setColor('RED')
                .setTitle(type)
                .setDescription(error)

            await errorsChannel.send({ embeds: [embed] })
        }
    }
}