const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { basicEmbed, generateEmbed } = require('../../utils')
const { errors: errorDocs } = require('../../mongo/schemas')

/** A command that can be run in a client */
module.exports = class ErrorsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'errors',
            aliases: ['bugs'],
            group: 'owner',
            description: 'Displays all the errors that have happened in the bot.',
            ownerOnly: true,
            dmOnly: true,
            args: [
                {
                    key: 'subCommand',
                    prompt: 'Do you want to filter or remove an error/bug?',
                    type: 'string',
                    oneOf: ['filter', 'remove'],
                    required: false
                },
                {
                    key: 'filter',
                    prompt: 'What kind of errors do you want to filter? Or what specific error do you want to remove?',
                    type: 'string',
                    required: false
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.subCommand The sub-command
     * @param {string} args.filter The filter to apply or the error to remove
     */
    async run(message, { subCommand, filter }) {
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

        if (errorsList.length === 0) {
            return await message.replyEmbed(basicEmbed({
                color: 'BLUE', emoji: 'info', description: 'There have been no errors or bugs lately.'
            }))
        }

        const displayData = {
            number: 3,
            authorName: 'Errors and bugs list',
            authorIconURL: this.client.user.displayAvatarURL({ dynamic: true }),
            title: ' |  Id:',
            keyTitle: { prefix: 'type' },
            keysExclude: ['type', '_id'],
            useDocId: true
        }

        if (!subCommand) {
            return await generateEmbed(message, errorsList, displayData)
        }

        if (subCommand.toLowerCase() === 'filter') {
            if (!filter) {
                return await message.replyEmbed(basicEmbed({
                    color: 'RED', emoji: 'cross', description: 'Please specify the filter to use.'
                }))
            }

            const filtered = errorsList.filter(({ type }) => type === filter)
            if (filtered.length === 0) {
                return await message.replyEmbed(basicEmbed({
                    color: 'BLUE', emoji: 'info', description: 'There are no errors matching the filter.'
                }))
            }

            return await generateEmbed(message, filtered, displayData)
        }

        if (!filter) {
            return await message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'Please specify the error to remove.'
            }))
        }

        const error = Errors.find(({ _id }) => _id === filter)
        if (!error) {
            return message.replyEmbed(basicEmbed({
                color: 'RED', emoji: 'cross', description: 'I couldn\'t find the error you were looking for.'
            }))
        }

        await error.deleteOne()

        await message.replyEmbed(basicEmbed({
            color: 'GREEN', emoji: 'check', description: `Error with Id \`${error._id}\` has been successfully removed.`
        }))
    }
}