/* eslint-disable no-unused-vars */
const { Collection } = require('discord.js')
const { capitalize } = require('lodash')
const { connect } = require('mongoose')
const requireAll = require('require-all')
const { CommandoClient } = require('../command-handler/typings')
const schemas = require('../schemas')
/* eslint-enable no-unused-vars */

/**
 * Removes dashes from the string and capitalizes the remaining strings
 * @param {string} str The string to parse
 */
function removeDashes(str) {
    if (!str) return
    const arr = str.split('-')
    const first = arr.shift()
    const rest = arr.map(capitalize).join('')
    return first + rest
}

/**
 * Handlers for the whole database of the client.
 * @param {CommandoClient} client The client these handlers are for
 * @param {string[]} exclude The modules to exclude when loading the event handlers
 */
module.exports = async (client, ...exclude) => {
    await connect(process.env.MONGO_PATH, { keepAlive: true })
    client.emit('debug', 'Established database connection')

    const { owners, database, databases, guilds } = client
    const owner = owners[0]

    // Caches all the database in memory
    const now1 = Date.now()
    client.emit('debug', 'Initializing database caching process')

    /** @type {Collection<string, Collection<string, object>>} */
    const data = new Collection()
    for (const schema of Object.values(schemas)) {
        const objs = await schema.find({})
        const name = removeDashes(schema.collection.name)
        const entries = objs.map(obj => ([`${obj._id}`, obj]))
        const coll = new Collection(entries)
        data.set(name, coll)
    }

    const clientData = data.mapValues(coll => coll.filter(doc => typeof doc.guild !== 'string'))
    database.init(clientData)

    for (const guild of guilds.cache.toJSON()) {
        const guildData = data.mapValues(coll => coll.filter(doc => doc.guild === guild.id))
        guild.database.init(guildData)
        databases.set(guild.id, guild.database)
    }
    client.emit('debug', 'Database caching process finished')

    const time1 = (Date.now() - now1).toLocaleString()
    await owner.send(`**Debug message:** Finished database caching (\`${time1}ms\`).`)

    // Loads all the bot's features
    const now2 = Date.now()
    client.emit('debug', 'Loading client features')

    const features = requireAll(__dirname)
    for (const folderName of Object.keys(features)) {
        const folder = features[folderName]
        if (typeof folder !== 'object') continue
        for (const fileName in folder) {
            if (exclude.includes(fileName)) continue
            const file = folder[fileName]
            await file(client)
            client.emit('debug', `Loaded feature ${folderName}/${fileName}`)
        }
    }
    client.emit('debug', 'Loaded client features')

    const time2 = (Date.now() - now2).toLocaleString()
    await owner.send(`**Debug message:** Loaded all features (\`${time2}ms\`).`)
}
