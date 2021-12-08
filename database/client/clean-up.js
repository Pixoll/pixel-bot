/* eslint-disable no-unused-vars */
const { Document } = require('mongoose')
const { CommandoClient, CommandoGuild } = require('../../command-handler/typings')
const { active, afk, mcIp, modules, moderations, polls, reactionRoles, rules, stickyRoles } = require('../../schemas')
/* eslint-enable no-unused-vars */

const today = new Date().getUTCDate()

/**
 * Clean-up function for the database.
 * @param {CommandoClient} client The client instance.
 * @param {boolean} [forceCleanup] Whether to force the clean-up or not.
 */
module.exports = async (client, forceCleanup = false) => {
    client.on('guildDelete', /** @param {CommandoGuild} guild */ async guild => {
        client.emit('debug', 'Running event "client/clean-up".')

        const {
            active, afk, disabled, mcIps, moderations, modules, polls, prefixes, reactionRoles, rules, setup, stickyRoles,
            welcome
        } = guild.database

        // Fetches multiple documents at once
        const activeDocs = await active.fetchMany()
        const afkDocs = await afk.fetchMany()
        const modDocs = await moderations.fetchMany()
        const pollsDocs = await polls.fetchMany()
        const rRolesDocs = await reactionRoles.fetchMany()
        const stickyRolesDocs = await stickyRoles.fetchMany()

        // Fetches single documents
        const disabledDoc = await disabled.fetch()
        const mcIpsDoc = await mcIps.fetch()
        const modulesDoc = await modules.fetch()
        const prefixesDoc = await prefixes.fetch()
        const rulesDoc = await rules.fetch()
        const setupDoc = await setup.fetch()
        const welcomeDoc = await welcome.fetch()

        // Deletes multiple documents
        for (const doc of activeDocs.toJSON()) await active.delete(doc)
        for (const doc of afkDocs.toJSON()) await afk.delete(doc)
        for (const doc of modDocs.toJSON()) await moderations.delete(doc)
        for (const doc of pollsDocs.toJSON()) await polls.delete(doc)
        for (const doc of rRolesDocs.toJSON()) await reactionRoles.delete(doc)
        for (const doc of stickyRolesDocs.toJSON()) await stickyRoles.delete(doc)

        // Deletes single documents
        if (disabledDoc) await disabled.delete(disabledDoc)
        if (mcIpsDoc) await mcIps.delete(mcIpsDoc)
        if (modulesDoc) await modules.delete(modulesDoc)
        if (prefixesDoc) await prefixes.delete(prefixesDoc)
        if (rulesDoc) await rules.delete(rulesDoc)
        if (setupDoc) await setup.delete(setupDoc)
        if (welcomeDoc) await welcome.delete(welcomeDoc)
    })

    // Monthly clean-up
    if (forceCleanup || today === 1) {
        client.emit('debug', 'Cleaning up database...')

        const guilds = client.guilds.cache.map(d => d.id)
        const filter = doc => !guilds.includes(doc.guild)

        /** @type {Document[]} */
        const Active = await active.find({})
        /** @type {Document[]} */
        const Afk = await afk.find({})
        /** @type {Document[]} */
        const McIp = await mcIp.find({})
        /** @type {Document[]} */
        const Modules = await modules.find({})
        /** @type {Document[]} */
        const Moderations = await moderations.find({})
        /** @type {Document[]} */
        const Polls = await polls.find({})
        /** @type {Document[]} */
        const ReactionRoles = await reactionRoles.find({})
        /** @type {Document[]} */
        const Rules = await rules.find({})
        /** @type {Document[]} */
        const StickyRoles = await stickyRoles.find({})

        const notActive = Active.filter(filter)
        const notAfk = Afk.filter(filter)
        const notMcIp = McIp.filter(filter)
        const notModules = Modules.filter(filter)
        const notModerations = Moderations.filter(filter)
        const notPolls = Polls.filter(filter)
        const notReactionRoles = ReactionRoles.filter(filter)
        const notRules = Rules.filter(filter)
        const notStickyRoles = StickyRoles.filter(filter)

        for (const doc of notActive) await doc.deleteOne()
        for (const doc of notAfk) await doc.deleteOne()
        for (const doc of notMcIp) await doc.deleteOne()
        for (const doc of notModules) await doc.deleteOne()
        for (const doc of notModerations) await doc.deleteOne()
        for (const doc of notPolls) await doc.deleteOne()
        for (const doc of notReactionRoles) await doc.deleteOne()
        for (const doc of notRules) await doc.deleteOne()
        for (const doc of notStickyRoles) await doc.deleteOne()

        client.emit('debug', 'Cleaned up database')
    }
}