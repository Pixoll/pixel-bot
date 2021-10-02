const Command = require('../../command-handler/commands/base')
const { CommandoMessage } = require('../../command-handler/typings')
const { generateEmbed, basicEmbed } = require('../../utils')
const Database = require('../../mongo/schemas')

/** @param {string} val */
const format = val => val.replace(/[A-Z]/g, '-$&').toLowerCase()
/** @param {string} val */
const deFormat = val => {
    const index = val.indexOf('-')
    const char = val.charAt(index + 1).toUpperCase()
    const str = val.replace(/-[a-z]/, char)
    return str
}

/** A command that can be run in a client */
module.exports = class databaseCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'database',
            aliases: ['db'],
            group: 'owner',
            description: 'Manage the database.',
            ownerOnly: true,
            dmOnly: true,
            args: [
                {
                    key: 'collection',
                    prompt: 'What collection do you want to manage?',
                    type: 'string',
                    oneOf: Object.keys(Database).map(format)
                }
            ]
        })
    }

    /**
     * Runs the command
     * @param {CommandoMessage} message The message the command is being run for
     * @param {object} args The arguments for the command
     * @param {string} args.collection The collection to manage
     */
    async run(message, { collection }) {
        const data = await Database[deFormat(collection)].find({})

        const array = Array(...data).map(({ _doc: val }) => {
            delete val._id
            delete val.__v
            if (val.updatedAt) delete val.updatedAt
            return val
        })

        const DBname = collection.replace('-', ' ').toUpperCase()

        if (array.length === 0) return message.reply({
            embeds: [
                basicEmbed('blue', 'info', `The ${DBname} collection is empty.`)
            ]
        })

        await generateEmbed(message, array, {
            authorName: `Database: ${DBname}`,
            authorIconURL: this.client.user.displayAvatarURL({ dynamic: true }),
            title: 'Document',
            keysExclude: ['updatedAt']
        })
    }
}