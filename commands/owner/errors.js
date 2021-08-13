const { Command, CommandoMessage } = require('discord.js-commando')
const { basicEmbed, generateEmbed } = require('../../utils/functions')
const { errors: errorDocs } = require('../../utils/mongo/schemas')

module.exports = class errors extends Command {
    constructor(client) {
        super(client, {
            name: 'errors',
            aliases: ['bugs'],
            group: 'owner',
            memberName: 'errors',
            description: 'Displays all the errors that have happened in the bot.',
            ownerOnly: true,
            args: [
                {
                    key: 'subCommand',
                    prompt: 'Do you want to filter or remove an error/bug?',
                    type: 'string',
                    oneOf: ['filter', 'remove'],
                    default: ''
                },
                {
                    key: 'filter',
                    prompt: 'What kind of errors do you want to filter? Or what specific error do you want to remove?',
                    type: 'string',
                    default: ''
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
     * @param {string} args.filter The filter to apply or the error to remove
     */
    async run(message, { subCommand, filter }) {
        if (message.channel.type !== 'dm') return message.say(basicEmbed('red', 'cross', 'This command can only be used in DMs.'))

        const Errors = await errorDocs.find({})
        const errorsList = Errors.map(val => {
            delete val.__v
            delete val.updatedAt

            const whatCommand = val.command ? ` at '${val.command}' command` : ''

            const error = {
                _id: val._id,
                /** @type {string} */
                type: val.type,
                message: val.name + whatCommand + ': ' + '``' + val.message + '``',
                /** @type {Date} */
                createdAt: val.createdAt,
                /** @type {string} */
                files: val.files
            }

            return error
        })

        if (errorsList.length === 0) return message.say(basicEmbed('blue', 'info', 'There have been no errors or bugs lately.'))

        const displayData = {
            number: 3,
            authorName: 'Errors and bugs list',
            authorIconURL: this.client.user.displayAvatarURL({ dynamic: true }),
            title: ' |  ID:',
            keyTitle: { prefix: 'type' },
            keysExclude: ['type', '_id'],
            useDocID: true
        }

        if (!subCommand) return await generateEmbed(message, errorsList, displayData)

        if (subCommand.toLowerCase() === 'filter') {
            if (!filter) return message.say(basicEmbed('red', 'cross', 'Please specify the filter to use.'))

            const filtered = errorsList.filter(({ type }) => type === filter)
            if (filtered.length === 0) return message.say(basicEmbed('blue', 'info', 'There are no errors matching the filter.'))

            return await generateEmbed(message, filtered, displayData)
        }

        if (!filter) return message.say(basicEmbed('red', 'cross', 'Please specify the error to remove.'))

        const error = Errors.find(({ _id }) => _id === filter)
        if (!error) return message.say(basicEmbed('red', 'cross', 'I couldn\'t find the error you were looking for.'))

        await error.deleteOne()

        message.say(basicEmbed('green', 'check', `Error with ID \`${error._id}\` has been successfully removed.`))
    }
}