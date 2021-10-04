const { CommandoClient } = require('../command-handler/typings')
const { isAsyncFunction } = require('util/types')
const path = require('path')

/**
 * Handler function for every module.
 * @param {CommandoClient} client The client these handlers are for
 * @param {string[]} exclude The modules to exclude when loading the event handlers
 */
module.exports = async (client, ...exclude) => {
    client.emit('debug', 'Loading event handlers...')

    const test = require('require-all')(path.join(__dirname))
    for (const folder of Object.values(test)) {
        if (typeof folder !== 'object') continue

        for (const file in folder) {
            if (exclude.includes(file)) continue

            const func = folder[file]
            if (isAsyncFunction(func)) await func(client)
            else func(client)
        }
    }

    client.emit('debug', 'Loaded all event handlers')
}