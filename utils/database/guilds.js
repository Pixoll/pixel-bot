const { CommandoClient } = require('discord.js-commando')
const { active, afk, disabled, mcIP, modules, prefixes, polls, reactionRoles, rules, setup, stickyRoles, welcome } = require('../mongo/schemas')

/**
 * Handles database behaviour in guild events.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildCreate', async ({ id }) => {
        const data = await modules.findOne({ guild: id })

        const document = modules.schema.obj
        document.guild = id

        for (const prop in document) {
            const val = document[prop]

            if (typeof val === 'object') {
                for (const _prop in val) document[prop][_prop] = true
            }

            if (typeof val === 'function') document[prop] = false
        }

        if (!data) new modules(document).save()
        else await data.updateOne(document)
    })

    const day = new Date().getUTCDate()

    if (day === 1) {
        const guilds = client.guilds.cache.map(({ id }) => id)
        const filter = ({ guild }) => !guilds.includes(guild)

        async function fixGuildsData() {
            const Active = await active.find({})
            const Afk = await afk.find({})
            const Disabled = await disabled.find({})
            const McIP = await mcIP.find({})
            const Modules = await modules.find({})
            const Prefix = await prefixes.find({})
            const Polls = await polls.find({})
            const ReactionRoles = await reactionRoles.find({})
            const Rules = await rules.find({})
            const Setup = await setup.find({})
            const StickyRoles = await stickyRoles.find({})
            const Welcome = await welcome.find({})

            const notActive = Active.filter(filter)
            const notAfk = Afk.filter(filter)
            const notDisabled = Disabled.filter(filter)
            const notMcIP = McIP.filter(filter)
            const notModules = Modules.filter(filter)
            const notPrefix = Prefix.filter(({ guild, global }) => !guilds.includes(guild) && !global)
            const notPolls = Polls.filter(filter)
            const notReactionRoles = ReactionRoles.filter(filter)
            const notRules = Rules.filter(filter)
            const notSetup = Setup.filter(filter)
            const notStickyRoles = StickyRoles.filter(filter)
            const notWelcome = Welcome.filter(filter)

            for (const doc of notActive) await doc.deleteOne()
            for (const doc of notAfk) await doc.deleteOne()
            for (const doc of notDisabled) await doc.deleteOne()
            for (const doc of notMcIP) await doc.deleteOne()
            for (const doc of notModules) await doc.deleteOne()
            for (const doc of notPrefix) await doc.deleteOne()
            for (const doc of notPolls) await doc.deleteOne()
            for (const doc of notReactionRoles) await doc.deleteOne()
            for (const doc of notRules) await doc.deleteOne()
            for (const doc of notSetup) await doc.deleteOne()
            for (const doc of notStickyRoles) await doc.deleteOne()
            for (const doc of notWelcome) await doc.deleteOne()

            console.log('Cleaned up guilds database')
        }

        fixGuildsData()
    }
}