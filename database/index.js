/* eslint-disable no-unused-vars */
const { Collection } = require('discord.js')
const { connect } = require('mongoose')
const { isAsyncFunction } = require('util/types')
const { CommandoClient } = require('../command-handler/typings')
const schemas = require('../schemas')
const { myMs, removeDashes } = require('../utils')
/* eslint-enable no-unused-vars */

/**
 * Handlers for the whole database of the client.
 * @param {CommandoClient} client The client these handlers are for
 * @param {string[]} exclude The modules to exclude when loading the event handlers
 */
module.exports = async (client, ...exclude) => {
    await connect(process.env.MONGO_PATH, {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    client.emit('debug', 'Established database connection')

    // Caches all the database in memory
    const now1 = Date.now()
    client.emit('debug', 'Initializing database caching process for all guilds')

    /** @type {Collection<string, Collection<string, object>>} */
    const data = new Collection()
    for (const schema of Object.values(schemas)) {
        const objs = await schema.find({})
        const name = removeDashes(schema.collection.name)
        const collect = new Collection(objs.map(obj => ([`${obj._id}`, obj])))
        data.set(name, collect)
    }

    const forClient = data.mapValues(arr => arr.filter(doc => typeof doc.guild !== 'string'))
    client.database.init(forClient)

    for (const [, guild] of client.guilds.cache) {
        const filtered = data.mapValues(arr => arr.filter(doc => doc.guild === guild.id))
        guild.database.init(filtered)
        client.databases.set(guild.id, guild.database)
    }

    client.emit('debug', 'Caching process has finished for all guilds')
    const end1 = Date.now()
    const time1 = myMs(end1 - now1, { showMs: true, noCommas: true })
    await client.owners[0].send(`**Debug message:** Finished database caching (took \`${time1}\`).`)

    // Loads all the bot's features
    const now2 = Date.now()
    client.emit('debug', 'Loading client features')

    const features = require('require-all')(__dirname)
    for (const folderName of Object.keys(features)) {
        const folder = features[folderName]
        if (typeof folder !== 'object') continue
        for (const fileName in folder) {
            if (exclude.includes(fileName)) continue
            const func = folder[fileName]
            if (isAsyncFunction(func)) await func(client)
            else func(client)
            client.emit('debug', `Loaded feature ${folderName}/${fileName}`)
        }
    }
    client.emit('debug', 'Loaded client features')
    const end2 = Date.now()
    const time2 = myMs(end2 - now2, { showMs: true, noCommas: true })
    await client.owners[0].send(`**Debug message:** Loaded all features (took \`${time2}\`).`)
}