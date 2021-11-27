/* eslint-disable no-unused-vars */
const { Collection } = require('discord.js')
const isEqual = require('lodash.isequal')
const { Model } = require('mongoose')
const { CommandoGuild, CommandoClient, DataModel } = require('../typings')
/* eslint-enable no-unused-vars */

/** A database schema manager (MongoDB) */
class DatabaseManager {
    /**
     * @param {CommandoClient} client The client this manager is for
     * @param {CommandoGuild} guild The guild this manager is for
     * @param {Model<any, {}, {}>} schema The schema of this manager
     */
    constructor(client, guild, schema) {
        /**
         * Client for this database
         * @type {CommandoClient}
         * @readonly
         */
        this.client = client

        /**
         * Guild for this database
         * @type {?CommandoGuild}
         * @readonly
         */
        this.guild = guild || null

        /**
         * The name of the schema this manager is for
         * @type {DataModel}
         */
        this.schema = schema

        /**
         * The cache for this manager
         * @type {Collection<string, DataModel>}
         */
        this.cache = new Collection()
    }

    /**
     * Add a single document to the database, or updates it if there's an existing one
     * @param {object} doc The document to add
     */
    async add(doc) {
        if (typeof doc !== 'object') {
            throw new TypeError('doc must me an object')
        }
        if (this.guild) doc.guild ||= this.guild.id
        this.client.emit('debug', `Fetching document at "${this.constructor.name}#add".`)
        const existing = doc._id ? await this.schema.findById(`${doc._id}`) : await this.schema.findOne(doc)
        if (existing) {
            const updated = await this.update(existing, doc)
            return updated
        }
        this.client.emit('debug', `Adding document at "${this.constructor.name}#add".`)
        const added = await new this.schema(doc).save()
        this.cache.set(`${added._id}`, added)
        return added
    }

    /**
     * Delete a single document from the database
     * @param {object|string} doc The document to delete or its id
     */
    async delete(doc) {
        if (typeof doc !== 'string' && typeof doc !== 'object') {
            throw new TypeError('doc must me either an object or a document id.')
        }
        if (typeof doc === 'object' && !doc._id) {
            throw new RangeError('doc must have the _id property.')
        }
        if (typeof doc === 'string') {
            doc = await this.fetch(doc)
        }
        this.client.emit('debug', `Deleting document at "${this.constructor.name}#delete".`)
        this.cache.delete(`${doc._id}`)
        await doc.deleteOne()
        return doc
    }

    /**
     * Update a single document of the database
     * @param {object|string} toUpdate The document to update or its id
     * @param {object} options The options for this update
     * @returns The updated document
     */
    async update(toUpdate, options) {
        if (typeof toUpdate !== 'string' && typeof toUpdate !== 'object') {
            throw new TypeError('toUpdate must me either an object or a document id.')
        }
        if (typeof toUpdate === 'object' && !toUpdate._id) {
            throw new RangeError('toUpdate must have the _id property.')
        }
        if (typeof options !== 'object') {
            throw new TypeError('options must me an object.')
        }
        if (typeof toUpdate === 'string') {
            toUpdate = await this.fetch(toUpdate)
        }
        if (typeof toUpdate === 'undefined' || toUpdate === null) {
            throw new TypeError('toUpdate cannot be undefined or null.')
        }
        this.client.emit('debug', `Updating document at "${this.constructor.name}#update".`)
        await toUpdate.updateOne(options)
        const newDoc = await this.schema.findById(`${toUpdate._id}`)
        this.cache.set(`${newDoc._id}`, newDoc)
        return newDoc
    }

    /**
     * Fetch a single document
     * @param {string|object} [filter={}] The id or fetching filter for this document
     * @returns {Promise<?object>} The fetched document
     */
    async fetch(filter = {}) {
        this.client.emit('debug', `Fetching document at "${this.constructor.name}#fetch".`)
        if (typeof filter === 'string') {
            const existing = this.cache.get(filter)
            if (existing) return existing
            const data = await this.schema.findById(filter)
            if (data) this.cache.set(`${data._id}`, data)
            return data
        }

        if (this.cache.size === 0) return undefined

        if (this.guild) filter.guild ??= this.guild.id
        const existing = this.cache.find(docsFilter(filter))
        if (existing) return existing

        const doc = await this.schema.findOne(filter)
        if (doc) {
            this.cache.set(`${doc._id}`, doc)
            return doc
        }
        return null
    }

    /**
     * Fetch multiple documents
     * @param {object} [filter={}] The fetching filter for the documents
     * @returns {Promise<Collection<string, object>>} The fetched documents
     */
    async fetchMany(filter = {}) {
        this.client.emit('debug', `Fetching documents at "${this.constructor.name}#fetchMany".`)
        if (this.cache.size === 0) return this.cache

        if (this.guild) filter.guild ??= this.guild.id
        const filtered = this.cache.filter(docsFilter(filter))
        if (filtered.size !== 0) return filtered

        const data = await this.schema.find(filter)
        const fetched = new Collection()
        for (const doc of data) {
            if (!this.guild && doc.guild) continue
            if (!this.cache.get(`${doc._id}`)) {
                this.cache.set(`${doc._id}`, doc)
            }
            fetched.set(`${doc._id}`, doc)
        }
        return fetched
    }
}

module.exports = DatabaseManager

function docsFilter(filter) {
    return doc => {
        const objKeys = Object.keys(filter).length
        if (objKeys === 0) return true
        const found = []
        for (const p in filter) {
            found.push(isEqual(doc[p], filter[p]))
        }
        const matchesAll = found.filter(b => b === true).length === objKeys
        return matchesAll
    }
}