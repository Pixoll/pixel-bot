const { Command, CommandoMessage } = require('discord.js-commando')
const { generateEmbed, capitalize, basicEmbed } = require('../../utils/functions')
const Database = require('../../utils/mongo/schemas')

/** @param {string} val */
const format = val => val.replace(/[A-Z]/g, '-$&').toLocaleLowerCase()
/** @param {string} val */
const deFormat = val => {
    const index = val.indexOf('-')
    const char = val.charAt(index + 1).toUpperCase()
    const str = val.replace(/-[a-z]/, char)
    return str
}

module.exports = class database extends Command {
    constructor(client) {
        super(client, {
            name: 'database',
            aliases: ['db'],
            group: 'owner',
            memberName: 'database',
            description: 'Manage the database.',
            ownerOnly: true,
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

    onBlock() { return }
    onError() { return }

    /**
     * @param {CommandoMessage} message The message
     * @param {object} args The arguments
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

        if (array.length === 0) return message.say(basicEmbed('blue', 'info', `The ${DBname} collection is empty.`))

        await generateEmbed(message, array, {
            authorName: `Database: ${DBname}`,
            authorIconURL: this.client.user.displayAvatarURL({ dynamic: true }),
            title: 'Document',
            keysExclude: ['updatedAt']
        })
    }
}