/* eslint-disable no-unused-vars */
const { CommandoClient, CommandoMember } = require('../../command-handler/typings')
const { sliceFileName } = require('../../utils/functions')
/* eslint-enable no-unused-vars */

/**
 * Handles default roles for new members.
 * @param {CommandoClient} client
 */
module.exports = (client) => {
    client.on('guildMemberAdd', /** @param {CommandoMember} member */ async member => {
        const { guild, user, roles, id } = member
        if (id === client.user.id) return

        client.emit('debug', `Running event "${sliceFileName(__filename)}#guildMemberAdd".`)

        const data = await guild.database.setup.fetch()
        if (!data) return

        if (data.memberRole && !user.bot) await roles.add(data.memberRole).catch(() => null)
        if (data.botRole && user.bot) await roles.add(data.botRole).catch(() => null)
    })
}