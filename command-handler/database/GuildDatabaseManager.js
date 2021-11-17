/* eslint-disable no-unused-vars */
const { Collection } = require('discord.js')
const { CommandoGuild, CommandoClient } = require('../typings')
const DatabaseManager = require('./DatabaseManager')
const schemas = require('../../schemas')
/* eslint-enable no-unused-vars */

/** All guilds' database manager (MongoDB) */
class GuildDatabaseManager {
    /**
     * @param {CommandoClient} client The client this database is for
     * @param {CommandoGuild} guild The guild this database is for
     */
    constructor(client, guild) {
        /**
         * Client for this database
         * @type {CommandoClient}
         * @readonly
         */
        this.client = client

        /**
         * Guild for this database
         * @type {CommandoGuild}
         * @readonly
         */
        this.guild = guild

        /** @type {DatabaseManager} */
        this.active = new DatabaseManager(client, guild, schemas.active)
        /** @type {DatabaseManager} */
        this.afk = new DatabaseManager(client, guild, schemas.afk)
        /** @type {DatabaseManager} */
        this.disabled = new DatabaseManager(client, guild, schemas.disabled)
        /** @type {DatabaseManager} */
        this.mcIps = new DatabaseManager(client, guild, schemas.mcIp)
        /** @type {DatabaseManager} */
        this.moderations = new DatabaseManager(client, guild, schemas.moderations)
        /** @type {DatabaseManager} */
        this.modules = new DatabaseManager(client, guild, schemas.modules)
        /** @type {DatabaseManager} */
        this.prefixes = new DatabaseManager(client, guild, schemas.prefixes)
        /** @type {DatabaseManager} */
        this.polls = new DatabaseManager(client, guild, schemas.polls)
        /** @type {DatabaseManager} */
        this.reactionRoles = new DatabaseManager(client, guild, schemas.reactionRoles)
        /** @type {DatabaseManager} */
        this.rules = new DatabaseManager(client, guild, schemas.rules)
        /** @type {DatabaseManager} */
        this.setup = new DatabaseManager(client, guild, schemas.setup)
        /** @type {DatabaseManager} */
        this.stickyRoles = new DatabaseManager(client, guild, schemas.stickyRoles)
        /** @type {DatabaseManager} */
        this.welcome = new DatabaseManager(client, guild, schemas.welcome)
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
        this.client.emit('debug', `Caching process has finished for guild ${this.guild.id}`)
        return this
    }
}

module.exports = GuildDatabaseManager