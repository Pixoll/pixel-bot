/* eslint-disable no-unused-vars */
const { Collection } = require('discord.js')
const { CommandoClient } = require('../typings')
const DatabaseManager = require('./DatabaseManager')
const schemas = require('../../schemas')
/* eslint-enable no-unused-vars */

/** The client's database manager (MongoDB) */
class ClientDatabaseManager {
    /**
     * @param {CommandoClient} client The client this database is for
     */
    constructor(client) {
        /**
         * Client for this database
         * @type {CommandoClient}
         * @readonly
         */
        this.client = client

        /** @type {DatabaseManager} */
        this.disabled = new DatabaseManager(client, null, schemas.disabled)
        /** @type {DatabaseManager} */
        this.errors = new DatabaseManager(client, null, schemas.errors)
        /** @type {DatabaseManager} */
        this.faq = new DatabaseManager(client, null, schemas.faq)
        /** @type {DatabaseManager} */
        this.prefixes = new DatabaseManager(client, null, schemas.prefixes)
        /** @type {DatabaseManager} */
        this.reminders = new DatabaseManager(client, null, schemas.reminders)
        /** @type {DatabaseManager} */
        this.todo = new DatabaseManager(client, null, schemas.todo)
    }

    /**
     * Initializes the caching of this guild's data
     * @param {Collection<string, Collection<string, object>>} data The data to assignate to the guild
     * @private
     */
    init(data) {
        for (const [name, schema] of data) {
            if (!this[name]) continue
            this[name].cache = schema
        }
        this.client.emit('debug', 'Caching process has finished for the client')
        return this
    }
}

module.exports = ClientDatabaseManager