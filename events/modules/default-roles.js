const { CommandoClient } = require('../../command-handler/typings')
const { setup } = require('../../mongo/schemas')
const { SetupSchema } = require('../../mongo/typings')

/**
 * Handles default roles for new members.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberAdd', async member => {
        const { guild, user, roles, id } = member
        if (id === client.user.id) return

        /** @type {SetupSchema} */
        const data = await setup.findOne({ guild: guild.id })
        if (!data) return

        if (data.memberRole && !user.bot) await roles.add(data.memberRole).catch(() => null)
        if (data.botRole && user.bot) await roles.add(data.botRole).catch(() => null)
    })

    client.emit('debug', 'Loaded modules/default-roles')
}