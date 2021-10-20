const { Document } = require('mongoose')
const { CommandoClient, CommandoGuild } = require('../../command-handler/typings')
const { active, afk, mcIp, modules, moderations, polls, reactionRoles, rules, stickyRoles } = require('../../schemas')

/**
 * Handles database behaviour in guild events.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    client.on('guildCreate', /** @param {CommandoGuild} guild */ async guild => {
        const { database, id } = guild
        const document = modules.schema.obj
        document.guild = id

        for (const prop in document) {
            const val = document[prop]
            if (typeof val === 'object') {
                for (const _prop in val) document[prop][_prop] = true
            }
            if (typeof val === 'function') document[prop] = false
        }

        await database.modules.add(document)
    })

    const day = new Date().getUTCDate()

    if (day === 1) {
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