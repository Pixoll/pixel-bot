/* eslint-disable no-unused-vars */
const { Message, GuildMember } = require('discord.js')
const { CommandoClient } = require('../../command-handler/typings')
const { sliceFileName } = require('../../utils')
/* eslint-enable no-unused-vars */

/**
 * This module manages button roles.
 * @param {CommandoClient} client
 */
module.exports = async (client) => {
    client.on('interactionCreate', async int => {
        if (!int.isButton()) return
        const { customId, channel } = int
        if (!customId.startsWith('button-role') || channel.type === 'DM') return

        client.emit('debug', `Running event "${sliceFileName(__filename)}#interactionCreate".`)

        /** @type {Message} */
        const message = int.message
        /** @type {GuildMember} */
        const member = int.member

        const roleId = customId.split(/:/g).pop()
        const role = await message.guild.roles.fetch(roleId)
        const hasRole = member.roles.cache.has(roleId)
        const action = hasRole ? 'removed from' : 'added to'

        let toggled
        if (hasRole) toggled = await member.roles.remove(roleId).catch(() => null)
        else toggled = await member.roles.add(roleId).catch(() => null)

        const content = toggled ? `You've been ${action} the \`${role.name}\` role.` :
            'An unnexpected error happened, please contact an admin of this server.'

        await int.reply({ content, ephemeral: true })
    })
}